import React from 'react';
import { AlertTriangle, ShieldAlert, Maximize2 } from 'lucide-react';

export default function TabWarningModal({ isOpen, onClose, strikeCount = 1, onReEnterFullscreen }) {
  if (!isOpen) return null;

  const isFinalWarning = strikeCount === 2;
  const isTerminated = strikeCount >= 3;

  return (
    <div className="modal-overlay" style={{ zIndex: 999999, backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 23, 42, 0.85)' }}>
      <div 
        className="modal-box" 
        style={{ 
          borderTop: isTerminated ? '6px solid #dc2626' : (isFinalWarning ? '6px solid #ef4444' : '6px solid #ea580c'),
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          maxWidth: '480px'
        }}
      >
        <div className="modal-header" style={{ alignItems: 'flex-start', gap: '12px' }}>
          {isFinalWarning || isTerminated ? (
            <ShieldAlert size={28} color="#dc2626" style={{ flexShrink: 0 }} />
          ) : (
            <AlertTriangle size={28} color="#ea580c" style={{ flexShrink: 0 }} />
          )}
          <div>
            <h3 style={{ color: isTerminated ? '#991b1b' : (isFinalWarning ? '#b91c1c' : '#9a3412'), fontSize: '1.15rem' }}>
              {isTerminated 
                ? '🛑 Assessment Disqualified' 
                : (isFinalWarning ? '🚨 FINAL WARNING: Strike 2 of 3' : '⚠️ Cheating Warning: Strike 1 of 3')}
            </h3>
            <span style={{ 
              display: 'inline-block',
              marginTop: '4px',
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: isTerminated ? '#fee2e2' : (isFinalWarning ? '#fee2e2' : '#ffedd5'),
              color: isTerminated ? '#991b1b' : (isFinalWarning ? '#991b1b' : '#c2410c')
            }}>
              {isTerminated ? 'Terminating Test...' : `${3 - strikeCount} Warning${3 - strikeCount === 1 ? '' : 's'} Remaining`}
            </span>
          </div>
        </div>

        <div className="modal-body" style={{ marginTop: '16px' }}>
          {isTerminated ? (
            <p style={{ fontWeight: '600', color: '#991b1b', lineHeight: '1.5' }}>
              You have exceeded the maximum allowed anti-cheating violations. Your test has been automatically submitted and flagged to the administrator.
            </p>
          ) : isFinalWarning ? (
            <>
              <p style={{ fontWeight: '700', color: '#b91c1c', fontSize: '0.95rem', lineHeight: '1.5' }}>
                You have navigated away from the assessment window again!
              </p>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px', lineHeight: '1.5' }}>
                Tab switching, minimizing the browser, or clicking external apps is strictly prohibited. <strong>ONE MORE VIOLATION will trigger IMMEDIATE AUTO-SUBMISSION and DISQUALIFICATION.</strong>
              </p>
            </>
          ) : (
            <>
              <p style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.95rem', lineHeight: '1.5' }}>
                Window navigation / tab switch attempt detected!
              </p>
              <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px', lineHeight: '1.5' }}>
                This is a proctored assessment. All window blur and tab switches are logged directly to the hiring administrator. You are permitted a maximum of 2 warnings before disqualification.
              </p>
            </>
          )}
        </div>

        <div className="modal-actions" style={{ marginTop: '20px' }}>
          {!isTerminated && (
            <button 
              type="button" 
              className={isFinalWarning ? "btn btn-danger" : "btn btn-primary"}
              onClick={() => {
                if (onReEnterFullscreen) onReEnterFullscreen();
                onClose();
              }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
            >
              <Maximize2 size={16} />
              <span>Resume in Fullscreen Mode</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
