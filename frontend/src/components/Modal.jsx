import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function Modal({
  isOpen,
  title,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  confirmVariant = 'primary',
  hideCancel = false
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <AlertCircle size={24} color="#1d4ed8" />
          <h3>{title}</h3>
        </div>

        <div className="modal-body">
          {children}
        </div>

        <div className="modal-actions">
          {!hideCancel && (
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              {cancelText}
            </button>
          )}
          <button 
            type="button" 
            className={`btn btn-${confirmVariant}`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
