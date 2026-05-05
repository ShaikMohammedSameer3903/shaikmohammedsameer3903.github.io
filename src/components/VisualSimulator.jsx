import React, { useState, useEffect } from 'react';

const VisualSimulator = ({ 
  isRunning, 
  currentStepIndex, 
  simulationSteps, 
  logs, 
  progress,
  platform 
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Animate progress bar
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStepIcon = (step, status) => {
    if (status === 'completed') return '✅';
    if (status === 'running') return '⚡';
    if (status === 'error') return '❌';
    
    // Default icons based on step name
    if (step.name.includes('VPC') || step.name.includes('Network')) return '🌐';
    if (step.name.includes('IAM') || step.name.includes('Security')) return '🔐';
    if (step.name.includes('EC2') || step.name.includes('Launch')) return '🖥️';
    if (step.name.includes('Deploy')) return '🚀';
    if (step.name.includes('Build')) return '🔨';
    if (step.name.includes('Test')) return '🧪';
    if (step.name.includes('Docker')) return '🐳';
    if (step.name.includes('Checkout') || step.name.includes('Source')) return '📥';
    if (step.name.includes('Install')) return '📦';
    
    return '⚙️';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success text-white';
      case 'running': return 'bg-primary text-white animate-pulse';
      case 'error': return 'bg-error text-white';
      default: return 'bg-gray-200 text-gray-400';
    }
  };

  const getConnectorColor = (index) => {
    if (index < currentStepIndex) return 'bg-success';
    if (index === currentStepIndex) return 'bg-primary animate-pulse';
    return 'bg-gray-200';
  };

  const getStepStatus = (index) => {
    if (index < currentStepIndex) return 'completed';
    if (index === currentStepIndex && isRunning) return 'running';
    if (index === currentStepIndex && !isRunning && logs.some(log => log.level === 'ERROR')) return 'error';
    return 'pending';
  };

  const getRecentLogs = (stepIndex, maxLogs = 3) => {
    return logs
      .filter(log => log.stepIndex === stepIndex)
      .slice(-maxLogs);
  };

  return (
    <div className="space-y-6">
      {/* Main Visual Pipeline */}
      <div className="bg-surface rounded-xl shadow-card p-6 border border-border">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-text mb-2">Pipeline Execution</h3>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">
              Platform: {platform.charAt(0).toUpperCase() + platform.slice(1).replace('-', ' ')}
            </span>
            <span className="text-primary font-medium">
              {Math.round(animatedProgress)}% Complete
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500 ease-out"
              style={{ width: `${animatedProgress}%` }}
            />
          </div>
        </div>

        {/* Visual Step Flow */}
        <div className="relative">
          {/* Horizontal Flow for Desktop */}
          <div className="hidden lg:block">
            <div className="flex items-center justify-between relative">
              {/* Connectors */}
              <div className="absolute top-8 left-0 right-0 h-1 bg-gray-200 z-0" />
              {(simulationSteps || []).slice(0, -1).map((step, index) => (
                <div
                  key={`connector-${index}`}
                  className={`absolute top-8 h-1 transition-all duration-500 z-0 ${getConnectorColor(index)}`}
                  style={{
                    left: `${((index + 1) / (simulationSteps?.length || 1)) * 100}%`,
                    width: `${(1 / (simulationSteps?.length || 1)) * 100}%`
                  }}
                />
              ))}

              {/* Step Nodes */}
              {(simulationSteps || []).map((step, index) => {
                const status = getStepStatus(index);
                const recentLogs = getRecentLogs(index);
                
                return (
                  <div
                    key={step.name}
                    className="relative z-10 flex flex-col items-center group"
                  >
                    <div
                      className={`
                        w-16 h-16 rounded-full flex items-center justify-center
                        text-xl font-bold border-2 transition-all duration-300
                        ${getStepColor(status)}
                        ${status === 'running' ? 'scale-110 ring-4 ring-primary/30' : ''}
                        ${status === 'completed' ? 'scale-105' : ''}
                        ${status === 'pending' ? 'border-2 border-gray-200' : ''}
                      `}
                    >
                      {getStepIcon(step, status)}
                    </div>
                    
                    <div className="mt-3 text-center max-w-24">
                      <div className={`font-semibold text-sm mb-1 ${
                        status === 'active' ? 'text-primary' : 
                        status === 'completed' ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {step.name}
                      </div>
                      <div className="text-xs text-gray-500 hidden group-hover:block">
                        {step.description}
                      </div>
                    </div>

                    {/* Recent Logs Tooltip */}
                    {recentLogs.length > 0 && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg">
                          <div className="font-semibold mb-2">Recent Activity:</div>
                          {recentLogs.map((log, logIndex) => (
                            <div key={logIndex} className="flex items-start gap-2 mb-1">
                              <span>{log.level === 'ERROR' ? '❌' : log.level === 'SUCCESS' ? '✅' : 'ℹ️'}</span>
                              <span className="truncate">{log.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vertical Flow for Mobile */}
          <div className="lg:hidden space-y-4">
            {(simulationSteps || []).map((step, index) => {
              const status = getStepStatus(index);
              const recentLogs = getRecentLogs(index);
              
              return (
                <div
                  key={step.name}
                  className={`
                    flex items-center gap-4 p-4 rounded-xl border-2 transition-all
                    ${status === 'running' ? 'border-primary bg-primary/5' : 
                      status === 'completed' ? 'border-success bg-success/5' : 
                      status === 'error' ? 'border-error bg-error/5' : 
                      'border-gray-200 bg-gray-50'}
                  `}
                >
                  <div
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center
                      text-lg font-bold flex-shrink-0
                      ${getStepColor(status)}
                    `}
                  >
                    {getStepIcon(step, status)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-semibold text-sm mb-1">{step.name}</div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                    
                    {recentLogs.length > 0 && (
                      <div className="mt-2 text-xs">
                        {recentLogs.slice(0, 1).map((log, logIndex) => (
                          <div key={logIndex} className="flex items-center gap-2">
                            <span>{log.level === 'ERROR' ? '❌' : log.level === 'SUCCESS' ? '✅' : 'ℹ️'}</span>
                            <span className="truncate">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Execution Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-2xl mb-1">⚡</div>
          <div className="text-sm text-gray-500">Status</div>
          <div className="font-semibold">
            {isRunning ? 'Running' : progress === 100 ? 'Completed' : 'Ready'}
          </div>
        </div>
        
        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-2xl mb-1">📊</div>
          <div className="text-sm text-gray-500">Progress</div>
          <div className="font-semibold">{currentStepIndex + 1}/{(simulationSteps || []).length}</div>
        </div>
        
        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-2xl mb-1">⏱️</div>
          <div className="text-sm text-gray-500">Elapsed</div>
          <div className="font-semibold">{Math.round(progress * 0.3)}s</div>
        </div>
        
        <div className="bg-surface rounded-lg p-4 border border-border">
          <div className="text-2xl mb-1">🎯</div>
          <div className="text-sm text-gray-500">Success Rate</div>
          <div className="font-semibold">{progress === 100 ? '100%' : 'In Progress'}</div>
        </div>
      </div>
    </div>
  );
};

export default VisualSimulator;
