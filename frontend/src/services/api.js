let rawUrl = (import.meta.env.VITE_API_BASE_URL || '/api').trim().replace(/\/+$/, '');
if (rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
  rawUrl += '/api';
}
const BASE_URL = rawUrl;

export const api = {
  // Candidate Registration
  async registerCandidate(formData) {
    const response = await fetch(`${BASE_URL}/candidates/register`, {
      method: 'POST',
      body: formData // multipart/form-data
    });
    return response.json();
  },

  // Test Assessment APIs
  async startTest(candidateId) {
    const response = await fetch(`${BASE_URL}/test/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId })
    });
    return response.json();
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

  async submitTest(candidateId, isAuto = false) {
    const response = await fetch(`${BASE_URL}/test/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateId, isAuto })
    });
    return response.json();
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
