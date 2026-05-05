// Safe Fetch Utility
// Wraps fetch with error handling, timeout, and offline detection

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pipeline-pro-api.onrender.com';

export async function safeApiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 30000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorBody}`,
        offline: false
      };
    }

    const data = await response.json();
    return { success: true, data, offline: false };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === 'AbortError') {
      return { success: false, error: 'Request timed out', offline: false };
    }

    // Network error = likely offline
    return {
      success: false,
      error: err.message || 'Network error',
      offline: true
    };
  }
}

export default { safeApiRequest };
