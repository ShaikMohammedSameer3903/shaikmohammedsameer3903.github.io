import React, { useState, useEffect } from 'react'

function VisualExecution({ steps = [], currentStepIndex, status, platform }) {
  const [animatedSteps, setAnimatedSteps] = useState([])
  const [hoveredStep, setHoveredStep] = useState(null)

  useEffect(() => {
    // Initialize steps with animation delays
    const initializedSteps = steps.map((step, index) => ({
      ...step,
      isActive: index === currentStepIndex,
      isCompleted: index < currentStepIndex,
      isFailed: status === 'failed' && index === currentStepIndex,
      animationDelay: index * 100
    }))
    setAnimatedSteps(initializedSteps)
  }, [steps, currentStepIndex, status])

  const getStepIcon = (stepName, platform) => {
    // Platform-specific icons
    if (platform === 'aws-infrastructure') {
      if (stepName.includes('VPC')) return '🌐'
      if (stepName.includes('Subnet') || stepName.includes('Networking')) return '🔗'
      if (stepName.includes('Security') || stepName.includes('IAM')) return '🔐'
      if (stepName.includes('EC2') || stepName.includes('Instance')) return '🖥️'
      if (stepName.includes('Deploy')) return '📦'
    }
    
    if (platform === 'docker-infrastructure') {
      if (stepName.includes('Build')) return '🐳'
      if (stepName.includes('Push')) return '📤'
      if (stepName.includes('Pull')) return '📥'
      if (stepName.includes('Run')) return '▶️'
      if (stepName.includes('Scale')) return '📈'
    }
    
    // Default GitHub Actions icons
    if (stepName.includes('Checkout') || stepName.includes('Source')) return '📥'
    if (stepName.includes('Setup') || stepName.includes('Install')) return '⚙️'
    if (stepName.includes('Test')) return '🧪'
    if (stepName.includes('Build')) return '🔨'
    if (stepName.includes('Deploy')) return '🚀'
    
    return '📦'
  }

  const getStepColor = (step) => {
    if (step.isFailed) return 'bg-error text-white border-error'
    if (step.isActive) return 'bg-primary text-white border-primary shadow-premium shadow-primary/30'
    if (step.isCompleted) return 'bg-success text-white border-success'
    return 'bg-surface-secondary text-text-muted border-border'
  }

  const getConnectorColor = (index) => {
    if (index === 0) return 'bg-border'
    const prevStep = animatedSteps[index - 1]
    if (prevStep?.isCompleted) return 'bg-success'
    if (prevStep?.isFailed) return 'bg-error'
    if (prevStep?.isActive) return 'bg-primary'
    return 'bg-border'
  }

  const getPlatformTitle = () => {
    switch (platform) {
      case 'aws-infrastructure': return 'AWS Infrastructure Deployment'
      case 'docker-infrastructure': return 'Docker Container Pipeline'
      case 'github-actions': return 'GitHub Actions Workflow'
      default: return 'CI/CD Pipeline Execution'
    }
  }

  const getPlatformDescription = () => {
    switch (platform) {
      case 'aws-infrastructure': return 'Deploying to AWS cloud infrastructure'
      case 'docker-infrastructure': return 'Building and deploying Docker containers'
      case 'github-actions': return 'Running GitHub Actions workflow'
      default: return 'Executing CI/CD pipeline'
    }
  }

  return (
    <div className="bg-surface rounded-xl shadow-card p-6 border border-border animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-premium">
            <span className="text-white text-lg">⚡</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-text">{getPlatformTitle()}</h2>
            <p className="text-sm text-text-secondary">{getPlatformDescription()}</p>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
          status === 'success' ? 'bg-success/10 text-success border border-success/20' :
          status === 'failed' ? 'bg-error/10 text-error border border-error/20' :
          status === 'running' ? 'bg-primary/10 text-primary border border-primary/20' :
          'bg-surface-secondary text-text-muted border border-border'
        }`}>
          {status === 'success' ? '✅ Deployment Complete' :
           status === 'failed' ? '❌ Deployment Failed' :
           status === 'running' ? '🔄 In Progress' :
           '⏸️ Ready to Deploy'}
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="relative">
        {/* Connection Lines */}
        <div className="absolute top-12 left-0 right-0 flex items-center">
          {animatedSteps.map((_, index) => (
            <div key={index} className="flex-1 h-1 overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ease-out ${getConnectorColor(index)}`}
                style={{
                  transform: animatedSteps[index - 1]?.isCompleted ? 'scaleX(1)' : 'scaleX(0)',
                  transformOrigin: 'left'
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div className="relative flex justify-between items-center">
          {animatedSteps.map((step, index) => {
            const isHovered = hoveredStep === index
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center group cursor-pointer"
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  animation: `slideInUp 0.5s ease-out ${step.animationDelay}ms both`
                }}
              >
                {/* Step Node */}
                <div 
                  className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-2xl font-bold transition-all duration-300 border-2 ${
                    getStepColor(step)
                  } ${
                    step.isActive ? 'scale-110 animate-pulse' : ''
                  } ${
                    isHovered ? 'scale-105' : ''
                  }`}
                >
                  {step.isActive ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : step.isCompleted ? (
                    '✓'
                  ) : step.isFailed ? (
                    '✕'
                  ) : (
                    <>
                      <span className="text-2xl mb-1">{getStepIcon(step.name, platform)}</span>
                      <span className="text-xs font-medium">{index + 1}</span>
                    </>
                  )}
                </div>

                {/* Step Name */}
                <div className="mt-4 text-center max-w-24">
                  <p className={`text-sm font-bold transition-colors ${
                    step.isFailed ? 'text-error' :
                    step.isCompleted ? 'text-success' :
                    step.isActive ? 'text-primary' :
                    'text-text-secondary'
                  }`}>
                    {step.name}
                  </p>
                  {step.isActive && (
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100"></div>
                      <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200"></div>
                    </div>
                  )}
                </div>

                {/* Hover Tooltip */}
                {isHovered && (
                  <div className="absolute bottom-full mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-sm rounded-xl px-4 py-3 whitespace-nowrap shadow-premium">
                      <p className="font-bold mb-1">{step.name}</p>
                      <p className="text-gray-400 text-xs">
                        {step.isFailed ? 'Execution failed' :
                         step.isCompleted ? 'Completed successfully' :
                         step.isActive ? 'Currently executing' :
                         'Waiting to execute'}
                      </p>
                      {step.duration && (
                        <p className="text-gray-500 text-xs mt-1">
                          Duration: {step.duration}ms
                        </p>
                      )}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Progress Information */}
      <div className="mt-12 p-6 bg-gradient-to-r from-surface-secondary to-surface-tertiary rounded-xl border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full transition-all duration-300 ${
              status === 'success' ? 'bg-success' :
              status === 'failed' ? 'bg-error' :
              status === 'running' ? 'bg-primary animate-pulse' :
              'bg-text-muted'
            }`}></div>
            <span className="text-base font-bold text-text">
              {status === 'success' ? '🎉 Deployment completed successfully!' :
               status === 'failed' ? '💥 Deployment failed at this stage' :
               status === 'running' ? `⚡ Executing: ${animatedSteps[currentStepIndex]?.name || 'Unknown'}` :
               '⏸️ Ready to start deployment'}
            </span>
          </div>
          <div className="text-sm text-text-muted font-medium">
            Step {Math.min(currentStepIndex + 1, animatedSteps.length)} of {animatedSteps.length}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative">
          <div className="w-full bg-border rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-1000 ease-out rounded-full relative"
              style={{ 
                width: status === 'success' ? '100%' : 
                       status === 'failed' ? `${((currentStepIndex + 1) / animatedSteps.length) * 100}%` :
                       status === 'running' ? `${((currentStepIndex + 1) / animatedSteps.length) * 100}%` :
                       '0%'
              }}
            >
              {status === 'running' && (
                <div className="absolute right-0 top-0 w-3 h-3 bg-white rounded-full animate-pulse"></div>
              )}
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-text-muted">0%</span>
            <span className="text-xs text-text-muted font-bold">
              {status === 'success' ? '100%' : 
               status === 'failed' ? `${Math.round(((currentStepIndex + 1) / animatedSteps.length) * 100)}%` :
               status === 'running' ? `${Math.round(((currentStepIndex + 1) / animatedSteps.length) * 100)}%` :
               '0%'}
            </span>
            <span className="text-xs text-text-muted">100%</span>
          </div>
        </div>
      </div>

      {/* Current Step Details */}
      {status === 'running' && animatedSteps[currentStepIndex] && (
        <div className="mt-6 p-6 bg-gradient-to-r from-primary/5 to-primary/10 rounded-xl border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center animate-pulse">
              <span className="text-white text-xl">{getStepIcon(animatedSteps[currentStepIndex].name, platform)}</span>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-primary">Currently Executing</p>
              <p className="text-sm text-text-secondary">
                {animatedSteps[currentStepIndex].name}
                {animatedSteps[currentStepIndex].duration && (
                  <span className="ml-2 text-text-muted">
                    • {animatedSteps[currentStepIndex].duration}ms
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
            </div>
          </div>
        </div>
      )}

      {/* Success Summary */}
      {status === 'success' && (
        <div className="mt-6 p-6 bg-gradient-to-r from-success/5 to-success/10 rounded-xl border border-success/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-success rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">🎉</span>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-success">Deployment Completed Successfully</p>
              <p className="text-sm text-text-secondary">
                All {animatedSteps.length} steps executed without errors
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Details */}
      {status === 'failed' && (
        <div className="mt-6 p-6 bg-gradient-to-r from-error/5 to-error/10 rounded-xl border border-error/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-error rounded-xl flex items-center justify-center">
              <span className="text-white text-xl">⚠️</span>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-error">Deployment Failed</p>
              <p className="text-sm text-text-secondary">
                Pipeline stopped at: {animatedSteps[currentStepIndex]?.name || 'Unknown step'}
              </p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .delay-100 {
          animation-delay: 100ms;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
      `}</style>
    </div>
  )
}

export default VisualExecution
