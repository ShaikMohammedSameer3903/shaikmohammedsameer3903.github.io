const { simulatePipeline, quickSimulate } = require('../services/simulatorService');

const simulatePipelineController = async (req, res) => {
  try {
    const { code, pipelineCode, mode = 'full' } = req.body;

    // Support both parameter names for compatibility
    const actualCode = code || pipelineCode;

    // Validate input
    if (!actualCode || typeof actualCode !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Pipeline code is required and must be a string'
      });
    }

    let result;
    if (mode === 'quick') {
      result = quickSimulate(actualCode);
    } else {
      result = await simulatePipeline(actualCode);
    }

    res.json({
      success: true,
      data: result,
      message: 'Pipeline simulation completed successfully'
    });

  } catch (error) {
    console.error('Error in simulatePipelineController:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to simulate pipeline',
      error: error.message
    });
  }
};

module.exports = {
  simulatePipelineController
};
