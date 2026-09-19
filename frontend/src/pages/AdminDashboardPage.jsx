import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, CheckCircle2, Clock, AlertCircle, FileText, 
  ExternalLink, Search, Filter, RefreshCw, X, Eye, 
  Award, Check, Settings, ToggleLeft, ToggleRight, Trash2, CheckSquare, Download
} from 'lucide-react';
import Header from '../components/Header';
import { api } from '../services/api';

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('dm_admin_token');

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    registered: 0,
    inProgress: 0,
    completed: 0,
    autoSubmitted: 0,
    avgScore: '0.0'
  });
  const [colleges, setColleges] = useState([]);

  // Selection for bulk delete
  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);
  const [deleteModal, setDeleteModal] = useState({ open: false, type: null, candidate: null });

  // Search and Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');
  const [sortOrder, setSortOrder] = useState('DESC');

  // Candidate Details Modal
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const [candidateDetails, setCandidateDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Settings
  const [appSettings, setAppSettings] = useState({
    SHOW_STUDENT_SCORE: false,
    ENABLE_TAB_WARNING: true
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    fetchSettings();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem('dm_admin_token');
    localStorage.removeItem('dm_admin_user');
    navigate('/admin/login');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        search,
        status: statusFilter,
        college: collegeFilter,
        sortBy,
        sortOrder
      };

      const res = await api.getCandidates(params, token);

      if (!res.success) {
        if (res.message?.includes('token') || res.message?.includes('expired')) {
          handleLogout();
          return;
        }
        return;
      }

      setCandidates(res.candidates || []);
      setStats(res.stats || {});
      setColleges(res.colleges || []);

    } catch (err) {
      console.error('Fetch dashboard data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await api.getSettings(token);
      if (res.success && res.settings) {
        setAppSettings(res.settings);
      }
    } catch (err) {
      console.error('Fetch settings error:', err);
    }
  };

  const handleToggleSetting = async (key) => {
    const newVal = !appSettings[key];
    try {
      const res = await api.updateSettings(key, newVal, token);
      if (res.success) {
        setAppSettings(prev => ({ ...prev, [key]: newVal }));
      }
    } catch (err) {
      console.error('Update setting error:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [statusFilter, collegeFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Selection handlers
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedCandidateIds(candidates.map(c => c.id));
    } else {
      setSelectedCandidateIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedCandidateIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Execute single, bulk, or all delete
  const handleExecuteDelete = async () => {
    const { type, candidate } = deleteModal;
    setDeleteModal({ open: false, type: null, candidate: null });
    setLoading(true);

    try {
      if (type === 'single' && candidate) {
        const res = await api.deleteCandidate(candidate.id, token);
        alert(res.message || 'Candidate deleted.');
      } else if (type === 'bulk' && selectedCandidateIds.length > 0) {
        const res = await api.bulkDeleteCandidates(selectedCandidateIds, token);
        alert(res.message || 'Selected candidates deleted.');
        setSelectedCandidateIds([]);
      } else if (type === 'all') {
        const res = await api.deleteAllCandidates(token);
        alert(res.message || 'All candidate records cleared.');
        setSelectedCandidateIds([]);
      }
      await fetchData();
    } catch (err) {
      alert('Error deleting data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetails = async (candidateId) => {
    setSelectedCandidateId(candidateId);
    setLoadingDetails(true);

    try {
      const res = await api.getCandidateDetails(candidateId, token);
      if (res.success) {
        setCandidateDetails(res);
      }
    } catch (err) {
      console.error('Fetch candidate details error:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedCandidateId(null);
    setCandidateDetails(null);
  };

  const handleResetActiveSession = async () => {
    if (!window.confirm('Are you sure you want to conclude all in-progress tests and free the assessment room for the next candidate?')) return;
    try {
      const res = await api.resetActiveSession(token);
      alert(res.message || 'Room is now free.');
      fetchData();
    } catch (err) {
      alert('Failed to reset session.');
    }
  };

  const handleExportCSV = () => {
    if (!candidates || candidates.length === 0) {
      alert('No candidate records available to export.');
      return;
    }

    const headers = [
      'Candidate ID',
      'Full Name',
      'Email Address',
      'Phone Number',
      'College Name',
      'Degree',
      'Branch',
      'Graduation Year',
      'Test Status',
      'Score (out of 50)',
      'Total Questions',
      'Percentage (%)',
      'Registered Date',
      'Test Started Date',
      'Test Submitted Date'
    ];

    const rows = candidates.map(c => [
      c.id,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.collegeName || '').replace(/"/g, '""')}"`,
      `"${(c.degree || '').replace(/"/g, '""')}"`,
      `"${(c.branch || '').replace(/"/g, '""')}"`,
      c.graduationYear || '',
      c.status || '',
      c.score ?? 0,
      c.totalQuestions || 50,
      `"${c.percentage || 0}%"`,
      `"${c.registeredAt ? new Date(c.registeredAt).toLocaleString('en-IN') : ''}"`,
      `"${c.testStartedAt ? new Date(c.testStartedAt).toLocaleString('en-IN') : ''}"`,
      `"${c.testSubmittedAt ? new Date(c.testSubmittedAt).toLocaleString('en-IN') : ''}"`
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.setAttribute('download', `Digital_Mart_Candidates_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <>
      <Header isAdmin={true} onAdminLogout={handleLogout} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Top Title & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
              Candidate Evaluation Dashboard
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Digital Mart Solutions &bull; Assessment Portal
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Bulk Delete Button if selected */}
            {selectedCandidateIds.length > 0 && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setDeleteModal({ open: true, type: 'bulk' })}
                style={{ fontSize: '0.85rem' }}
              >
                <Trash2 size={15} />
                <span>Delete Selected ({selectedCandidateIds.length})</span>
              </button>
            )}

            {/* Clear All Candidates Button */}
            {candidates.length > 0 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteModal({ open: true, type: 'all' })}
                style={{ fontSize: '0.85rem', color: '#dc2626', borderColor: '#fecaca' }}
                title="Delete all candidates and reset assessment submissions"
              >
                <Trash2 size={15} />
                <span>Clear All Data</span>
              </button>
            )}

            {/* Free Room Button */}
            {stats.inProgress > 0 && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleResetActiveSession}
                style={{ fontSize: '0.85rem' }}
              >
                Free Room ({stats.inProgress} active)
              </button>
            )}

            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleExportCSV}
              style={{ fontSize: '0.85rem', color: '#15803d', borderColor: '#86efac', backgroundColor: '#f0fdf4', fontWeight: '600' }}
              title="Download all candidate records as an Excel CSV spreadsheet"
            >
              <Download size={16} />
              <span>Export CSV (Excel)</span>
            </button>

            <button
              className="btn btn-secondary"
              onClick={() => setShowSettingsModal(true)}
              style={{ fontSize: '0.85rem' }}
            >
              <Settings size={16} />
              <span>Assessment Settings</span>
            </button>

            <button
              className="btn btn-primary"
              onClick={fetchData}
              style={{ fontSize: '0.85rem' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Total Candidates</span>
            <span className="stat-value">{stats.total}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Completed</span>
            <span className="stat-value" style={{ color: '#15803d' }}>{stats.completed}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">In Progress</span>
            <span className="stat-value" style={{ color: '#0369a1' }}>{stats.inProgress}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Auto Submitted</span>
            <span className="stat-value" style={{ color: '#c2410c' }}>{stats.autoSubmitted}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Registered Only</span>
            <span className="stat-value" style={{ color: '#64748b' }}>{stats.registered}</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Average Score</span>
            <span className="stat-value" style={{ color: '#1d4ed8' }}>{stats.avgScore} <span style={{ fontSize: '0.9rem', fontWeight: '500', color: '#64748b' }}>/ 50</span></span>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <form onSubmit={handleSearchSubmit} className="filters-bar">
          {/* Search */}
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by Name, Email, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '34px' }}
            />
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '12px' }} />
          </div>

          {/* Status Filter */}
          <div style={{ width: '170px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">Completed</option>
              <option value="AUTO_SUBMITTED">Auto Submitted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REGISTERED">Registered</option>
            </select>
          </div>

          {/* College Filter */}
          <div style={{ width: '200px' }}>
            <select
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="form-select"
            >
              <option value="ALL">All Colleges</option>
              {colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div style={{ width: '160px' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-select"
            >
              <option value="score">Sort by Score</option>
              <option value="testSubmittedAt">Sort by Submission</option>
              <option value="registeredAt">Sort by Date</option>
              <option value="fullName">Sort by Name</option>
            </select>
          </div>

          <div style={{ width: '130px' }}>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="form-select"
            >
              <option value="DESC">High &rarr; Low</option>
              <option value="ASC">Low &rarr; High</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary" style={{ padding: '10px 18px' }}>
            Search
          </button>
        </form>

        {/* Candidates Table with Checkbox selection and Delete actions */}
        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    checked={candidates.length > 0 && selectedCandidateIds.length === candidates.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    title="Select All"
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </th>
                <th>Candidate Name</th>
                <th>Contact Info</th>
                <th>College & Branch</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Submitted At</th>
                <th>Resume</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    Loading candidate data...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No candidates found matching the criteria.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr key={c.id}>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedCandidateIds.includes(c.id)}
                        onChange={() => handleToggleSelect(c.id)}
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                    </td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#0f172a' }}>{c.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: #{c.id} &bull; Grad {c.graduationYear}</div>
                    </td>
                    <td>
                      <div>{c.email}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.phone}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{c.collegeName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{c.degree} ({c.branch})</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: '800', color: '#1d4ed8', fontSize: '1rem' }}>
                        {c.status === 'COMPLETED' || c.status === 'AUTO_SUBMITTED' ? `${c.score} / 40` : '-'}
                      </div>
                    </td>
                    <td>
                      {c.status === 'COMPLETED' || c.status === 'AUTO_SUBMITTED' ? (
                        <span style={{ fontWeight: '600' }}>{c.percentage}%</span>
                      ) : '-'}
                    </td>
                    <td>
                      <span className={`status-badge status-${c.status}`}>
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#475569' }}>
                      {formatDate(c.testSubmittedAt || c.registeredAt)}
                    </td>
                    <td>
                      <a
                        href={api.getResumeUrl(c.id, token)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                      >
                        <FileText size={14} />
                        <span>View Resume</span>
                      </a>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          type="button"
                          className="btn btn-outline-primary"
                          style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          onClick={() => handleOpenDetails(c.id)}
                          title="View detailed test evaluation"
                        >
                          <Eye size={14} />
                          <span>Details</span>
                        </button>

                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '6px 8px', color: '#dc2626', borderColor: '#fecaca' }}
                          onClick={() => setDeleteModal({ open: true, type: 'single', candidate: c })}
                          title="Delete candidate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="modal-overlay" onClick={() => setDeleteModal({ open: false, type: null, candidate: null })}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <Trash2 size={24} color="#dc2626" />
              <h3 style={{ color: '#991b1b' }}>
                {deleteModal.type === 'all' 
                  ? 'Clear All Candidate Data?' 
                  : deleteModal.type === 'bulk' 
                    ? `Delete ${selectedCandidateIds.length} Selected Candidates?` 
                    : `Delete Candidate ${deleteModal.candidate?.fullName}?`}
              </h3>
            </div>

            <div className="modal-body">
              <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {deleteModal.type === 'all'
                  ? 'WARNING: This will permanently delete ALL candidates, their test sessions, answers, and uploaded resume PDFs. This action cannot be undone.'
                  : deleteModal.type === 'bulk'
                    ? `Are you sure you want to permanently delete these ${selectedCandidateIds.length} candidate(s)? Their test records and resumes will be completely removed.`
                    : `Are you sure you want to permanently delete candidate "${deleteModal.candidate?.fullName}"? Their test answers, score, and resume file will be removed.`}
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeleteModal({ open: false, type: null, candidate: null })}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleExecuteDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Details & Answers Analysis Modal */}
      {selectedCandidateId && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div 
            className="modal-box" 
            style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                  Candidate Assessment Details
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Complete response analysis & verification report
                </p>
              </div>

              <button
                onClick={handleCloseDetails}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={24} />
              </button>
            </div>

            {loadingDetails || !candidateDetails ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <RefreshCw size={32} className="animate-spin" color="#1d4ed8" style={{ margin: '0 auto 12px' }} />
                <p>Loading candidate evaluation details...</p>
              </div>
            ) : (
              <div>
                {/* Candidate Info Card */}
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '0.875rem' }}>
                    <div>
                      <span style={{ color: '#64748b' }}>Full Name:</span> <strong>{candidateDetails.candidate.fullName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Email:</span> <strong>{candidateDetails.candidate.email}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Phone:</span> <strong>{candidateDetails.candidate.phone}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>College:</span> <strong>{candidateDetails.candidate.collegeName}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Degree / Branch:</span> <strong>{candidateDetails.candidate.degree} - {candidateDetails.candidate.branch}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Graduation Year:</span> <strong>{candidateDetails.candidate.graduationYear}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Test Started:</span> <strong>{formatDate(candidateDetails.candidate.testStartedAt)}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Test Submitted:</span> <strong>{formatDate(candidateDetails.candidate.testSubmittedAt)}</strong>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span className={`status-badge status-${candidateDetails.candidate.status}`}>
                        {candidateDetails.candidate.status.replace('_', ' ')}
                      </span>
                    </div>

                    <a
                      href={api.getResumeUrl(candidateDetails.candidate.id, token)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <ExternalLink size={14} /> Open Resume PDF
                    </a>
                  </div>
                </div>

                {/* Score Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: '700' }}>TOTAL QUESTIONS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#1d4ed8' }}>{candidateDetails.summary.totalQuestions}</div>
                  </div>

                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#15803d', fontWeight: '700' }}>CORRECT ANSWERS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#16a34a' }}>{candidateDetails.summary.correct}</div>
                  </div>

                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#b91c1c', fontWeight: '700' }}>WRONG ANSWERS</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#dc2626' }}>{candidateDetails.summary.wrong}</div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: '700' }}>SCORE PERCENTAGE</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>{candidateDetails.summary.percentage}%</div>
                  </div>
                </div>

                {/* Answer Analysis Breakdown */}
                <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#0f172a', marginBottom: '14px' }}>
                  Detailed Question & Answer Analysis
                </h4>

                {candidateDetails.questions.map((q, idx) => {
                  let cardClass = 'qa-card';
                  let badge = null;

                  if (!q.isAnswered) {
                    cardClass += ' is-unanswered';
                    badge = <span style={{ background: '#f1f5f9', color: '#64748b', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>UNANSWERED</span>;
                  } else if (q.isCorrect) {
                    cardClass += ' is-correct';
                    badge = <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>CORRECT</span>;
                  } else {
                    cardClass += ' is-wrong';
                    badge = <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '700' }}>INCORRECT</span>;
                  }

                  return (
                    <div key={q.id} className={cardClass}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Q{idx + 1}.</strong>
                          <span className={`category-tag ${q.category === 'WEB_DEVELOPMENT' ? 'tag-web' : 'tag-biz'}`}>
                            {q.category === 'WEB_DEVELOPMENT' ? 'Web Dev' : 'Biz Dev'}
                          </span>
                        </div>
                        <div>{badge}</div>
                      </div>

                      <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
                        {q.question}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.85rem', marginBottom: '12px' }}>
                        <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '4px' }}>
                          <strong>A:</strong> {q.optionA}
                        </div>
                        <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '4px' }}>
                          <strong>B:</strong> {q.optionB}
                        </div>
                        <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '4px' }}>
                          <strong>C:</strong> {q.optionC}
                        </div>
                        <div style={{ padding: '6px 10px', background: '#f8fafc', borderRadius: '4px' }}>
                          <strong>D:</strong> {q.optionD}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '24px', fontSize: '0.85rem', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <div>
                          <span style={{ color: '#64748b' }}>Selected: </span>
                          <strong>
                            {q.selectedAnswer ? `Option ${q.selectedAnswer}` : 'None'}
                          </strong>
                        </div>
                        <div>
                          <span style={{ color: '#64748b' }}>Correct: </span>
                          <strong style={{ color: '#15803d' }}>
                            Option {q.correctAnswer}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <Settings size={22} color="#1d4ed8" />
              <h3>Assessment Configuration</h3>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Show Student Score</strong>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Allow candidates to see their score on the submission confirmation page.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('SHOW_STUDENT_SCORE')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {appSettings.SHOW_STUDENT_SCORE ? (
                    <ToggleRight size={36} color="#16a34a" />
                  ) : (
                    <ToggleLeft size={36} color="#94a3b8" />
                  )}
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div>
                  <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>Tab Switching Warning</strong>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Display an alert notice if the student navigates away or switches browser tabs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleSetting('ENABLE_TAB_WARNING')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {appSettings.ENABLE_TAB_WARNING ? (
                    <ToggleRight size={36} color="#16a34a" />
                  ) : (
                    <ToggleLeft size={36} color="#94a3b8" />
                  )}
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowSettingsModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
