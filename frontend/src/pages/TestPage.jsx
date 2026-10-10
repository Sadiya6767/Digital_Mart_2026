import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowRight, CheckSquare, Loader2, AlertCircle, Maximize2, ShieldAlert } from 'lucide-react';
import Header from '../components/Header';
import Modal from '../components/Modal';
import TabWarningModal from '../components/TabWarningModal';
import { api } from '../services/api';

const SECONDS_PER_QUESTION = 60;
const TOTAL_QUESTION_TIME_MS = 60000;

export default function TestPage() {
  const navigate = useNavigate();

  const candidateId = sessionStorage.getItem('dm_candidate_id');
  const candidateName = sessionStorage.getItem('dm_candidate_name') || 'Candidate';
  const [jobProfile, setJobProfile] = useState(sessionStorage.getItem('dm_job_profile') || 'Web Development');

  const [loading, setLoading] = useState(true);
  const [currentNumber, setCurrentNumber] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [questionData, setQuestionData] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Overall 30-Minute Test Countdown Timer
  const [overallRemainingSec, setOverallRemainingSec] = useState(30 * 60);
  const overallTimerRef = useRef(null);

  // 60-Second running line timer per question
  const [timeLeftMs, setTimeLeftMs] = useState(TOTAL_QUESTION_TIME_MS);
  const questionTimerRef = useRef(null);

  // Fullscreen & Anti-Cheat State
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [strikeCount, setStrikeCount] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showTabWarning, setShowTabWarning] = useState(false);
  const lastViolationTimeRef = useRef(0);

  // Selected option ref to read current value inside interval callbacks
  const selectedOptionRef = useRef(null);
  selectedOptionRef.current = selectedOption;

  const currentNumberRef = useRef(1);
  currentNumberRef.current = currentNumber;

  const totalQuestionsRef = useRef(30);
  totalQuestionsRef.current = totalQuestions;

  const strikeCountRef = useRef(0);
  strikeCountRef.current = strikeCount;

  // Request Fullscreen Mode
  const requestFullscreenMode = () => {
    try {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().then(() => {
          setIsFullscreen(true);
        }).catch(() => {
          // Ignore rejection on user gesture restrictions
        });
      }
    } catch (e) {}
  };

  // Anti-Cheating Violation Handler (Multi-Strike)
  const triggerViolation = async (reason) => {
    const now = Date.now();
    // Debounce violation triggers (within 1.8 seconds) to prevent multiple simultaneous events
    if (now - lastViolationTimeRef.current < 1800) return;
    lastViolationTimeRef.current = now;

    try {
      const res = await api.recordViolation(candidateId, reason);
      const newStrikes = res.warnings || (strikeCountRef.current + 1);
      setStrikeCount(newStrikes);
      strikeCountRef.current = newStrikes;

      if (res.autoSubmitted || newStrikes >= 3) {
        setShowTabWarning(true);
        setTimeout(() => {
          navigate('/result');
        }, 1500);
      } else {
        setShowTabWarning(true);
      }
    } catch (err) {
      console.warn('Record violation error:', err);
      const nextStrikes = strikeCountRef.current + 1;
      setStrikeCount(nextStrikes);
      strikeCountRef.current = nextStrikes;
      setShowTabWarning(true);
      if (nextStrikes >= 3) {
        setTimeout(() => navigate('/result'), 1500);
      }
    }
  };

  // Redirect if not registered & Enforce Anti-cheating listeners
  useEffect(() => {
    if (!candidateId) {
      navigate('/');
      return;
    }

    initSession();

    // Attempt initial fullscreen entry
    requestFullscreenMode();

    // 1. Anti-Cheat: Prevent Browser Back Navigation (popstate trap)
    window.history.pushState(null, '', window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };
    window.addEventListener('popstate', handlePopState);

    // 2. Anti-Cheat: Prevent Accidental Page Refresh / Tab Close
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = 'Assessment is in progress. Navigating away will submit your test!';
      return e.returnValue;
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 3. Anti-Cheat: Prevent Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('contextmenu', handleContextMenu);

    // 4. Anti-Cheat: Block Copy / Cut / Paste & Clear Clipboard
    const handleClipboard = (e) => {
      e.preventDefault();
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('');
        }
      } catch (err) {}
      return false;
    };
    document.addEventListener('copy', handleClipboard);
    document.addEventListener('cut', handleClipboard);
    document.addEventListener('paste', handleClipboard);

    // 5. Anti-Cheat: Block Drag and Drop & Text Selection
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };
    document.addEventListener('dragstart', handleDragStart);

    // 6. Anti-Cheat: Block Developer Tools, Source View, Print, and Back Key Shortcuts
    const handleKeyDown = (e) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerViolation('Attempted to open DevTools (F12)');
        return false;
      }
      // Block Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        triggerViolation('Attempted to inspect element or open console');
        return false;
      }
      // Block Ctrl+U (View Source), Ctrl+S (Save), Ctrl+P (Print), Ctrl+C, Ctrl+V, Ctrl+A
      if (e.ctrlKey && ['U', 'S', 'P', 'C', 'V', 'A'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
      }
      // Block Alt+Left / Alt+Right navigation
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        return false;
      }
      // Block PrintScreen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        try { navigator.clipboard.writeText(''); } catch (err) {}
        triggerViolation('Attempted screen capture (PrintScreen)');
        return false;
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    // 7. Anti-Cheat: Fullscreen Change Listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        triggerViolation('Exited fullscreen mode');
      } else {
        setIsFullscreen(true);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // 8. Anti-Cheat: Tab switch detection (visibilitychange)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation('Tab switched or minimized');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 9. Anti-Cheat: Window blur detection (clicking another app / dual monitors)
    const handleWindowBlur = () => {
      triggerViolation('Navigated away or opened external application');
    };
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleClipboard);
      document.removeEventListener('cut', handleClipboard);
      document.removeEventListener('paste', handleClipboard);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
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

      if (res.jobProfile) {
        setJobProfile(res.jobProfile);
        sessionStorage.setItem('dm_job_profile', res.jobProfile);
      }

      const qNum = res.currentQuestion || 1;
      setCurrentNumber(qNum);
      const total = res.totalQuestions || 30;
      setTotalQuestions(total);
      totalQuestionsRef.current = total;

      // Start overall countdown timer (e.g. 1800s / 30 mins)
      const remainingOverall = Math.max(0, res.remainingSeconds ?? (30 * 60));
      setOverallRemainingSec(remainingOverall);
      startOverallTimer(remainingOverall);

      await loadQuestion(qNum);

    } catch (err) {
      console.error('Session initialization error:', err);
      setErrorMsg('Network error connecting to assessment server.');
    } finally {
      setLoading(false);
    }
  };

  // Start Overall Test Countdown
  const startOverallTimer = (initialSeconds) => {
    if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    let sec = initialSeconds;

    overallTimerRef.current = setInterval(() => {
      sec -= 1;
      setOverallRemainingSec(Math.max(0, sec));

      if (sec <= 0) {
        clearInterval(overallTimerRef.current);
        handleAutoSubmit('Assessment total time expired');
      }
    }, 1000);
  };

  // Start 60-second per-question line timer with 100ms resolution
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
        handleAutoSubmit('Completed all questions');
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
          handleAutoSubmit('Test time expired');
          return;
        }
        setErrorMsg(res.message || 'Could not load question.');
        return;
      }

      setQuestionData(res.question);
      setSelectedOption(res.question.selectedOption || null);

      // Start 60-second countdown for the newly loaded question
      startQuestionTimer();

    } catch (err) {
      console.error('Load question error:', err);
      setErrorMsg('Failed to load question.');
    }
  };

  // Select Option & Auto-Advance to Next Question
  const handleSelectOption = async (optionKey) => {
    if (submitting) return; // Prevent duplicate clicks
    setSelectedOption(optionKey);
    selectedOptionRef.current = optionKey;
    setErrorMsg('');

    // Stop question line timer
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

  // Move to Next Question (allows next even if no option selected)
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
    if (overallTimerRef.current) clearInterval(overallTimerRef.current);

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
  const handleAutoSubmit = async (reason = 'Assessment finalized automatically') => {
    if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    setSubmitting(true);

    try {
      const res = await api.submitTest(candidateId, true, reason);
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
            <p style={{ fontWeight: '600', color: '#1e293b' }}>Loading Assessment Questions...</p>
          </div>
        </div>
      </>
    );
  }

  const remainingSec = Math.ceil(timeLeftMs / 1000);
  let timerLineClass = 'timer-green-line';
  let timerBadgeClass = 'timer-green-badge';
  if (remainingSec <= 15) {
    timerLineClass = 'timer-red-line';
    timerBadgeClass = 'timer-red-badge';
  } else if (remainingSec <= 30) {
    timerLineClass = 'timer-orange-line';
    timerBadgeClass = 'timer-orange-badge';
  }
  const linePercent = Math.max(0, Math.min(100, (timeLeftMs / TOTAL_QUESTION_TIME_MS) * 100));

  // Format Overall Timer
  const overallMins = Math.floor(overallRemainingSec / 60);
  const overallSecs = overallRemainingSec % 60;
  const overallFormatted = `${overallMins}:${overallSecs.toString().padStart(2, '0')}`;

  return (
    <>
      <Header />

      <div className="page-container">
        {/* Fullscreen Overlay Prompt if Exited */}
        {!isFullscreen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            textAlign: 'center'
          }}>
            <ShieldAlert size={56} color="#ef4444" style={{ marginBottom: '16px' }} />
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>
              Fullscreen Mode Required
            </h2>
            <p style={{ color: '#cbd5e1', maxWidth: '440px', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
              This is a proctored assessment. You must remain in fullscreen mode. Exiting fullscreen is recorded as an anti-cheating violation strike.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={requestFullscreenMode}
              style={{ fontSize: '1rem', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Maximize2 size={18} />
              <span>Re-enter Fullscreen to Continue</span>
            </button>
          </div>
        )}

        <div 
          className="content-card question-card"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none' }}
        >
          {/* Top Bar: Question Progress, Job Profile & Overall 30-Minute Countdown */}
          <div className="test-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="test-progress-info" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{ fontWeight: '700', fontSize: '1rem', color: '#0f172a' }}>Question {currentNumber} of {totalQuestions}</span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  backgroundColor: jobProfile === 'Business Development Executive' ? '#cffafe' : '#dbeafe',
                  color: jobProfile === 'Business Development Executive' ? '#0891b2' : '#1d4ed8'
                }}>
                  {jobProfile}
                </span>
                {strikeCount > 0 && (
                  <span style={{
                    fontSize: '0.725rem',
                    fontWeight: '700',
                    padding: '3px 8px',
                    borderRadius: '8px',
                    backgroundColor: strikeCount >= 2 ? '#fee2e2' : '#ffedd5',
                    color: strikeCount >= 2 ? '#b91c1c' : '#c2410c'
                  }}>
                    ⚠️ Strike {strikeCount}/3
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>
                Candidate: {candidateName}
              </div>
            </div>

            {/* Overall 30-Minute Timer Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: overallRemainingSec < 300 ? '#fee2e2' : '#f1f5f9',
              border: overallRemainingSec < 300 ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
              padding: '6px 14px',
              borderRadius: '8px',
              fontWeight: '700',
              color: overallRemainingSec < 300 ? '#dc2626' : '#1e293b'
            }}>
              <Clock size={16} color={overallRemainingSec < 300 ? '#dc2626' : '#2563eb'} />
              <span>Total Time: {overallFormatted}</span>
            </div>
          </div>

          {/* Visual Progress Bar (Overall) */}
          <div className="progress-track" style={{ marginTop: '12px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${(currentNumber / totalQuestions) * 100}%` }}
            />
          </div>

          {/* 60-Second Running Question Timer Line */}
          <div className="question-timer-wrapper" style={{ marginTop: '16px' }}>
            <div className="question-timer-top">
              <div className="question-timer-label">
                <Clock size={15} />
                <span>Question Time (60s limit)</span>
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

          {/* Question Details */}
          {questionData && (
            <div style={{ marginTop: '18px' }}>
              <div className="question-text" style={{ fontSize: '1.05rem', lineHeight: '1.6', fontWeight: '600', color: '#0f172a' }}>
                {questionData.question}
              </div>

              {/* Shuffled Options */}
              <div className="options-grid" style={{ marginTop: '16px' }}>
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
                      &bull; Option {selectedOption} chosen &mdash; advancing to next question...
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
          Are you sure you want to submit your assessment?
        </p>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Your responses will be recorded and finalized. You will not be able to return to the test.
        </p>
      </Modal>

      {/* Proctored Anti-Cheating Strike Warning Modal */}
      <TabWarningModal
        isOpen={showTabWarning}
        strikeCount={strikeCount}
        onClose={() => setShowTabWarning(false)}
        onReEnterFullscreen={requestFullscreenMode}
      />
    </>
  );
}
