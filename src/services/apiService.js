// API Service for PipeLinePro
// NOTE: This is a secondary/legacy service. Prefer src/services/pipelineService.js for most use cases.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pipeline-pro-api.onrender.com';

const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  };
  try {
    const response = await fetch(url, config);
    
    // Check if response exists before accessing its properties
    if (!response) {
      throw new Error('No response received from server');
    }
    
    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.error || `API Error: ${response.status}`);
    }
    return await response.json();
  } catch (err) {
    console.error(`[API] ${endpoint} failed:`, err.message);
    
    // Return fallback object instead of throwing to prevent app crashes
    return {
      success: false,
      error: err.message || 'API request failed',
      fallback: true,
      data: null
    };
  }
};

export const pipelineService = {
  // Save pipeline to backend
  async savePipeline(pipelineData) {
    try {
      const result = await apiRequest('/api/pipelines', {
        method: 'POST',
        body: JSON.stringify(pipelineData)
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to save pipeline:', error);
      throw new Error(`Failed to save pipeline: ${error.message}`);
    }
  },

  // Get all pipelines for user
  async getPipelines() {
    try {
      const pipelines = await apiRequest('/api/pipelines');
      return { success: true, data: pipelines };
    } catch (error) {
      console.error('Failed to fetch pipelines:', error);
      throw new Error(`Failed to fetch pipelines: ${error.message}`);
    }
  },

  // Delete pipeline
  async deletePipeline(pipelineId) {
    try {
      await apiRequest(`/api/pipelines/${pipelineId}`, {
        method: 'DELETE'
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to delete pipeline:', error);
      throw new Error(`Failed to delete pipeline: ${error.message}`);
    }
  },

  // Generate pipeline code
  async generatePipeline(platform, language, deployment) {
    try {
      const result = await apiRequest('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ platform, language, deployment })
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to generate pipeline:', error);
      throw new Error(`Failed to generate pipeline: ${error.message}`);
    }
  },

  // Simulate pipeline execution
  async simulatePipeline(code) {
    try {
      const result = await apiRequest('/api/simulate', {
        method: 'POST',
        body: JSON.stringify({ code })
      });
      return { success: true, data: result };
    } catch (error) {
      console.error('Failed to simulate pipeline:', error);
      throw new Error(`Failed to simulate pipeline: ${error.message}`);
    }
  },

  // Get templates
  async getTemplates() {
    try {
      const templates = await apiRequest('/api/templates');
      return { success: true, data: templates };
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      throw new Error(`Failed to fetch templates: ${error.message}`);
    }
  },

  // Check API health
  async checkHealth() {
    try {
      const health = await apiRequest('/api/health');
      return { success: true, data: health };
    } catch (error) {
      console.error('API health check failed:', error);
      throw new Error(`API health check failed: ${error.message}`);
    }
  }
};
