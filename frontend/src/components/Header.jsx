import React from 'react';
import { LogOut } from 'lucide-react';

export default function Header({ isAdmin = false, onAdminLogout = null }) {
  return (
    <header className="app-header">
      <div className="brand-container">
        <div className="brand-logo-icon">
          DM
        </div>
        <div className="brand-info">
          <h1>Digital Mart Solutions</h1>
          <p>Online Assessment Platform</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAdmin && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="admin-header-badge">ADMIN</span>
            {onAdminLogout && (
              <button 
                onClick={onAdminLogout} 
                className="btn btn-secondary" 
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                title="Log out of Admin"
              >
                <LogOut size={14} /> Logout
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
