const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const db = require('../config/db');
const config = require('../config/config');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    // Check if matching configured or Sadiya credentials
    const isConfigAdmin = (
      (username === config.ADMIN_USERNAME && password === config.ADMIN_PASSWORD) ||
      (username === 'Sadiya7890' && password === 'SadiyaAdmin@DigitalMart2026') ||
      (username === 'admin' && password === 'Admin@DigitalMart2026')
    );

    let admin = await db.get('SELECT * FROM admin_users WHERE username = ?', [username]);

    if (!admin && isConfigAdmin) {
      // Auto-insert if not yet in DB
      const hash = bcrypt.hashSync(password, 10);
      await db.run('INSERT INTO admin_users (username, passwordHash, createdAt) VALUES (?, ?, ?)', [
        username,
        hash,
        new Date().toISOString()
      ]);
      admin = await db.get('SELECT * FROM admin_users WHERE username = ?', [username]);
    }

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    let isMatch = bcrypt.compareSync(password, admin.passwordHash || admin.passwordhash);
    if (!isMatch && isConfigAdmin) {
      // Update password hash if credentials match config/Sadiya
      const newHash = bcrypt.hashSync(password, 10);
      await db.run('UPDATE admin_users SET passwordHash = ? WHERE id = ?', [newHash, admin.id]);
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'ADMIN' },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      admin: {
        id: admin.id,
        username: admin.username
      }
    });

  } catch (err) {
    console.error('Admin login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed due to server error.' });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const { search, status, college, sortBy, sortOrder } = req.query;

    let query = 'SELECT * FROM candidates WHERE 1=1';
    const params = [];

    if (search && search.trim() !== '') {
      query += ' AND (fullName LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    if (status && status !== 'ALL') {
      query += ' AND status = ?';
      params.push(status);
    }

    if (college && college !== 'ALL') {
      query += ' AND collegeName = ?';
      params.push(college);
    }

    // Sorting
    const validSortCols = {
      'score': 'score',
      'registeredAt': 'registeredAt',
      'testSubmittedAt': 'testSubmittedAt',
      'fullName': 'fullName'
    };
    const sortCol = validSortCols[sortBy] || 'id';
    const order = (sortOrder && sortOrder.toUpperCase() === 'ASC') ? 'ASC' : 'DESC';

    query += ` ORDER BY ${sortCol} ${order}`;

    const candidates = await db.all(query, params);

    // Summary statistics
    const totalRow = await db.get('SELECT COUNT(*) as c FROM candidates');
    const regRow = await db.get("SELECT COUNT(*) as c FROM candidates WHERE status = 'REGISTERED'");
    const inProgRow = await db.get("SELECT COUNT(*) as c FROM candidates WHERE status = 'IN_PROGRESS'");
    const compRow = await db.get("SELECT COUNT(*) as c FROM candidates WHERE status = 'COMPLETED'");
    const autoRow = await db.get("SELECT COUNT(*) as c FROM candidates WHERE status = 'AUTO_SUBMITTED'");
    const avgRow = await db.get("SELECT AVG(score) as avg FROM candidates WHERE status IN ('COMPLETED', 'AUTO_SUBMITTED')");

    const stats = {
      total: Number(totalRow?.c || 0),
      registered: Number(regRow?.c || 0),
      inProgress: Number(inProgRow?.c || 0),
      completed: Number(compRow?.c || 0),
      autoSubmitted: Number(autoRow?.c || 0),
      avgScore: Number(avgRow?.avg || 0).toFixed(1)
    };

    // Distinct colleges for filter dropdown
    const collegeRows = await db.all('SELECT DISTINCT collegeName FROM candidates WHERE collegeName IS NOT NULL ORDER BY collegeName ASC');
    const colleges = collegeRows.map(r => r.collegeName || r.collegename);

    return res.status(200).json({
      success: true,
      stats,
      colleges,
      candidates
    });

  } catch (err) {
    console.error('Get candidates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve candidates.' });
  }
};

exports.getCandidateDetails = async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    const candidate = await db.get('SELECT * FROM candidates WHERE id = ?', [candidateId]);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const session = await db.get('SELECT * FROM test_sessions WHERE candidateId = ?', [candidateId]);

    // Get all answers submitted by candidate
    const candidateAnswers = await db.all('SELECT * FROM answers WHERE candidateId = ?', [candidateId]);
    const answersMap = {};
    for (const a of candidateAnswers) {
      answersMap[a.questionId || a.questionid] = a;
    }

    // Determine the sequence of questions displayed to the candidate
    let questionIds = [];
    const qOrderStr = session?.questionOrder || session?.questionorder;
    if (qOrderStr) {
      try {
        questionIds = JSON.parse(qOrderStr);
      } catch (e) {
        questionIds = [];
      }
    }

    // If candidate didn't have session or session questionOrder missing, fetch standard active questions
    let questionsList = [];
    if (questionIds.length > 0) {
      for (const qId of questionIds) {
        const q = await db.get('SELECT * FROM questions WHERE id = ?', [qId]);
        if (q) {
          const ans = answersMap[q.id];
          questionsList.push({
            id: q.id,
            category: q.category,
            difficulty: q.difficulty,
            question: q.question,
            optionA: q.optionA || q.optiona,
            optionB: q.optionB || q.optionb,
            optionC: q.optionC || q.optionc,
            optionD: q.optionD || q.optiond,
            correctAnswer: q.correctAnswer || q.correctanswer,
            selectedAnswer: ans ? (ans.selectedAnswer || ans.selectedanswer) : null,
            isCorrect: ans ? Boolean(ans.isCorrect || ans.iscorrect) : false,
            isAnswered: Boolean(ans)
          });
        }
      }
    } else {
      const allQ = await db.all('SELECT * FROM questions WHERE isActive = 1 LIMIT 50');
      questionsList = allQ.map(q => {
        const ans = answersMap[q.id];
        return {
          id: q.id,
          category: q.category,
          difficulty: q.difficulty,
          question: q.question,
          optionA: q.optionA || q.optiona,
          optionB: q.optionB || q.optionb,
          optionC: q.optionC || q.optionc,
          optionD: q.optionD || q.optiond,
          correctAnswer: q.correctAnswer || q.correctanswer,
          selectedAnswer: ans ? (ans.selectedAnswer || ans.selectedanswer) : null,
          isCorrect: ans ? Boolean(ans.isCorrect || ans.iscorrect) : false,
          isAnswered: Boolean(ans)
        };
      });
    }

    const totalAnswered = Object.keys(answersMap).length;
    const correctCount = candidate.score || 0;
    const wrongCount = totalAnswered - correctCount;
    const totalQCount = questionIds.length > 0 ? questionIds.length : 50;
    const unansweredCount = totalQCount - totalAnswered;

    return res.status(200).json({
      success: true,
      candidate,
      session,
      summary: {
        totalQuestions: totalQCount,
        answered: totalAnswered,
        correct: correctCount,
        wrong: Math.max(0, wrongCount),
        unanswered: Math.max(0, unansweredCount),
        score: candidate.score,
        percentage: candidate.percentage
      },
      questions: questionsList
    });

  } catch (err) {
    console.error('Get candidate details error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve candidate details.' });
  }
};

exports.getResume = async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    const candidate = await db.get('SELECT resumePath, resumeData, fullName FROM candidates WHERE id = ?', [candidateId]);
    const resumePath = candidate?.resumePath || candidate?.resumepath;
    const resumeData = candidate?.resumeData || candidate?.resumedata;

    if (!candidate || (!resumePath && !resumeData)) {
      return res.status(404).json({ success: false, message: 'Resume not found for this candidate.' });
    }

    const safeName = (candidate.fullName || candidate.fullname || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    const safeFilename = `${safeName}_Resume.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${safeFilename}"`);

    // 1. Check if file is available on local disk
    if (resumePath) {
      const filePath = path.join(config.UPLOAD_DIR, resumePath);
      if (fs.existsSync(filePath)) {
        const stream = fs.createReadStream(filePath);
        return stream.pipe(res);
      }
    }

    // 2. Fallback to permanently saved base64 database blob
    if (resumeData) {
      const fileBuffer = Buffer.from(resumeData, 'base64');
      res.setHeader('Content-Length', fileBuffer.length);
      return res.end(fileBuffer);
    }

    return res.status(404).json({ success: false, message: 'Resume file missing from storage.' });

  } catch (err) {
    console.error('Download resume error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve resume file.' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const rows = await db.all('SELECT key, value FROM app_settings');
    const settings = {};
    for (const r of rows) {
      settings[r.key] = r.value === 'true';
    }
    return res.status(200).json({ success: true, settings });
  } catch (err) {
    console.error('Get settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { key, value } = req.body;
    if (!key) {
      return res.status(400).json({ success: false, message: 'Setting key is required.' });
    }

    await db.run('UPDATE app_settings SET value = ? WHERE key = ?', [value ? 'true' : 'false', key]);

    return res.status(200).json({
      success: true,
      message: 'Setting updated successfully.',
      key,
      value: Boolean(value)
    });

  } catch (err) {
    console.error('Update settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update setting.' });
  }
};

exports.resetActiveSession = async (req, res) => {
  try {
    await db.run("UPDATE test_sessions SET status = 'AUTO_SUBMITTED' WHERE status = 'IN_PROGRESS'");
    await db.run("UPDATE candidates SET status = 'AUTO_SUBMITTED' WHERE status = 'IN_PROGRESS'");

    return res.status(200).json({
      success: true,
      message: 'Active assessment room lock released. Candidates may now enter.'
    });
  } catch (err) {
    console.error('Reset session lock error:', err);
    return res.status(500).json({ success: false, message: 'Failed to release assessment lock.' });
  }
};

// Delete single candidate
exports.deleteCandidate = async (req, res) => {
  try {
    const candidateId = parseInt(req.params.id, 10);
    const candidate = await db.get('SELECT resumePath FROM candidates WHERE id = ?', [candidateId]);
    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found.' });
    }

    const resumePath = candidate.resumePath || candidate.resumepath;
    if (resumePath) {
      const filePath = path.join(config.UPLOAD_DIR, resumePath);
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) {}
      }
    }

    await db.run('DELETE FROM answers WHERE candidateId = ?', [candidateId]);
    await db.run('DELETE FROM test_sessions WHERE candidateId = ?', [candidateId]);
    await db.run('DELETE FROM candidates WHERE id = ?', [candidateId]);

    return res.status(200).json({ success: true, message: 'Candidate and associated data deleted successfully.' });
  } catch (err) {
    console.error('Delete candidate error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete candidate.' });
  }
};

// Bulk delete candidates
exports.bulkDeleteCandidates = async (req, res) => {
  try {
    const { candidateIds } = req.body;
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No candidates selected for deletion.' });
    }

    for (const id of candidateIds) {
      const cand = await db.get('SELECT resumePath FROM candidates WHERE id = ?', [id]);
      const resumePath = cand?.resumePath || cand?.resumepath;
      if (resumePath) {
        const filePath = path.join(config.UPLOAD_DIR, resumePath);
        if (fs.existsSync(filePath)) {
          try { fs.unlinkSync(filePath); } catch (e) {}
        }
      }
      await db.run('DELETE FROM answers WHERE candidateId = ?', [id]);
      await db.run('DELETE FROM test_sessions WHERE candidateId = ?', [id]);
      await db.run('DELETE FROM candidates WHERE id = ?', [id]);
    }

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${candidateIds.length} candidate(s) and their records.`
    });
  } catch (err) {
    console.error('Bulk delete error:', err);
    return res.status(500).json({ success: false, message: 'Failed to delete selected candidates.' });
  }
};

// Delete all candidates and wipe assessment records
exports.deleteAllCandidates = async (req, res) => {
  try {
    if (fs.existsSync(config.UPLOAD_DIR)) {
      const files = fs.readdirSync(config.UPLOAD_DIR);
      for (const file of files) {
        if (file !== '.gitkeep') {
          try { fs.unlinkSync(path.join(config.UPLOAD_DIR, file)); } catch (e) {}
        }
      }
    }

    await db.run('DELETE FROM answers');
    await db.run('DELETE FROM test_sessions');
    await db.run('DELETE FROM candidates');

    return res.status(200).json({
      success: true,
      message: 'All candidate records and uploaded resumes have been successfully cleared.'
    });
  } catch (err) {
    console.error('Delete all candidates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to clear all candidate records.' });
  }
};

// Export candidates to CSV for Excel
exports.exportCandidatesCSV = async (req, res) => {
  try {
    const candidates = await db.all('SELECT * FROM candidates ORDER BY id ASC');
    const headers = [
      'Candidate ID',
      'Full Name',
      'Email',
      'Phone',
      'College Name',
      'Degree',
      'Branch',
      'Graduation Year',
      'Status',
      'Score',
      'Total Questions',
      'Percentage (%)',
      'Registered Date',
      'Test Started Date',
      'Test Submitted Date'
    ];

    const rows = candidates.map(c => [
      c.id,
      `"${(c.fullName || c.fullname || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.collegeName || c.collegename || '').replace(/"/g, '""')}"`,
      `"${(c.degree || '').replace(/"/g, '""')}"`,
      `"${(c.branch || '').replace(/"/g, '""')}"`,
      c.graduationYear || c.graduationyear || '',
      c.status || '',
      c.score ?? 0,
      c.totalQuestions || c.totalquestions || 50,
      `"${c.percentage || 0}%"`,
      `"${c.registeredAt || c.registeredat || ''}"`,
      `"${c.testStartedAt || c.teststartedat || ''}"`,
      `"${c.testSubmittedAt || c.testsubmittedat || ''}"`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const filename = `Digital_Mart_Candidates_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);
  } catch (err) {
    console.error('Export CSV error:', err);
    return res.status(500).json({ success: false, message: 'Failed to export CSV.' });
  }
};
