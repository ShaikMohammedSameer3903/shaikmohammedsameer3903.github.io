import React from 'react';

function VisualPipeline({ currentStep, status, steps = [] }) {
  const getStepIcon = (stepName) => {
    if (stepName.includes('Checkout') || stepName.includes('Source')) return '📥';
    if (stepName.includes('Setup') || stepName.includes('Install')) return '⚙️';
    if (stepName.includes('Test')) return '🧪';
    if (stepName.includes('Build')) return '🔨';
    if (stepName.includes('Deploy')) return '🚀';
    if (stepName.includes('VPC') || stepName.includes('Network')) return '🌐';
    if (stepName.includes('Security') || stepName.includes('IAM')) return '🔒';
    if (stepName.includes('EC2') || stepName.includes('Instance')) return '🖥️';
    if (stepName.includes('Docker')) return '🐳';
    return '📦';
  };

  const getStepStatus = (step, index, allSteps) => {
    if (status === 'idle') return 'pending';
    if (status === 'failed' && index === allSteps.length - 1) return 'failed';
    if (status === 'running' && index <= currentStep) return 'running';
    if (status === 'success' && index < allSteps.length) return 'success';
    return 'pending';
  };

  const getStepColor = (stepStatus) => {
    switch (stepStatus) {
      case 'success': return 'bg-success text-white';
      case 'running': return 'bg-primary text-white animate-pulse';
      case 'failed': return 'bg-error text-white';
      case 'pending': return 'bg-surface-secondary text-text-muted';
      default: return 'bg-surface-secondary text-text-muted';
    }
  };

  const getConnectorColor = (index, allSteps) => {
    if (status === 'idle') return 'bg-border';
    if (status === 'failed' && index >= currentStep) return 'bg-border';
    if (status === 'success' && index < allSteps.length - 1) return 'bg-success';
    if (status === 'running' && index < currentStep) return 'bg-success';
    return 'bg-border';
  };

  // Default steps if none provided
  const defaultSteps = [
    'Source Checkout',
    'Install Dependencies', 
    'Run Tests',
    'Build Application',
    'Deploy Application'
  ];

  const pipelineSteps = steps.length > 0 ? steps.map(s => s.name) : defaultSteps;

  return (
    <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">🔄</span>
          </div>
          <h2 className="text-lg font-bold text-text">Pipeline Flow</h2>
        </div>
        <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
          status === 'success' ? 'bg-success/10 text-success border border-success/20' :
          status === 'failed' ? 'bg-error/10 text-error border border-error/20' :
          status === 'running' ? 'bg-primary/10 text-primary border border-primary/20' :
          'bg-surface-secondary text-text-muted border border-border'
        }`}>
          {status === 'success' ? '✅ Completed' :
           status === 'failed' ? '❌ Failed' :
           status === 'running' ? '🔄 Running' :
           '⏸️ Ready'}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-border z-0"></div>
        
        {/* Animated Progress Line */}
        {status === 'running' && (
          <div 
            className="absolute top-8 left-0 h-0.5 bg-primary z-0 transition-all duration-1000 ease-out"
            style={{ 
              width: `${((currentStep + 1) / pipelineSteps.length) * 100}%` 
            }}
          ></div>
        )}

        {/* Steps */}
        <div className="relative z-10 flex justify-between items-center">
          {pipelineSteps.map((step, index) => {
            const stepStatus = getStepStatus(step, index, pipelineSteps);
            const isActive = index === currentStep && status === 'running';
            
            return (
              <div key={index} className="flex flex-col items-center group">
                {/* Step Node */}
                <div 
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                    getStepColor(stepStatus)
                  } ${
                    isActive ? 'scale-110 shadow-premium shadow-primary/30' : ''
                  } ${
                    stepStatus === 'success' ? 'shadow-soft' : ''
                  } ${
                    stepStatus === 'failed' ? 'shadow-error' : ''
                  }`}
                >
                  {stepStatus === 'running' ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : stepStatus === 'success' ? (
                    '✓'
                  ) : stepStatus === 'failed' ? (
                    '✕'
                  ) : (
                    getStepIcon(step)
                  )}
                </div>

                {/* Step Name */}
                <div className="mt-3 text-center max-w-20">
                  <p className={`text-xs font-medium ${
                    stepStatus === 'success' ? 'text-success' :
                    stepStatus === 'failed' ? 'text-error' :
                    stepStatus === 'running' ? 'text-primary' :
                    'text-text-muted'
                  }`}>
                    {step}
                  </p>
                  {stepStatus === 'running' && (
                    <p className="text-xs text-text-muted mt-1">Running...</p>
                  )}
                </div>

                {/* Hover Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
                    <p className="font-medium">{step}</p>
                    <p className="text-gray-400">
                      {stepStatus === 'success' ? 'Completed successfully' :
                       stepStatus === 'failed' ? 'Execution failed' :
                       stepStatus === 'running' ? 'Currently executing' :
                       'Waiting to execute'}
                    </p>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Information */}
      <div className="mt-8 p-4 bg-surface-secondary rounded-lg border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status === 'success' ? 'bg-success' :
              status === 'failed' ? 'bg-error' :
              status === 'running' ? 'bg-primary animate-pulse' :
              'bg-text-muted'
            }`}></div>
            <span className="text-sm font-medium text-text">
              {status === 'success' ? 'Pipeline completed successfully' :
               status === 'failed' ? 'Pipeline execution failed' :
               status === 'running' ? `Executing step: ${pipelineSteps[currentStep] || 'Unknown'}` :
               'Pipeline ready to start'}
            </span>
          </div>
          <div className="text-xs text-text-muted">
            Step {currentStep + 1} of {pipelineSteps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="w-full bg-border rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
              style={{ 
                width: status === 'success' ? '100%' : 
                       status === 'failed' ? `${((currentStep + 1) / pipelineSteps.length) * 100}%` :
                       status === 'running' ? `${((currentStep + 1) / pipelineSteps.length) * 100}%` :
                       '0%'
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Step Details */}
      {status === 'running' && currentStep < pipelineSteps.length && (
        <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center animate-pulse">
              <span className="text-white text-sm">⚡</span>
            </div>
            <div>
              <p className="text-sm font-medium text-primary">Currently Executing</p>
              <p className="text-xs text-text-secondary">{pipelineSteps[currentStep]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {status === 'failed' && (
        <div className="mt-4 p-4 bg-error/5 rounded-lg border border-error/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-error rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⚠️</span>
            </div>
            <div>
              <p className="text-sm font-medium text-error">Execution Failed</p>
              <p className="text-xs text-text-secondary">Pipeline stopped at step: {pipelineSteps[currentStep]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Summary */}
      {status === 'success' && (
        <div className="mt-4 p-4 bg-success/5 rounded-lg border border-success/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-success rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎉</span>
            </div>
            <div>
              <p className="text-sm font-medium text-success">Pipeline Completed Successfully</p>
              <p className="text-xs text-text-secondary">All {pipelineSteps.length} steps executed without errors</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VisualPipeline;
