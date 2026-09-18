import React, { useEffect, useState } from 'react';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Header from '../components/Header';

export default function ResultPage() {
  const [submission, setSubmission] = useState(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('dm_submission_info');
    if (raw) {
      try {
        setSubmission(JSON.parse(raw));
      } catch (e) {
        console.error('Failed to parse submission info', e);
      }
    }
  }, []);

  const candidateName = submission?.candidateName || sessionStorage.getItem('dm_candidate_name') || 'Candidate';
  const showScore = submission?.score !== undefined && submission?.score !== null;

  return (
    <>
      <Header />

      <div className="page-container" style={{ alignItems: 'center' }}>
        <div className="content-card" style={{ textAlign: 'center', maxWidth: '640px', padding: '40px 32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            backgroundColor: '#dcfce7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <CheckCircle2 size={44} color="#16a34a" />
          </div>

          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Assessment Submitted Successfully
          </h2>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#f1f5f9',
            padding: '6px 16px',
            borderRadius: '20px',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#334155',
            marginBottom: '24px'
          }}>
            Candidate: <strong>{candidateName}</strong>
          </div>

          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px 24px',
            textAlign: 'left',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Submission Status:</span>
              <span style={{ color: '#16a34a', fontWeight: '700', fontSize: '0.95rem' }}>
                Completed & Recorded
              </span>
            </div>

            {showScore && (
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#64748b', fontSize: '0.95rem' }}>Your Score:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1d4ed8' }}>
                  {submission.score} / 40
                </span>
              </div>
            )}
          </div>

          <p style={{ fontSize: '1rem', color: '#334155', lineHeight: '1.6', marginBottom: '16px' }}>
            Thank you for completing the assessment.
          </p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: '1.6', marginBottom: '32px' }}>
            The Digital Mart Solutions recruitment team will review your responses and evaluation report alongside your resume. Shortlisted candidates will be notified via email for the technical and HR interview rounds.
          </p>

          <div>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                sessionStorage.clear();
                window.location.href = '/';
              }}
            >
              <ArrowLeft size={16} /> Return to Homepage
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
