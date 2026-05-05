import React from 'react'

function VisualPipeline({ steps = [], currentStepIndex = 0, status = 'idle', platform = 'generic-cicd' }) {
  // AWS Infrastructure specific step definitions
  const getAWSInfrastructureSteps = () => {
    return [
      { name: 'VPC Creation', description: 'Creating Virtual Private Cloud', duration: 1500 },
      { name: 'Subnet Setup', description: 'Configuring public and private subnets', duration: 1200 },
      { name: 'Security Groups', description: 'Setting up firewall rules', duration: 1000 },
      { name: 'IAM Role', description: 'Creating service roles and permissions', duration: 1300 },
      { name: 'Compute Resources', description: 'Provisioning EC2/ECS/Lambda instances', duration: 2000 },
      { name: 'Deployment', description: 'Deploying application to infrastructure', duration: 1800 }
    ];
  };

  // Use AWS steps if platform is AWS and no steps provided
  const displaySteps = steps.length === 0 && platform === 'aws-infrastructure' 
    ? getAWSInfrastructureSteps() 
    : steps;

  const getStepIcon = (stepName, platform) => {
    // AWS Infrastructure specific icons
    if (platform === 'aws-infrastructure') {
      if (stepName.includes('VPC') || stepName.includes('Virtual')) return '🌐';
      if (stepName.includes('Subnet') || stepName.includes('Networking')) return '🔗';
      if (stepName.includes('Security') || stepName.includes('Groups')) return '🔐';
      if (stepName.includes('IAM') || stepName.includes('Role')) return '🔑';
      if (stepName.includes('EC2') || stepName.includes('Compute')) return '🖥️';
      if (stepName.includes('ECS') || stepName.includes('Container')) return '🐳';
      if (stepName.includes('Lambda') || stepName.includes('Function')) return '⚡';
      if (stepName.includes('Deploy')) return '📦';
    }
    
    // Docker Infrastructure specific icons
    if (platform === 'docker-infrastructure') {
      if (stepName.includes('Build')) return '🐳';
      if (stepName.includes('Push')) return '📤';
      if (stepName.includes('Pull')) return '📥';
      if (stepName.includes('Run')) return '▶️';
      if (stepName.includes('Scale')) return '📈';
    }
    
    // GitHub Actions specific icons
    if (platform === 'github-actions') {
      if (stepName.includes('Checkout')) return '📥';
      if (stepName.includes('Setup')) return '⚙️';
      if (stepName.includes('Install')) return '📦';
      if (stepName.includes('Test')) return '🧪';
      if (stepName.includes('Build')) return '🔨';
      if (stepName.includes('Deploy')) return '🚀';
    }
    
    // Default icons
    if (stepName.includes('Source')) return '📥';
    if (stepName.includes('Install')) return '📦';
    if (stepName.includes('Test')) return '🧪';
    if (stepName.includes('Build')) return '🔨';
    if (stepName.includes('Deploy')) return '🚀';
    
    return '⚙️';
  };

  const getStepColor = (index, currentStepIndex, status) => {
    if (status === 'failed' && index === currentStepIndex) return 'border-error bg-error/10';
    if (index < currentStepIndex) return 'border-success bg-success/10';
    if (index === currentStepIndex && status === 'running') return 'border-primary bg-primary/10 animate-pulse';
    return 'border-border bg-surface';
  };

  const getPlatformTitle = (platform) => {
    switch (platform) {
      case 'aws-infrastructure': return 'AWS Infrastructure Deployment';
      case 'docker-infrastructure': return 'Docker Container Pipeline';
      case 'github-actions': return 'GitHub Actions Workflow';
      default: return 'CI/CD Pipeline';
    }
  };

  const getPlatformDescription = (platform) => {
    switch (platform) {
      case 'aws-infrastructure': return 'Deploying cloud infrastructure with VPC, Security Groups, IAM, and Compute Resources';
      case 'docker-infrastructure': return 'Building and deploying containerized applications';
      case 'github-actions': return 'Automated software development lifecycle';
      default: return 'Continuous integration and deployment';
    }
  };

  const getAWSFlowDiagram = () => {
    if (platform !== 'aws-infrastructure') return null;
    
    return (
      <div className="mt-8 p-6 bg-surface-secondary rounded-xl border border-border">
        <h4 className="text-sm font-bold text-text mb-4">AWS Infrastructure Flow</h4>
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2"></div>
          
          {['VPC', 'Security', 'IAM', 'Compute', 'Deploy'].map((stage, index) => (
            <div key={stage} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                index < currentStepIndex ? 'bg-success text-white' :
                index === currentStepIndex && status === 'running' ? 'bg-primary text-white animate-pulse' :
                'bg-surface border-2 border-border text-text-muted'
              }`}>
                {index < currentStepIndex ? '✓' : stage.charAt(0)}
              </div>
              <span className="text-xs text-text-muted mt-2">{stage}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (displaySteps.length === 0) {
    return (
      <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
        <div className="text-center py-8">
          <div className="text-4xl mb-4">⚡</div>
          <p className="text-text-secondary">No pipeline steps to visualize</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text mb-2">{getPlatformTitle(platform)}</h3>
        <p className="text-sm text-text-muted">{getPlatformDescription(platform)}</p>
      </div>

      {/* Visual Pipeline Steps */}
      <div className="relative">
        {/* Progress Line Background */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-border"></div>
        
        {/* Animated Progress Line */}
        <div 
          className="absolute top-8 left-0 h-0.5 bg-success transition-all duration-1000 ease-out"
          style={{ 
            width: `${(currentStepIndex / (displaySteps.length - 1)) * 100}%` 
          }}
        ></div>

        {/* Pipeline Steps */}
        <div className="relative flex justify-between items-start">
          {displaySteps.map((step, index) => (
            <div key={index} className="flex flex-col items-center group">
              {/* Step Node */}
              <div 
                className={`
                  relative z-10 w-16 h-16 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 cursor-pointer hover:scale-110
                  ${getStepColor(index, currentStepIndex, status)}
                `}
              >
                <span className="text-xl">{getStepIcon(step.name, platform)}</span>
                
                {/* Status Indicator */}
                {index === currentStepIndex && status === 'running' && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
                )}
                
                {index < currentStepIndex && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                
                {status === 'failed' && index === currentStepIndex && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✕</span>
                  </div>
                )}
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center max-w-20">
                <p className="text-xs font-medium text-text group-hover:text-primary transition-colors">
                  {step.name}
                </p>
                <p className="text-xs text-text-muted mt-1 hidden group-hover:block">
                  {step.duration}ms
                </p>
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20">
                <div className="bg-gray-900 text-white text-xs rounded-lg p-2 whitespace-nowrap">
                  <p className="font-medium">{step.name}</p>
                  {step.description && (
                    <p className="text-gray-300 mt-1">{step.description}</p>
                  )}
                  <p className="text-gray-400 mt-1">Duration: {step.duration}ms</p>
                </div>
                <div className="w-2 h-2 bg-gray-900 rotate-45 absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AWS Flow Diagram */}
      {getAWSFlowDiagram()}

      {/* Status Summary */}
      <div className="mt-8 p-4 bg-surface-secondary rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              status === 'running' ? 'bg-primary animate-pulse' :
              status === 'success' ? 'bg-success' :
              status === 'failed' ? 'bg-error' :
              'bg-border'
            }`}></div>
            <span className="text-sm font-medium text-text">
              {status === 'running' ? 'Pipeline Running' :
               status === 'success' ? 'Pipeline Completed Successfully' :
               status === 'failed' ? 'Pipeline Failed' :
               'Pipeline Ready'}
            </span>
          </div>
          
          <div className="text-xs text-text-muted">
            Step {currentStepIndex + 1} of {displaySteps.length}
          </div>
        </div>
        
        {status === 'running' && displaySteps[currentStepIndex] && (
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-sm text-text">
              Currently executing: <span className="font-medium">{displaySteps[currentStepIndex].name}</span>
            </p>
            {displaySteps[currentStepIndex].description && (
              <p className="text-xs text-text-muted mt-1">{displaySteps[currentStepIndex].description}</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualPipeline;
