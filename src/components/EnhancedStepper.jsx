import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  { id: 1, label: 'Platform', icon: '🎯', description: 'Choose host' },
  { id: 2, label: 'Config', icon: '⚙️', description: 'Setup options' },
  { id: 3, label: 'Generate', icon: '🚀', description: 'Create code' },
  { id: 4, label: 'Edit', icon: '✏️', description: 'Customize' },
  { id: 5, label: 'Validate', icon: '✅', description: 'Check syntax' },
  { id: 6, label: 'Simulate', icon: '🎮', description: 'Test run' },
  { id: 7, label: 'Save', icon: '💾', description: 'Finalize' },
];

const EnhancedStepper = ({ currentStep, onStepClick }) => {
  return (
    <div className="w-full py-4 md:py-8">
      {/* Mobile: horizontally scrollable stepper */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <div className="relative flex justify-between min-w-[600px] md:min-w-0">
          {/* Background Connection Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 z-0 rounded-full" />
          
          {/* Animated Progress Line */}
          <motion.div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-[#bf8140] to-[#d4a373] -translate-y-1/2 z-0 rounded-full shadow-[0_0_10px_rgba(191,129,64,0.4)]"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          {STEPS.map((step) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isClickable = isCompleted || step.id === currentStep + 1;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center group">
                <motion.button
                  onClick={() => isClickable && onStepClick(step.id)}
                  whileHover={isClickable ? { scale: 1.1 } : {}}
                  whileTap={isClickable ? { scale: 0.95 } : {}}
                  className={`
                    w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center
                    text-lg md:text-2xl
                    border-2 transition-all duration-300 relative
                    ${isActive 
                      ? 'bg-white border-[#bf8140] text-[#bf8140] shadow-[0_0_20px_rgba(191,129,64,0.3)] ring-4 ring-[#bf8140]/10' 
                      : isCompleted 
                      ? 'bg-[#bf8140] border-[#bf8140] text-white shadow-lg'
                      : 'bg-white border-slate-200 text-slate-400 opacity-60'
                    }
                    ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {isCompleted ? '✓' : step.icon}
                  
                  {isActive && (
                    <motion.div 
                      layoutId="stepper-pulse"
                      className="absolute inset-0 rounded-xl md:rounded-2xl border-2 border-[#bf8140]"
                      animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </motion.button>

                <div className="mt-2 md:mt-4 text-center">
                  <p className={`text-[10px] md:text-xs font-bold uppercase tracking-widest ${isActive ? 'text-[#bf8140]' : isCompleted ? 'text-slate-700' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-[9px] md:text-[10px] text-slate-400 mt-0.5 font-medium hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedStepper;
