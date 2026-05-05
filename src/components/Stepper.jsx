import React from 'react';

const Stepper = ({ currentStep, totalSteps = 6, onStepClick }) => {
  const steps = [
    { id: 1, name: 'Platform', icon: '🎯', description: 'Choose your CI/CD platform' },
    { id: 2, name: 'Configure', icon: '⚙️', description: 'Set language & deployment' },
    { id: 3, name: 'Generate', icon: '🚀', description: 'Create pipeline code' },
    { id: 4, name: 'Edit', icon: '✏️', description: 'Customize your pipeline' },
    { id: 5, name: 'Validate', icon: '✅', description: 'Check syntax & logic' },
    { id: 6, name: 'Simulate', icon: '🎮', description: 'Test pipeline execution' }
  ];

  const getStepStatus = (stepId) => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  const getStepStyles = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-primary text-white border-primary shadow-lg scale-105';
      case 'active':
        return 'bg-white text-primary border-2 border-primary shadow-md scale-110 ring-4 ring-primary/20';
      case 'pending':
        return 'bg-gray-100 text-gray-400 border-2 border-gray-200';
      default:
        return '';
    }
  };

  const getConnectorStyles = (stepId) => {
    if (stepId < currentStep) return 'bg-primary';
    if (stepId === currentStep) return 'bg-primary/50';
    return 'bg-gray-200';
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </div>
          <div className="text-sm font-medium text-primary">
            {Math.round((currentStep / totalSteps) * 100)}% Complete
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-primary to-primary/80 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {/* Connectors */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-200 z-0" />
          {steps.slice(0, -1).map((step) => (
            <div
              key={`connector-${step.id}`}
              className={`absolute top-8 h-0.5 transition-all duration-500 z-0 ${getConnectorStyles(step.id)}`}
              style={{
                left: `${(step.id / totalSteps) * 100}%`,
                right: `${((totalSteps - step.id - 1) / totalSteps) * 100}%`
              }}
            />
          ))}

          {/* Step Circles */}
          {steps.map((step) => {
            const status = getStepStatus(step.id);
            const isClickable = status === 'completed' || (status === 'pending' && step.id === currentStep + 1);
            
            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center cursor-pointer group"
                onClick={() => isClickable && onStepClick && onStepClick(step.id)}
              >
                <div
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center
                    font-bold text-lg border-2 transition-all duration-300
                    ${getStepStyles(status)}
                    ${isClickable ? 'hover:scale-110' : 'cursor-not-allowed'}
                  `}
                >
                  {status === 'completed' ? (
                    <span className="text-xl">✓</span>
                  ) : (
                    <span className="text-xl">{step.icon}</span>
                  )}
                </div>
                
                <div className="mt-3 text-center">
                  <div className={`font-semibold text-sm mb-1 ${
                    status === 'active' ? 'text-primary' : 
                    status === 'completed' ? 'text-gray-700' : 'text-gray-400'
                  }`}>
                    {step.name}
                  </div>
                  <div className="text-xs text-gray-500 max-w-24 group-hover:text-gray-700 transition-colors">
                    {step.description}
                  </div>
                </div>

                {/* Tooltip for hover */}
                {isClickable && (
                  <div className="absolute bottom-full mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {status === 'completed' ? 'Review step' : 'Continue to this step'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="mt-8 p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{steps[currentStep - 1]?.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800">
              {steps[currentStep - 1]?.name}
            </h3>
            <p className="text-sm text-gray-600">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stepper;
