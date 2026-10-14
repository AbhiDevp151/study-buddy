/**
 * Study Buddy - Frontend API Service (client/src/services/api.js)
 * Handles communication with the Express backend using JWT authentication.
 */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getAuthHeaders = () => {
  const token = localStorage.getItem('study_buddy_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const authAPI = {
  login: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) localStorage.setItem('study_buddy_token', data.token);
    return data;
  },
  register: async (email, password) => {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.token) localStorage.setItem('study_buddy_token', data.token);
    return data;
  }
};

export const notesAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/notes`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },
  create: async (noteData) => {
    const res = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(noteData)
    });
    return res.json();
  },
  update: async (id, noteData) => {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(noteData)
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const tasksAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/tasks`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData)
    });
    return res.json();
  },
  toggle: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}/toggle`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return res.json();
  },
  delete: async (id) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  }
};

export const focusAPI = {
  getAll: async () => {
    const res = await fetch(`${API_BASE_URL}/focus`, { headers: getAuthHeaders() });
    return res.json();
  },
  create: async (sessionData) => {
    const res = await fetch(`${API_BASE_URL}/focus`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(sessionData)
    });
    return res.json();
  }
};