const { generatePipeline, getAllTemplates, getAvailablePlatforms, getAvailableLanguages, getAvailableDeployments } = require('../services/generatorService');
const { simulatePipeline, quickSimulate } = require('../services/simulatorService');
const advancedSimulatorService = require('../services/advancedSimulatorService');

const generatePipelineHandler = (req, res) => {
  try {
    const { platform, language, deployment } = req.body;

    // Validate input
    if (!platform || !language || !deployment) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'platform, language, and deployment are required'
      });
    }

    // Generate pipeline
    const pipelineCode = generatePipeline(platform, language, deployment);

    res.json({
      success: true,
      data: {
        platform,
        language,
        deployment,
        pipelineCode
      },
      message: 'Pipeline generated successfully'
    });
  } catch (error) {
    console.error('Error in generatePipelineHandler:', error);
    res.status(500).json({
      error: 'Failed to generate pipeline',
      message: error.message
    });
  }
};

// Advanced simulation handler
const advancedSimulatePipelineHandler = async (req, res) => {
  try {
    const { code } = req.body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline code is required and must be a string'
      });
    }

    // Start advanced simulation
    const result = await advancedSimulatorService.simulatePipeline(code);

    res.json({
      success: true,
      data: result,
      message: 'Advanced pipeline simulation completed'
    });
  } catch (error) {
    console.error('Error in advancedSimulatePipelineHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate pipeline',
      error: error.message
    });
  }
};

// Get execution plan handler
const getExecutionPlanHandler = (req, res) => {
  try {
    const { code } = req.body;

    // Validate input
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline code is required and must be a string'
      });
    }

    const plan = advancedSimulatorService.getExecutionPlan(code);

    res.json({
      success: true,
      data: plan,
      message: 'Execution plan retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getExecutionPlanHandler:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get execution plan',
      error: error.message
    });
  }
};

const simulatePipelineHandler = async (req, res) => {
  try {
    const { pipelineCode, mode = 'full' } = req.body;

    // Validate input
    if (!pipelineCode) {
      return res.status(400).json({
        error: 'Missing pipeline code',
        message: 'pipelineCode is required'
      });
    }

    let result;
    if (mode === 'quick') {
      result = quickSimulate(pipelineCode);
    } else {
      result = await simulatePipeline(pipelineCode);
    }

    res.json({
      success: true,
      data: result,
      message: 'Pipeline simulation completed'
    });
  } catch (error) {
    console.error('Error in simulatePipelineHandler:', error);
    res.status(500).json({
      error: 'Failed to simulate pipeline',
      message: error.message
    });
  }
};

const getTemplatesHandler = (req, res) => {
  try {
    const templates = getAllTemplates();

    res.json({
      success: true,
      data: templates,
      message: 'Templates retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getTemplatesHandler:', error);
    res.status(500).json({
      error: 'Failed to retrieve templates',
      message: error.message
    });
  }
};

const getPlatformsHandler = (req, res) => {
  try {
    const platforms = getAvailablePlatforms();

    res.json({
      success: true,
      data: platforms,
      message: 'Platforms retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getPlatformsHandler:', error);
    res.status(500).json({
      error: 'Failed to retrieve platforms',
      message: error.message
    });
  }
};

const getLanguagesHandler = (req, res) => {
  try {
    const { platform } = req.query;

    if (!platform) {
      return res.status(400).json({
        error: 'Missing platform parameter',
        message: 'platform query parameter is required'
      });
    }

    const languages = getAvailableLanguages(platform);

    res.json({
      success: true,
      data: languages,
      message: 'Languages retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getLanguagesHandler:', error);
    res.status(500).json({
      error: 'Failed to retrieve languages',
      message: error.message
    });
  }
};

const getDeploymentsHandler = (req, res) => {
  try {
    const { platform, language } = req.query;

    if (!platform || !language) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'platform and language query parameters are required'
      });
    }

    const deployments = getAvailableDeployments(platform, language);

    res.json({
      success: true,
      data: deployments,
      message: 'Deployments retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getDeploymentsHandler:', error);
    res.status(500).json({
      error: 'Failed to retrieve deployments',
      message: error.message
    });
  }
};

module.exports = {
  generatePipelineHandler,
  simulatePipelineHandler,
  advancedSimulatePipelineHandler,
  getExecutionPlanHandler,
  getTemplatesHandler,
  getPlatformsHandler,
  getLanguagesHandler,
  getDeploymentsHandler
};
