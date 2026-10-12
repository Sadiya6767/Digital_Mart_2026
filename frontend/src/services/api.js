let rawUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim().replace(/\/+$/, '');
if (rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
  rawUrl += '/api';
}
const BASE_URL = rawUrl;

async function safeFetchJson(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const text = await response.text();
    try {
      const data = JSON.parse(text);
      if (!response.ok && data.success === undefined) {
        data.success = false;
      }
      return data;
    } catch (e) {
      if (response.status === 413) {
        return { success: false, message: 'Resume file is too large. Please upload a file under 20 MB.' };
      }
      return { success: false, message: `Server error (${response.status}). Please try again.` };
    }
  } catch (err) {
    return { success: false, message: 'Network connection error. Please check your internet connection.' };
  }
}

export const api = {
  // Candidate Registration
  async registerCandidate(formData) {
    return safeFetchJson(`${BASE_URL}/candidates/register`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
  },

  // Test Assessment APIs
  async startTest(candidateId) {
    return safeFetchJson(`${BASE_URL}/test/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId })
    });
  },

  async getSession(candidateId) {
    const response = await fetch(`${BASE_URL}/test/session/${candidateId}`);
    return response.json();
  },

  async getQuestion(candidateId, questionNumber) {
    const response = await fetch(`${BASE_URL}/test/question/${candidateId}/${questionNumber}`);
    return response.json();
  },

  async saveAnswer(candidateId, questionNumber, selectedOption) {
    const response = await fetch(`${BASE_URL}/test/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, questionNumber, selectedOption })
    });
    return response.json();
  },

  async submitTest(candidateId, isAuto = false, reason = '') {
    const response = await fetch(`${BASE_URL}/test/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, isAuto, reason })
    });
    return response.json();
  },

  async recordViolation(candidateId, reason = 'Tab switch / window blur') {
    const response = await fetch(`${BASE_URL}/test/violation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, reason })
    });
    return response.json();
  },

  async getTestStatus() {
    try {
      const response = await fetch(`${BASE_URL}/test/status`);
      return response.json();
    } catch (err) {
      return { success: true, isTestEnabled: true };
    }
  },

  // Admin APIs
  async adminLogin(username, password) {
    const response = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    return response.json();
  },

  async getCandidates(params = {}, token) {
    const query = new URLSearchParams(params).toString();
    const response = await fetch(`${BASE_URL}/admin/candidates?${query}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async getCandidateDetails(id, token) {
    const response = await fetch(`${BASE_URL}/admin/candidates/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async getSettings(token) {
    const response = await fetch(`${BASE_URL}/admin/settings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async updateSettings(key, value, token) {
    const response = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ key, value })
    });
    return response.json();
  },

  async resetActiveSession(token) {
    const response = await fetch(`${BASE_URL}/admin/reset-active-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async deleteCandidate(id, token) {
    const response = await fetch(`${BASE_URL}/admin/candidates/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  async bulkDeleteCandidates(candidateIds, token) {
    const response = await fetch(`${BASE_URL}/admin/candidates/bulk-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ candidateIds })
    });
    return response.json();
  },

  async deleteAllCandidates(token) {
    const response = await fetch(`${BASE_URL}/admin/candidates/delete-all`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.json();
  },

  getResumeUrl(candidateId, token) {
    return `${BASE_URL}/admin/resume/${candidateId}?token=${token}`;
  }
};
