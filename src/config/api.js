// API Configuration for PipeLinePro
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pipeline-pro-api.onrender.com';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    PIPELINES: '/api/pipelines',
    GENERATE: '/api/generate',
    SIMULATE: '/api/simulate',
    TEMPLATES: '/api/templates',
    HEALTH: '/api/health',
    AI_PROCESS: '/api/ai/process',
    ANALYTICS: '/api/analytics',
    PROFILE: '/api/profile',
    API_KEYS: '/api/api-keys'
  },
  TIMEOUT: 30000
};

export const getApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
