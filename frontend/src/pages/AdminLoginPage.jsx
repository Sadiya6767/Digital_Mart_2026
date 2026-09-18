import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader2, Shield } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      const res = await api.adminLogin(username.trim(), password);

      if (!res.success) {
        setError(res.message || 'Invalid credentials.');
        setLoading(false);
        return;
      }

      localStorage.setItem('dm_admin_token', res.token);
      localStorage.setItem('dm_admin_user', JSON.stringify(res.admin));
      navigate('/admin/dashboard');

    } catch (err) {
      console.error('Admin login error:', err);
      setError('Failed to connect to authentication service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header isAdmin={true} />

      <div className="page-container" style={{ alignItems: 'center' }}>
        <div className="content-card" style={{ maxWidth: '440px', padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '12px',
              backgroundColor: '#eff6ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Shield size={32} color="#1d4ed8" />
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#0f172a' }}>
              Admin Portal
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Digital Mart Solutions &bull; Assessment Control Center
            </p>
          </div>

          {error && (
            <div className="alert-banner alert-danger">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="username"
                  type="text"
                  className="form-input"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingLeft: '38px' }}
                />
                <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Secure Log In'
              )}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
            Authorized evaluation personnel only.
          </div>
        </div>
      </div>
    </>
  );
}
