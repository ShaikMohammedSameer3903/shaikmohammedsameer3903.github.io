const express = require('express');
const router = express.Router();
const {
  generatePipelineHandler,
  simulatePipelineHandler,
  advancedSimulatePipelineHandler,
  getExecutionPlanHandler,
  getTemplatesHandler,
  getPlatformsHandler,
  getLanguagesHandler,
  getDeploymentsHandler
} = require('../controllers/pipelineController');

// POST /api/pipelines/generate - Generate a CI/CD pipeline (frontend expects this path)
router.post('/pipelines/generate', generatePipelineHandler);

// POST /api/generate - Legacy endpoint (backward compatibility)
router.post('/generate', generatePipelineHandler);

// POST /api/simulate - Simulate pipeline execution (main endpoint)
router.post('/simulate', simulatePipelineHandler);

// POST /api/simulate/advanced - Advanced pipeline simulation
router.post('/simulate/advanced', advancedSimulatePipelineHandler);

// POST /api/execution-plan - Get execution plan preview
router.post('/execution-plan', getExecutionPlanHandler);

// GET /api/templates - Get all templates
router.get('/templates', getTemplatesHandler);

// GET /api/platforms - Get available platforms
router.get('/platforms', getPlatformsHandler);

// GET /api/languages - Get available languages for a platform
router.get('/languages', getLanguagesHandler);

// GET /api/deployments - Get available deployments for platform/language
router.get('/deployments', getDeploymentsHandler);

// GET /api/profile - Get user profile (CRITICAL: frontend calls this)
router.get('/profile', (req, res) => {
  try {
    // Mock user data - in production, get from auth token
    const mockProfile = {
      id: 'user_123',
      name: 'Demo User',
      email: 'demo@pipeline-pro.tech',
      avatar: null,
      createdAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: mockProfile
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile'
    });
  }
});

// GET /api/analytics - Get user analytics (CRITICAL: frontend calls this)
router.get('/analytics', (req, res) => {
  try {
    // Mock analytics data - in production, get from database
    const mockAnalytics = {
      totalPipelines: 12,
      simulationsRun: 47,
      successfulDeploys: 38,
      successRate: 81,
      recentActivity: [
        { action: 'pipeline_created', timestamp: new Date().toISOString() },
        { action: 'simulation_run', timestamp: new Date(Date.now() - 3600000).toISOString() }
      ]
    };
    
    res.json({
      success: true,
      data: mockAnalytics
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics'
    });
  }
});

// CRUD operations for pipelines
let pipelines = []; // In-memory storage (in production, use database)

// GET /api/pipelines - Get all pipelines
router.get('/pipelines', (req, res) => {
  try {
    res.json({
      success: true,
      data: pipelines.reverse() // Newest first
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch pipelines'
    });
  }
});

// POST /api/pipelines - Create new pipeline
router.post('/pipelines', (req, res) => {
  try {
    const pipelineData = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    pipelines.push(pipelineData);
    
    res.status(201).json({
      success: true,
      data: pipelineData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create pipeline'
    });
  }
});

// DELETE /api/pipelines/:id - Delete pipeline
router.delete('/pipelines/:id', (req, res) => {
  try {
    const { id } = req.params;
    const index = pipelines.findIndex(p => p.id === id);
    
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Pipeline not found'
      });
    }
    
    pipelines.splice(index, 1);
    
    res.json({
      success: true,
      message: 'Pipeline deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete pipeline'
    });
  }
});

module.exports = router;
