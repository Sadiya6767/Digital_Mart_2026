import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, CheckSquare, Loader2, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import TabWarningModal from '../components/TabWarningModal';
import { api } from '../services/api';

const SECONDS_PER_QUESTION = 15;

export default function TestPage() {
  const navigate = useNavigate();

  const candidateId = sessionStorage.getItem('dm_candidate_id');
  const candidateName = sessionStorage.getItem('dm_candidate_name') || 'Candidate';

  const [loading, setLoading] = useState(true);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(40);
  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // 15-second silent per-question timer (runs in background)
  const [questionSeconds, setQuestionSeconds] = useState(SECONDS_PER_QUESTION);
  const questionTimerRef = useRef(null);

  // Modals & Anti-cheat
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);

  // Selected option ref to read current value inside interval callbacks
  const selectedOptionRef = useRef(null);
  selectedOptionRef.current = selectedOption;

  const currentNumberRef = useRef(1);
  currentNumberRef.current = currentNumber;

  const totalQuestionsRef = useRef(40);
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
      setTotalQuestions(res.totalQuestions || 40);

      await loadQuestion(qNum);

    } catch (err) {
      console.error('Session initialization error:', err);
      setErrorMsg('Network error connecting to assessment server.');
    } finally {
      setLoading(false);
    }
  };

  // Start 5-second per-question countdown
  const startQuestionTimer = () => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    setQuestionSeconds(SECONDS_PER_QUESTION);

    questionTimerRef.current = setInterval(() => {
      setQuestionSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current);
          // Time up for this question: auto advance!
          autoAdvanceQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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

  // Select Option
  const handleSelectOption = async (optionKey) => {
    setSelectedOption(optionKey);
    setErrorMsg('');

    try {
      await api.saveAnswer(candidateId, currentNumber, optionKey);
    } catch (err) {
      console.warn('Silent save answer error:', err);
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

          {/* Visual Progress Bar */}
          <div className="progress-track">
            <div 
              className="progress-fill" 
              style={{ width: `${(currentNumber / totalQuestions) * 100}%` }}
            />
          </div>

          {errorMsg && (
            <div className="alert-banner alert-danger">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Question Details */}
          {questionData && (
            <div>
              <div className="question-meta" style={{ marginBottom: '14px' }}>
                <span className={`category-tag ${questionData.category === 'WEB_DEVELOPMENT' ? 'tag-web' : 'tag-biz'}`}>
                  {questionData.category === 'WEB_DEVELOPMENT' ? 'Web Development' : 'Business Development'}
                </span>
              </div>

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
                  {selectedOption && (
                    <span style={{ color: '#16a34a', fontWeight: '600' }}>
                      &bull; Option {selectedOption} selected
                    </span>
                  )}
                </div>

                <div>
                  {currentNumber < totalQuestions ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                      disabled={submitting}
                    >
                      <span>Next</span>
                      <ArrowRight size={18} />
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
