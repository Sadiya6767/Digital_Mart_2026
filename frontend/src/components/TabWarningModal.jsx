import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function TabWarningModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ borderTop: '4px solid #ea580c' }}>
        <div className="modal-header">
          <AlertTriangle size={24} color="#ea580c" />
          <h3 style={{ color: '#9a3412' }}>Assessment Notice</h3>
        </div>

        <div className="modal-body">
          <p style={{ fontWeight: '500', color: '#1e293b' }}>
            Warning: Please remain on the assessment page.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            Tab switching or navigating away from the active assessment window is monitored. Please stay on this tab to complete your test without interruptions.
          </p>
        </div>

        <div className="modal-actions">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onClose}
            style={{ width: '100%' }}
          >
            I Understand & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
