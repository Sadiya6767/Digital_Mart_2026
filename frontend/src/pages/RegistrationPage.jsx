import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Code2, Briefcase, CheckCircle2 } from 'lucide-react';
import Header from '../components/Header';
import { api } from '../services/api';

export default function RegistrationPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    jobProfile: 'Web Development', // 'Web Development' | 'Business Development Executive'
    fullName: '',
    email: '',
    phone: '',
    collegeName: '',
    degree: 'B.Tech',
    branch: '',
    graduationYear: '2026',
    confirmed: false
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrors(prev => ({ ...prev, resume: 'Only PDF files are allowed.' }));
      setResumeFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, resume: 'Resume size must be less than 5 MB.' }));
      setResumeFile(null);
      return;
    }

    setResumeFile(file);
    setErrors(prev => ({ ...prev, resume: null }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.jobProfile) newErrors.jobProfile = 'Please select your target job profile.';
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone validation (10-digit Indian phone)
    const cleanPhone = formData.phone.replace(/[\s\-+]/g, '');
    const tenDigit = cleanPhone.length === 12 && cleanPhone.startsWith('91') 
      ? cleanPhone.slice(2) 
      : (cleanPhone.length === 11 && cleanPhone.startsWith('0') ? cleanPhone.slice(1) : cleanPhone);
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone Number is required.';
    } else if (!/^[6-9]\d{9}$/.test(tenDigit)) {
      newErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!formData.collegeName.trim()) newErrors.collegeName = 'College Name is required.';
    if (!formData.degree.trim()) newErrors.degree = 'Degree is required.';
    if (!formData.branch.trim()) newErrors.branch = 'Branch is required.';
    if (!formData.graduationYear) newErrors.graduationYear = 'Graduation Year is required.';

    if (!resumeFile) {
      newErrors.resume = 'Please upload your resume.';
    }

    if (!formData.confirmed) {
      newErrors.confirmed = 'You must confirm that the information provided is correct.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const data = new FormData();
      data.append('jobProfile', formData.jobProfile);
      data.append('fullName', formData.fullName.trim());
      data.append('email', formData.email.trim().toLowerCase());
      data.append('phone', formData.phone.trim());
      data.append('collegeName', formData.collegeName.trim());
      data.append('degree', formData.degree.trim());
      data.append('branch', formData.branch.trim());
      data.append('graduationYear', formData.graduationYear);
      data.append('confirmed', formData.confirmed);
      data.append('resume', resumeFile);

      const res = await api.registerCandidate(data);

      if (!res.success) {
        setServerError(res.message || 'Registration failed. Please verify your details.');
        setLoading(false);
        return;
      }

      // Store candidate info for assessment session
      sessionStorage.setItem('dm_candidate_id', res.candidate.id);
      sessionStorage.setItem('dm_candidate_name', res.candidate.fullName);
      sessionStorage.setItem('dm_candidate_email', res.candidate.email);
      sessionStorage.setItem('dm_job_profile', res.candidate.jobProfile || formData.jobProfile);

      // Start the test session
      const testRes = await api.startTest(res.candidate.id);
      if (testRes.success) {
        sessionStorage.setItem('dm_test_session', JSON.stringify(testRes.session));
        navigate('/test');
      } else {
        setServerError(testRes.message || 'Could not initiate assessment test.');
      }

    } catch (err) {
      console.error('Registration submit error:', err);
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryStart = async () => {
    const candId = sessionStorage.getItem('dm_candidate_id');
    if (!candId) return;

    setLoading(true);
    setServerError('');

    try {
      const testRes = await api.startTest(candId);
      if (testRes.success) {
        sessionStorage.setItem('dm_test_session', JSON.stringify(testRes.session));
        navigate('/test');
      } else {
        setServerError(testRes.message || 'Unable to start assessment. Please try again.');
      }
    } catch (err) {
      setServerError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="page-container">
        <div className="content-card">
          <div className="form-title-group">
            <h2>Digital Mart Solutions</h2>
            <p className="form-subtitle">
              Online Assessment
            </p>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>
              Complete the registration form below to begin your assessment.
            </p>
          </div>

          {serverError && (
            <div className="alert-banner alert-danger" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <span>{serverError}</span>
              </div>
              {serverError.includes('Only 1 person') && (
                <button
                  type="button"
                  onClick={handleRetryStart}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '6px 14px', marginTop: '4px' }}
                >
                  Click Here to Retry Entering Assessment
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-grid">
              {/* Step 1: Select Job Profile */}
              <div className="form-group form-full" style={{ marginBottom: '8px' }}>
                <label className="form-label" style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Step 1: Select Your Job Profile</span>
                  <span className="req">*</span>
                </label>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '12px' }}>
                  Select the position you are applying for. Your 30 assessment questions will be strictly tailored to this profile.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  {/* Web Development Card */}
                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, jobProfile: 'Web Development' }));
                      if (errors.jobProfile) setErrors(prev => ({ ...prev, jobProfile: null }));
                    }}
                    style={{
                      border: formData.jobProfile === 'Web Development' ? '2.5px solid #1d4ed8' : '1.5px solid #cbd5e1',
                      backgroundColor: formData.jobProfile === 'Web Development' ? '#eff6ff' : '#ffffff',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: formData.jobProfile === 'Web Development' ? '0 4px 14px rgba(29, 78, 216, 0.18)' : 'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: formData.jobProfile === 'Web Development' ? '#1d4ed8' : '#f1f5f9',
                        color: formData.jobProfile === 'Web Development' ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Code2 size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Web Development</h3>
                          {formData.jobProfile === 'Web Development' && (
                            <CheckCircle2 size={18} color="#1d4ed8" />
                          )}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                          HTML, CSS, JavaScript, Frontend &amp; Backend Web Engineering concepts
                        </p>
                        <div style={{
                          display: 'inline-block',
                          marginTop: '8px',
                          fontSize: '0.725rem',
                          fontWeight: '700',
                          color: '#1d4ed8',
                          backgroundColor: '#dbeafe',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          30 Questions &bull; 15 Mins
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Business Development Executive Card */}
                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, jobProfile: 'Business Development Executive' }));
                      if (errors.jobProfile) setErrors(prev => ({ ...prev, jobProfile: null }));
                    }}
                    style={{
                      border: formData.jobProfile === 'Business Development Executive' ? '2.5px solid #0891b2' : '1.5px solid #cbd5e1',
                      backgroundColor: formData.jobProfile === 'Business Development Executive' ? '#ecfeff' : '#ffffff',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: formData.jobProfile === 'Business Development Executive' ? '0 4px 14px rgba(8, 145, 178, 0.18)' : 'none',
                      position: 'relative'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        backgroundColor: formData.jobProfile === 'Business Development Executive' ? '#0891b2' : '#f1f5f9',
                        color: formData.jobProfile === 'Business Development Executive' ? '#ffffff' : '#475569',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Briefcase size={22} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Business Development Executive</h3>
                          {formData.jobProfile === 'Business Development Executive' && (
                            <CheckCircle2 size={18} color="#0891b2" />
                          )}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', lineHeight: '1.4' }}>
                          Client Pitching, Lead Gen, Sales Funnels, Negotiation &amp; Strategy
                        </p>
                        <div style={{
                          display: 'inline-block',
                          marginTop: '8px',
                          fontSize: '0.725rem',
                          fontWeight: '700',
                          color: '#0891b2',
                          backgroundColor: '#cffafe',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          30 Questions &bull; 15 Mins
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {errors.jobProfile && <span className="field-error">{errors.jobProfile}</span>}
              </div>

              {/* Divider for Step 2 */}
              <div className="form-group form-full" style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '8px' }}>
                <label className="form-label" style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>
                  Step 2: Candidate Details
                </label>
              </div>

              {/* Full Name */}
              <div className="form-group form-full">
                <label className="form-label" htmlFor="fullName">
                  Full Name <span className="req">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  className={`form-input ${errors.fullName ? 'error' : ''}`}
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="req">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label" htmlFor="phone">
                  Phone Number <span className="req">*</span>
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  className={`form-input ${errors.phone ? 'error' : ''}`}
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && <span className="field-error">{errors.phone}</span>}
              </div>

              {/* College Name */}
              <div className="form-group form-full">
                <label className="form-label" htmlFor="collegeName">
                  College / Institute Name <span className="req">*</span>
                </label>
                <input
                  id="collegeName"
                  name="collegeName"
                  type="text"
                  placeholder="Enter college or university name"
                  className={`form-input ${errors.collegeName ? 'error' : ''}`}
                  value={formData.collegeName}
                  onChange={handleInputChange}
                />
                {errors.collegeName && <span className="field-error">{errors.collegeName}</span>}
              </div>

              {/* Degree */}
              <div className="form-group">
                <label className="form-label" htmlFor="degree">
                  Degree <span className="req">*</span>
                </label>
                <select
                  id="degree"
                  name="degree"
                  className="form-select"
                  value={formData.degree}
                  onChange={handleInputChange}
                >
                  <option value="B.Tech">B.Tech / B.E.</option>
                  <option value="BCA">BCA</option>
                  <option value="MCA">MCA</option>
                  <option value="B.Sc">B.Sc (IT / CS / Electronics)</option>
                  <option value="M.Tech">M.Tech</option>
                  <option value="BBA">BBA / Management</option>
                  <option value="MBA">MBA</option>
                  <option value="Other">Other Graduate Degree</option>
                </select>
              </div>

              {/* Branch */}
              <div className="form-group">
                <label className="form-label" htmlFor="branch">
                  Branch / Specialization <span className="req">*</span>
                </label>
                <input
                  id="branch"
                  name="branch"
                  type="text"
                  placeholder="Enter branch or specialization"
                  className={`form-input ${errors.branch ? 'error' : ''}`}
                  value={formData.branch}
                  onChange={handleInputChange}
                />
                {errors.branch && <span className="field-error">{errors.branch}</span>}
              </div>

              {/* Graduation Year */}
              <div className="form-group">
                <label className="form-label" htmlFor="graduationYear">
                  Graduation Year <span className="req">*</span>
                </label>
                <select
                  id="graduationYear"
                  name="graduationYear"
                  className="form-select"
                  value={formData.graduationYear}
                  onChange={handleInputChange}
                >
                  <option value="2027">2027</option>
                  <option value="2026">2026 (Final Year)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              {/* Resume Upload */}
              <div className="form-group form-full">
                <label className="form-label">
                  Resume Upload (PDF only, max 5 MB) <span className="req">*</span>
                </label>

                <div 
                  className={`file-upload-zone ${errors.resume ? 'error' : ''}`}
                  onClick={() => document.getElementById('resumeFileInput').click()}
                >
                  <Upload size={32} color="#1d4ed8" style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: '600', color: '#1e293b' }}>
                    Click to browse and upload your Resume
                  </p>
                  <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Accepts PDF files only up to 5 MB
                  </p>
                  <input
                    id="resumeFileInput"
                    type="file"
                    accept=".pdf,application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>

                {resumeFile && (
                  <div className="file-info-bar">
                    <div className="file-info-text">
                      <FileText size={20} color="#1d4ed8" />
                      <div>
                        <strong>{resumeFile.name}</strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', marginLeft: '8px' }}>
                          ({(resumeFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                    <CheckCircle size={18} color="#16a34a" />
                  </div>
                )}

                {errors.resume && <span className="field-error">{errors.resume}</span>}
              </div>

              {/* Confirmation Checkbox */}
              <div className="form-group form-full" style={{ marginTop: '8px' }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="confirmed"
                    checked={formData.confirmed}
                    onChange={handleInputChange}
                  />
                  <span>
                    I confirm that the information provided by me is correct.
                  </span>
                </label>
                {errors.confirmed && <span className="field-error">{errors.confirmed}</span>}
              </div>

              {/* Submit Button */}
              <div className="form-full" style={{ marginTop: '16px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: '1.05rem' }}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Validating & Starting Test...
                    </>
                  ) : (
                    'Start Test'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
