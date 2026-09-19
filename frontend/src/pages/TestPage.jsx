import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, CheckSquare, Loader2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import TabWarningModal from '../components/TabWarningModal';
import { api } from '../services/api';

const SECONDS_PER_QUESTION = 15;
const TOTAL_QUESTION_TIME_MS = 15000;

export default function TestPage() {
  const navigate = useNavigate();

  const candidateId = sessionStorage.getItem('dm_candidate_id');
  const candidateName = sessionStorage.getItem('dm_candidate_name') || 'Candidate';

  const [loading, setLoading] = useState(true);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(50);
  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 15-second running line timer
  const [timeLeftMs, setTimeLeftMs] = useState(TOTAL_QUESTION_TIME_MS);
  const questionTimerRef = useRef(null);

  // Modals & Anti-cheat
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Selected option ref to read current value inside interval callbacks
  const selectedOptionRef = useRef(null);
  selectedOptionRef.current = selectedOption;

  const currentNumberRef = useRef(1);
  currentNumberRef.current = currentNumber;

  const totalQuestionsRef = useRef(50);
  totalQuestionsRef.current = totalQuestions;

  // Redirect if not registered
  useEffect(() => {
    if (!candidateId) {
      navigate('/');
      return;
    }

    initSession();

    // Tab switch listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setShowTabWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [candidateId]);

  // Sync session and start authoritative flow
  const initSession = async () => {
    try {
      setLoading(true);
      const res = await api.getSession(candidateId);

      if (!res.success) {
        if (res.status === 'COMPLETED' || res.status === 'AUTO_SUBMITTED') {
          navigate('/result');
          return;
        }
        setErrorMsg(res.message || 'Unable to retrieve assessment session.');
        setLoading(false);
        return;
      }

      if (res.status === 'COMPLETED' || res.status === 'AUTO_SUBMITTED') {
        navigate('/result');
        return;
      }

      const qNum = res.currentQuestion || 1;
      setCurrentNumber(qNum);
      setTotalQuestions(res.totalQuestions || 50);

      await loadQuestion(qNum);

    } catch (err) {
      console.error('Session initialization error:', err);
      setErrorMsg('Network error connecting to assessment server.');
    } finally {
      setLoading(false);
    }
  };

  // Start 15-second per-question line timer with 100ms resolution
  const startQuestionTimer = () => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    setTimeLeftMs(TOTAL_QUESTION_TIME_MS);

    const startTime = Date.now();
    questionTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, TOTAL_QUESTION_TIME_MS - elapsed);
      setTimeLeftMs(remaining);

      if (remaining <= 0) {
        clearInterval(questionTimerRef.current);
        // Time up for this question: auto advance!
        autoAdvanceQuestion();
      }
    }, 100);
  };

  const autoAdvanceQuestion = async () => {
    const curr = currentNumberRef.current;
    const total = totalQuestionsRef.current;
    const currentSelected = selectedOptionRef.current;

    try {
      if (currentSelected) {
        await api.saveAnswer(candidateId, curr, currentSelected);
      } else {
        await api.saveAnswer(candidateId, curr, null);
      }

      if (curr < total) {
        const nextNum = curr + 1;
        setCurrentNumber(nextNum);
        setSelectedOption(null);
        await loadQuestion(nextNum);
      } else {
        // Last question expired: auto submit!
        handleAutoSubmit();
      }
    } catch (err) {
      console.error('Auto advance error:', err);
    }
  };

  const loadQuestion = async (qNum) => {
    try {
      setErrorMsg('');
      const res = await api.getQuestion(candidateId, qNum);

      if (!res.success) {
        if (res.code === 'TEST_EXPIRED') {
          handleAutoSubmit();
          return;
        }
        setErrorMsg(res.message || 'Could not load question.');
        return;
      }

      setQuestionData(res.question);
      setSelectedOption(res.question.selectedOption || null);

      // Start 5-second countdown for the newly loaded question
      startQuestionTimer();

    } catch (err) {
      console.error('Load question error:', err);
      setErrorMsg('Failed to load question.');
    }
  };

  // Select Option & Auto-Advance to Next Question ("click karte hi next par khud chala jaye")
  const handleSelectOption = async (optionKey) => {
    if (submitting) return; // Prevent duplicate clicks
    setSelectedOption(optionKey);
    selectedOptionRef.current = optionKey;
    setErrorMsg('');

    // Stop 15-second line timer
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    try {
      setSubmitting(true);
      await api.saveAnswer(candidateId, currentNumber, optionKey);

      // Brief 200ms visual confirmation before automatically loading the next question
      setTimeout(async () => {
        const curr = currentNumberRef.current;
        const total = totalQuestionsRef.current;

        if (curr < total) {
          const nextNum = curr + 1;
          setCurrentNumber(nextNum);
          setSelectedOption(null);
          await loadQuestion(nextNum);
          setSubmitting(false);
        } else {
          // Last question: open confirmation modal to finalize submission
          setSubmitting(false);
          setShowSubmitModal(true);
        }
      }, 200);

    } catch (err) {
      console.warn('Error saving answer on auto-advance:', err);
      setSubmitting(false);
    }
  };

  // Move to Next Question (allows next even if no option selected!)
  const handleNext = async () => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    try {
      setSubmitting(true);
      // Save answer if selected, or null if skipped
      await api.saveAnswer(candidateId, currentNumber, selectedOption || null);

      if (currentNumber < totalQuestions) {
        const nextNum = currentNumber + 1;
        setCurrentNumber(nextNum);
        setSelectedOption(null);
        await loadQuestion(nextNum);
      } else {
        // Last question: show confirmation modal
        setShowSubmitModal(true);
      }
    } catch (err) {
      console.error('Error proceeding to next:', err);
      setErrorMsg('Failed to save progress. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Manual Submission
  const handleConfirmSubmit = async () => {
    setShowSubmitModal(false);
    setSubmitting(true);
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);

    try {
      const res = await api.submitTest(candidateId, false);
      if (res.success) {
        sessionStorage.setItem('dm_submission_info', JSON.stringify(res));
        navigate('/result');
      } else {
        setErrorMsg(res.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      console.error('Submit test error:', err);
      setErrorMsg('Error submitting test.');
    } finally {
      setSubmitting(false);
    }
  };

  // Auto Submission
  const handleAutoSubmit = async () => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    setSubmitting(true);

    try {
      const res = await api.submitTest(candidateId, true);
      sessionStorage.setItem('dm_submission_info', JSON.stringify(res));
      navigate('/result');
    } catch (err) {
      console.error('Auto submit error:', err);
      navigate('/result');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="page-container" style={{ alignItems: 'center' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Loader2 size={40} color="#1d4ed8" className="animate-spin" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontWeight: '600', color: '#1e293b' }}>Loading Assessment Question...</p>
          </div>
        </div>
      </>
    );
  }

  const remainingSec = Math.ceil(timeLeftMs / 1000);
  let timerLineClass = 'timer-green-line';
  let timerBadgeClass = 'timer-green-badge';
  if (remainingSec <= 4) {
    timerLineClass = 'timer-red-line';
    timerBadgeClass = 'timer-red-badge';
  } else if (remainingSec <= 8) {
    timerLineClass = 'timer-orange-line';
    timerBadgeClass = 'timer-orange-badge';
  }
  const linePercent = Math.max(0, Math.min(100, (timeLeftMs / TOTAL_QUESTION_TIME_MS) * 100));

  return (
    <>
      <Header />

      <div className="page-container">
        <div className="content-card question-card">
          {/* Top Bar: Question Progress */}
          <div className="test-header-bar">
            <div>
              <div className="test-progress-info">
                Question {currentNumber} of {totalQuestions}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Candidate: {candidateName}
              </div>
            </div>
          </div>

          {/* Visual Progress Bar (Overall) */}
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentNumber / totalQuestions) * 100}%` }}
            />
          </div>

          {/* 15-Second Running Question Timer Line */}
          <div className="question-timer-wrapper">
            <div className="question-timer-top">
              <div className="question-timer-label">
                <Clock size={15} />
                <span>Time Remaining</span>
              </div>
              <div className={`question-timer-badge ${timerBadgeClass}`}>
                {remainingSec}s
              </div>
            </div>
            <div className="question-timer-track">
              <div 
                className={`question-timer-line ${timerLineClass}`}
                style={{ width: `${linePercent}%` }}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="alert-banner alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Question Details (Clean display without category badges) */}
          {questionData && (
            <div>
              <div className="question-text">
                {questionData.question}
              </div>

              {/* Shuffled Options */}
              <div className="options-grid">
                {['A', 'B', 'C', 'D'].map((optKey) => {
                  const optionText = questionData.options[optKey];
                  const isSelected = selectedOption === optKey;

                  return (
                    <div
                      key={optKey}
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleSelectOption(optKey)}
                    >
                      <div className="option-indicator">
                        {optKey}
                      </div>
                      <div className="option-content">
                        {optionText}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Actions */}
              <div className="test-footer-actions">
                <div style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  {selectedOption ? (
                    <span style={{ color: '#16a34a', fontWeight: '600' }}>
                      &bull; Option {selectedOption} chosen &mdash; moving to next question...
                    </span>
                  ) : (
                    <span style={{ color: '#64748b' }}>
                      Click an option to automatically advance, or click Skip Question.
                    </span>
                  )}
                </div>

                <div>
                  {currentNumber < totalQuestions ? (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleNext}
                      disabled={submitting}
                      style={{ fontSize: '0.875rem', padding: '9px 18px' }}
                    >
                      <span>Skip Question</span>
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setShowSubmitModal(true)}
                      disabled={submitting}
                      style={{ backgroundColor: '#15803d' }}
                    >
                      <CheckSquare size={18} />
                      <span>Submit Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal on Submit */}
      <Modal
        isOpen={showSubmitModal}
        title="Submit Assessment?"
        confirmText="Yes, Submit Test"
        cancelText="Review Current Question"
        confirmVariant="primary"
        onCancel={() => setShowSubmitModal(false)}
        onConfirm={handleConfirmSubmit}
      >
        <p style={{ fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
          Are you sure you want to submit the test?
        </p>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          You will not be able to change your answers after submission. Your responses will be finalized.
        </p>
      </Modal>

      {/* Non-invasive Tab Switching Warning */}
      <TabWarningModal
        isOpen={showTabWarning}
        onClose={() => setShowTabWarning(false)}
      />
    </>
  );
}
