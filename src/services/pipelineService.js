// Pipeline service for managing pipeline operations

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://pipeline-pro-api.onrender.com';

export const pipelineService = {
  // Get all pipelines
  async getPipelines(silent = false) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pipelines`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      if (!silent) console.error('Failed to fetch pipelines:', error);
      return [];
    }
  },

  // Create new pipeline
  async createPipeline(pipelineData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pipelines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineData),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to create pipeline:', error);
      return null;
    }
  },

  // Save pipeline (alias for createPipeline with standardized response)
  async savePipeline(pipelineData) {
    try {
      const result = await this.createPipeline(pipelineData);
      if (result && (result.id || result.data?.id || result.success !== false)) {
        return { success: true, data: result.data || result, id: result.id || result.data?.id };
      }
      return { success: false, error: result?.error || 'Failed to save pipeline' };
    } catch (error) {
      console.error('Failed to save pipeline:', error);
      return { success: false, error: error.message };
    }
  },

  // Update pipeline
  async updatePipeline(id, pipelineData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pipelines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pipelineData),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to update pipeline:', error);
      return null;
    }
  },

  // Delete pipeline
  async deletePipeline(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pipelines/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to delete pipeline:', error);
      return false;
    }
  },
};
