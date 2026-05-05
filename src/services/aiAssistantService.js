// AI Assistant Service
// Handles AI-powered pipeline fixing and generation

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pipeline-pro-api.onrender.com';

const aiService = {
  async fixAllFiles(currentFile, relatedFiles = []) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fixAll',
          currentFile,
          relatedFiles
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      console.warn('[AI] fixAllFiles failed:', err.message);
      // Return a fallback result so the UI doesn't crash
      return {
        fixedFiles: [{
          path: currentFile?.path || 'pipeline.yml',
          content: currentFile?.content || '',
          changes: 'AI service unavailable - no changes made'
        }],
        errors: [{ message: err.message, severity: 'warning' }],
        suggestions: []
      };
    }
  },

  async generatePipeline(options) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'generate', ...options })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('[AI] generatePipeline failed:', err.message);
      return { success: false, error: err.message };
    }
  },

  async fixPipeline(code, context = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fix', code, context })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (err) {
      console.warn('[AI] fixPipeline failed:', err.message);
      return { success: false, error: err.message };
    }
  }
};

export default aiService;
