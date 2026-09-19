const crypto = require('crypto');
const db = require('../config/db');

// In-memory cache for questions to guarantee ultra-fast 0ms latency for 100+ concurrent students
let cachedQuestions = null;
let lastCacheTime = 0;

async function getCachedQuestions() {
  const now = Date.now();
  if (cachedQuestions && cachedQuestions.length >= 50 && (now - lastCacheTime < 10 * 60 * 1000)) {
    return cachedQuestions;
  }
  const all = await db.all('SELECT * FROM questions WHERE isActive = 1');
  if (all && all.length > 0) {
    cachedQuestions = all;
    lastCacheTime = now;
  }
  return cachedQuestions || [];
}

// Cryptographically secure Fisher-Yates array shuffle utility
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Helper to auto submit an expired test
async function autoSubmitTest(candidateId) {
  const now = new Date().toISOString();
  
  // Calculate score
  const scoreRow = await db.get('SELECT COUNT(*) as correctCount FROM answers WHERE candidateId = ? AND isCorrect = 1', [candidateId]);
  const score = Number(scoreRow?.correctCount || scoreRow?.correctcount || 0);
  const total = 50;
  const percentage = Math.round((score / total) * 100 * 100) / 100;

  // Update candidate
  await db.run(`
    UPDATE candidates 
    SET status = 'AUTO_SUBMITTED', testSubmittedAt = ?, score = ?, percentage = ?
    WHERE id = ?
  `, [now, score, percentage, candidateId]);

  // Update session
  await db.run(`
    UPDATE test_sessions
    SET status = 'AUTO_SUBMITTED'
    WHERE candidateId = ?
  `, [candidateId]);

  return { score, percentage, status: 'AUTO_SUBMITTED', submittedAt: now };
}

exports.startTest = async (req, res) => {
  try {
    const { candidateId } = req.body;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate record not found.' });
    }

    if (candidate.status === 'COMPLETED' || candidate.status === 'AUTO_SUBMITTED') {
      return res.status(400).json({
        success: false,
        code: 'TEST_ALREADY_SUBMITTED',
        message: 'You have already submitted this assessment.'
      });
    }

    // High Concurrency Mode (100+ students supported simultaneously):
    // Check if session already exists for THIS candidate (allow resume on page refresh)
    const existingSession = await db.get('SELECT * FROM test_sessions WHERE candidateId = ?', [candidateId]);

    if (existingSession) {
      const sessionEndTime = existingSession.endTime || existingSession.endtime;
      const sessionCurrQ = existingSession.currentQuestion || existingSession.currentquestion || 1;
      const candName = candidate.fullName || candidate.fullname || 'Candidate';
      const now = new Date();
      const endTime = sessionEndTime ? new Date(sessionEndTime) : new Date();
      const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

      if (remainingSeconds <= 0 && existingSession.status === 'IN_PROGRESS') {
        await autoSubmitTest(candidateId);
        return res.status(200).json({
          success: true,
          status: 'AUTO_SUBMITTED',
          message: 'Test time has expired and the test was automatically submitted.',
          remainingSeconds: 0
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Resuming existing test session.',
        session: {
          candidateId: candidate.id,
          candidateName: candName,
          currentQuestion: sessionCurrQ,
          totalQuestions: 50,
          remainingSeconds,
          status: existingSession.status,
          endTime: sessionEndTime
        }
      });
    }

    // New Session Creation for Candidate
    // 1. Fetch questions from ultra-fast cache
    const allQuestions = await getCachedQuestions();
    if (allQuestions.length < 50) {
      return res.status(500).json({ success: false, message: 'Insufficient questions in the assessment bank.' });
    }

    // 2. Separate into Web Dev (30) and Biz Dev (20)
    const webQuestions = allQuestions.filter(q => (q.category || '').toUpperCase() === 'WEB_DEVELOPMENT');
    const bizQuestions = allQuestions.filter(q => (q.category || '').toUpperCase() === 'BUSINESS_DEVELOPMENT');

    // Cryptographically shuffle each category independently
    const shuffledWeb = shuffleArray(webQuestions).slice(0, 30);
    const shuffledBiz = shuffleArray(bizQuestions).slice(0, 20);

    // Combine and shuffle the entire 50 questions uniquely for this candidate
    const candidateQuestions = shuffleArray([...shuffledWeb, ...shuffledBiz]);
    const questionOrder = candidateQuestions.map(q => q.id);

    // 3. Shuffle options for each question uniquely and store mapping
    const optionOrders = {};
    for (const q of candidateQuestions) {
      const origOptions = [
        { key: 'A', text: q.optionA ?? q.optiona },
        { key: 'B', text: q.optionB ?? q.optionb },
        { key: 'C', text: q.optionC ?? q.optionc },
        { key: 'D', text: q.optionD ?? q.optiond }
      ];
      // Cryptographically shuffle the 4 options
      const shuffledOptions = shuffleArray(origOptions);
      
      // Mapping: candidate's option key -> original question's option key
      optionOrders[q.id] = {
        'A': shuffledOptions[0].key,
        'B': shuffledOptions[1].key,
        'C': shuffledOptions[2].key,
        'D': shuffledOptions[3].key
      };
    }

    // 4. Set duration: 15 minutes (50 questions x 15s = 12.5 mins + 2.5 mins buffer)
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 15 * 60 * 1000);

    await db.run(`
      INSERT INTO test_sessions (
        candidateId, questionOrder, optionOrders, currentQuestion,
        startTime, endTime, status
      ) VALUES (?, ?, ?, 1, ?, ?, 'IN_PROGRESS')
    `, [
      candidateId,
      JSON.stringify(questionOrder),
      JSON.stringify(optionOrders),
      startTime.toISOString(),
      endTime.toISOString()
    ]);

    // Update candidate status
    await db.run(`
      UPDATE candidates 
      SET status = 'IN_PROGRESS', testStartedAt = ?
      WHERE id = ?
    `, [startTime.toISOString(), candidateId]);

    return res.status(201).json({
      success: true,
      message: 'Assessment started successfully.',
      session: {
        candidateId: candidate.id,
        candidateName: candidate.fullName,
        currentQuestion: 1,
        totalQuestions: 50,
        remainingSeconds: 15 * 60,
        status: 'IN_PROGRESS',
        endTime: endTime.toISOString()
      }
    });

  } catch (err) {
    console.error('Start test error:', err);
    return res.status(500).json({ success: false, message: 'Failed to start assessment.' });
  }
};

exports.getSession = async (req, res) => {
  try {
    const candidateId = parseInt(req.params.candidateId, 10);
    const candidate = await db.get('SELECT id, fullName, email, status FROM candidates WHERE id = ?', [candidateId]);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const session = await db.get('SELECT * FROM test_sessions WHERE candidateId = ?', [candidateId]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'No active assessment session found.' });
    }

    const sessionEndTime = session.endTime || session.endtime;
    const sessionCurrQ = session.currentQuestion || session.currentquestion || 1;
    const sessionStatus = session.status || 'IN_PROGRESS';
    const candName = candidate.fullName || candidate.fullname || 'Candidate';

    const now = new Date();
    const endTime = sessionEndTime ? new Date(sessionEndTime) : new Date(Date.now() + 15 * 60 * 1000);
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

    if (remainingSeconds <= 0 && sessionStatus === 'IN_PROGRESS') {
      await autoSubmitTest(candidateId);
      return res.status(200).json({
        success: true,
        status: 'AUTO_SUBMITTED',
        remainingSeconds: 0,
        candidateName: candName,
        currentQuestion: sessionCurrQ,
        totalQuestions: 50
      });
    }

    return res.status(200).json({
      success: true,
      candidateId: candidate.id,
      candidateName: candName,
      currentQuestion: sessionCurrQ,
      totalQuestions: 50,
      remainingSeconds,
      status: sessionStatus,
      endTime: sessionEndTime
    });

  } catch (err) {
    console.error('Get session error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch session.' });
  }
};

exports.getQuestion = async (req, res) => {
  try {
    const candidateId = parseInt(req.params.candidateId, 10);
    const questionNumber = parseInt(req.params.questionNumber, 10);

    const session = await db.get('SELECT * FROM test_sessions WHERE candidateId = ?', [candidateId]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Assessment session not found.' });
    }

    const sessionEndTime = session.endTime || session.endtime;
    const qOrderRaw = session.questionOrder || session.questionorder;
    const optOrdersRaw = session.optionOrders || session.optionorders;

    // Check timer
    const now = new Date();
    const endTime = sessionEndTime ? new Date(sessionEndTime) : new Date(Date.now() + 15 * 60 * 1000);
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

    if (remainingSeconds <= 0) {
      await autoSubmitTest(candidateId);
      return res.status(400).json({
        success: false,
        code: 'TEST_EXPIRED',
        message: 'Assessment time has expired.'
      });
    }

    let questionOrder = [];
    let optionOrders = {};
    try {
      questionOrder = typeof qOrderRaw === 'string' ? JSON.parse(qOrderRaw) : (qOrderRaw || []);
      optionOrders = typeof optOrdersRaw === 'string' ? JSON.parse(optOrdersRaw) : (optOrdersRaw || {});
    } catch (parseErr) {
      console.error('Session JSON parse error:', parseErr);
      return res.status(500).json({ success: false, message: 'Invalid session question data.' });
    }

    if (questionNumber < 1 || questionNumber > questionOrder.length) {
      return res.status(400).json({ success: false, message: 'Invalid question number.' });
    }

    const questionId = questionOrder[questionNumber - 1];

    // Fetch question from ultra-fast in-memory cache or DB
    const allQ = await getCachedQuestions();
    let rawQuestion = allQ.find(q => Number(q.id) === Number(questionId));
    if (!rawQuestion) {
      rawQuestion = await db.get(`
        SELECT id, category, question, optionA, optionB, optionC, optionD, difficulty
        FROM questions
        WHERE id = ?
      `, [questionId]);
    }

    if (!rawQuestion) {
      return res.status(404).json({ success: false, message: 'Question not found.' });
    }

    const optA = rawQuestion.optionA ?? rawQuestion.optiona ?? '';
    const optB = rawQuestion.optionB ?? rawQuestion.optionb ?? '';
    const optC = rawQuestion.optionC ?? rawQuestion.optionc ?? '';
    const optD = rawQuestion.optionD ?? rawQuestion.optiond ?? '';

    // Reconstruct shuffled options for this candidate
    const mapping = optionOrders[questionId] || optionOrders[String(questionId)] || { 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D' };
    const origOptions = {
      'A': optA,
      'B': optB,
      'C': optC,
      'D': optD
    };

    const displayOptions = {
      'A': origOptions[mapping['A']] || optA,
      'B': origOptions[mapping['B']] || optB,
      'C': origOptions[mapping['C']] || optC,
      'D': origOptions[mapping['D']] || optD
    };

    // Check if previously answered
    const savedAnswer = await db.get('SELECT selectedAnswer FROM answers WHERE candidateId = ? AND questionId = ?', [candidateId, questionId]);
    let selectedOptionForStudent = null;
    const savedSelected = savedAnswer?.selectedAnswer ?? savedAnswer?.selectedanswer;
    if (savedSelected) {
      for (const [key, origKey] of Object.entries(mapping)) {
        if (origKey === savedSelected) {
          selectedOptionForStudent = key;
          break;
        }
      }
    }

    return res.status(200).json({
      success: true,
      questionNumber,
      totalQuestions: questionOrder.length,
      remainingSeconds,
      question: {
        id: rawQuestion.id,
        category: rawQuestion.category,
        question: rawQuestion.question,
        options: displayOptions,
        difficulty: rawQuestion.difficulty,
        selectedOption: selectedOptionForStudent
      }
    });

  } catch (err) {
    console.error('Get question error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch question.' });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { candidateId, questionNumber, selectedOption } = req.body;

    if (!candidateId || !questionNumber) {
      return res.status(400).json({ success: false, message: 'candidateId and questionNumber are required.' });
    }

    const session = await db.get('SELECT * FROM test_sessions WHERE candidateId = ?', [candidateId]);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    const sessionEndTime = session.endTime || session.endtime;
    const qOrderRaw = session.questionOrder || session.questionorder;
    const optOrdersRaw = session.optionOrders || session.optionorders;
    const sessionCurrQ = session.currentQuestion || session.currentquestion || 1;

    // Check timer
    const now = new Date();
    const endTime = sessionEndTime ? new Date(sessionEndTime) : new Date(Date.now() + 15 * 60 * 1000);
    const remainingSeconds = Math.max(0, Math.floor((endTime - now) / 1000));

    if (remainingSeconds <= 0) {
      await autoSubmitTest(candidateId);
      return res.status(400).json({
        success: false,
        code: 'TEST_EXPIRED',
        message: 'Assessment time has expired and your test was submitted automatically.'
      });
    }

    let questionOrder = [];
    let optionOrders = {};
    try {
      questionOrder = typeof qOrderRaw === 'string' ? JSON.parse(qOrderRaw) : (qOrderRaw || []);
      optionOrders = typeof optOrdersRaw === 'string' ? JSON.parse(optOrdersRaw) : (optOrdersRaw || {});
    } catch (parseErr) {
      console.error('Session JSON parse error:', parseErr);
      return res.status(500).json({ success: false, message: 'Invalid session data.' });
    }

    const questionId = questionOrder[questionNumber - 1];
    if (!questionId) {
      return res.status(400).json({ success: false, message: 'Invalid question number.' });
    }

    // If candidate skipped or selected nothing
    if (!selectedOption) {
      const nextQuestion = Math.min(50, Math.max(sessionCurrQ, questionNumber + 1));
      await db.run('UPDATE test_sessions SET currentQuestion = ? WHERE candidateId = ?', [nextQuestion, candidateId]);

      return res.status(200).json({
        success: true,
        message: 'Question skipped / no answer selected.',
        currentQuestion: nextQuestion,
        remainingSeconds
      });
    }

    // Look up original key
    const mapping = optionOrders[questionId] || optionOrders[String(questionId)] || { 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D' };
    const originalAnswerKey = mapping ? mapping[selectedOption] : null;

    if (!originalAnswerKey) {
      return res.status(400).json({ success: false, message: 'Invalid option selected.' });
    }

    // Check correctness via cache or DB
    const allQ = await getCachedQuestions();
    let question = allQ.find(q => Number(q.id) === Number(questionId));
    if (!question) {
      question = await db.get('SELECT correctAnswer FROM questions WHERE id = ?', [questionId]);
    }
    const correctAns = question?.correctAnswer || question?.correctanswer;
    const isCorrect = (correctAns === originalAnswerKey) ? 1 : 0;

    // Save answer (works identically in SQLite and PostgreSQL with ON CONFLICT)
    await db.run(`
      INSERT INTO answers (candidateId, questionId, selectedAnswer, isCorrect, answeredAt)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(candidateId, questionId) DO UPDATE SET
        selectedAnswer = excluded.selectedAnswer,
        isCorrect = excluded.isCorrect,
        answeredAt = excluded.answeredAt
    `, [
      candidateId,
      questionId,
      originalAnswerKey,
      isCorrect,
      new Date().toISOString()
    ]);

    // Update current question in session
    const nextQuestion = Math.min(50, Math.max(sessionCurrQ, questionNumber + 1));
    await db.run('UPDATE test_sessions SET currentQuestion = ? WHERE candidateId = ?', [nextQuestion, candidateId]);

    return res.status(200).json({
      success: true,
      message: 'Answer recorded successfully.',
      currentQuestion: nextQuestion,
      remainingSeconds
    });

  } catch (err) {
    console.error('Submit answer error:', err);
    return res.status(500).json({ success: false, message: 'Failed to record answer.' });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { candidateId, isAuto } = req.body;
    if (!candidateId) {
      return res.status(400).json({ success: false, message: 'Candidate ID is required.' });
    }

    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const candName = candidate.fullName || candidate.fullname || 'Candidate';
    const candStatus = candidate.status;
    const candSubmittedAt = candidate.testSubmittedAt || candidate.testsubmittedat;

    if (candStatus === 'COMPLETED' || candStatus === 'AUTO_SUBMITTED') {
      return res.status(200).json({
        success: true,
        message: 'Assessment already submitted.',
        status: candStatus,
        submittedAt: candSubmittedAt,
        candidateName: candName
      });
    }

    const finalStatus = isAuto ? 'AUTO_SUBMITTED' : 'COMPLETED';
    const now = new Date().toISOString();

    // Calculate score
    const scoreRow = await db.get('SELECT COUNT(*) as correctCount FROM answers WHERE candidateId = ? AND isCorrect = 1', [candidateId]);
    const score = Number(scoreRow?.correctCount || scoreRow?.correctcount || 0);
    const total = 50;
    const percentage = Math.round((score / total) * 100 * 100) / 100;

    // Update candidate
    await db.run(`
      UPDATE candidates
      SET status = ?, testSubmittedAt = ?, score = ?, percentage = ?
      WHERE id = ?
    `, [finalStatus, now, score, percentage, candidateId]);

    // Update session
    await db.run('UPDATE test_sessions SET status = ? WHERE candidateId = ?', [finalStatus, candidateId]);

    // Check setting for SHOW_STUDENT_SCORE
    const scoreSetting = await db.get("SELECT value FROM app_settings WHERE key = 'SHOW_STUDENT_SCORE'");
    const showScore = scoreSetting?.value === 'true';

    return res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully.',
      candidateName: candName,
      status: finalStatus,
      submittedAt: now,
      score: showScore ? score : undefined,
      totalQuestions: 50
    });

  } catch (err) {
    console.error('Submit test error:', err);
    return res.status(500).json({ success: false, message: 'Failed to submit assessment.' });
  }
};
