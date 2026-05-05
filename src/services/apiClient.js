// API Client for PipeLinePro
// Centralized HTTP client with auth token injection and error handling

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pipeline-pro-api.onrender.com';

const getAuthHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  try {
    // Try multiple Supabase storage locations for the auth token
    const storageKeys = Object.keys(localStorage).filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    for (const key of storageKeys) {
      const authData = JSON.parse(localStorage.getItem(key) || '{}');
      const token = authData?.access_token || authData?.currentSession?.access_token;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        break;
      }
    }
    // Fallback: check old format
    if (!headers['Authorization']) {
      const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
      const token = authData?.currentSession?.access_token || authData?.access_token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch (e) { /* no token */ }
  return headers;
};

const apiClient = {
  async get(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        return { success: false, error: body?.error || `HTTP ${response.status}`, data: null };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.warn(`[API] GET ${endpoint} failed:`, err.message);
      return { success: false, error: err.message, data: null, fallback: true };
    }
  },

  async post(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        return { success: false, error: errBody?.error || `HTTP ${response.status}`, data: null };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.warn(`[API] POST ${endpoint} failed:`, err.message);
      return { success: false, error: err.message, data: null, fallback: true };
    }
  },

  async put(endpoint, body) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body)
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        return { success: false, error: errBody?.error || `HTTP ${response.status}`, data: null };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.warn(`[API] PUT ${endpoint} failed:`, err.message);
      return { success: false, error: err.message, data: null, fallback: true };
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => null);
        return { success: false, error: errBody?.error || `HTTP ${response.status}`, data: null };
      }
      const data = await response.json();
      return { success: true, data };
    } catch (err) {
      console.warn(`[API] DELETE ${endpoint} failed:`, err.message);
      return { success: false, error: err.message, data: null, fallback: true };
    }
  }
};

export default apiClient;
