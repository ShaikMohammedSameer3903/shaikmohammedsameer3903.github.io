import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = [
  { id: 'push', label: 'Code Push', icon: '🚀', color: '#3b82f6', logs: ['git push origin main', 'Enumerating objects: 12, done.', 'Writing objects: 100% (12/12), 2.45 KiB', 'Total 12 (delta 8), reused 0 (delta 0)', 'To github.com:user/repo.git'] },
  { id: 'build', label: 'Build', icon: '⚙️', color: '#8b5cf6', logs: ['npm install', 'Added 124 packages in 2s', 'npm run build', 'Creating an optimized production build...', 'File sizes after gzip: 42.18 KB'] },
  { id: 'test', label: 'Test', icon: '🧪', color: '#10b981', logs: ['npm test', 'PASS src/App.test.js', 'PASS src/utils/logic.test.js', 'Test Suites: 2 passed, 2 total', 'Tests: 14 passed, 14 total'] },
  { id: 'deploy', label: 'Deploy', icon: '🌐', color: '#bf8140', logs: ['aws s3 sync build/ s3://prod-bucket', 'upload: build/index.html to s3://prod-bucket/index.html', 'CloudFront invalidation started...', 'Deployment successful! 🎉'] }
];

const PipelineAnimation = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setLogs([]);
    const currentStepLogs = STEPS[activeStep].logs;
    let logIndex = 0;
    
    const logInterval = setInterval(() => {
      if (logIndex < currentStepLogs.length) {
        setLogs(prev => [...prev, currentStepLogs[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 600);

    // Progress bar animation
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 30);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [activeStep]);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden font-inter">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-800/50 border-b border-white/5">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
          Pipeline Status: <span className="text-green-400">Running</span>
        </div>
      </div>

      <div className="p-6 space-y-8">
        {/* Pipeline Steps */}
        <div className="flex justify-between items-center relative px-4">
          {/* Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          <motion.div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 z-0"
            animate={{ width: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />

          {STEPS.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                animate={{
                  scale: activeStep === idx ? 1.2 : 1,
                  backgroundColor: activeStep === idx ? step.color : activeStep > idx ? step.color : '#1e293b',
                  borderColor: activeStep === idx ? '#fff' : 'transparent',
                }}
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 shadow-xl"
              >
                {activeStep > idx ? '✓' : step.icon}
                {activeStep === idx && (
                  <motion.div 
                    layoutId="pulse"
                    className="absolute inset-0 rounded-full border-2 border-white/50"
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />
                )}
              </motion.div>
              <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${activeStep === idx ? 'text-white' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        {/* Console Output */}
        <div className="bg-black/40 rounded-xl p-4 h-48 border border-white/5 font-mono text-[11px] overflow-hidden">
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {logs.map((log, i) => (
                <motion.div
                  key={`${activeStep}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex gap-3"
                >
                  <span className="text-slate-600">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className={log && (log.includes('successful') || log.includes('PASS')) ? 'text-green-400' : 'text-slate-300'}>
                    {log && (log.startsWith('npm') || log.startsWith('git') || log.startsWith('aws')) ? '> ' : ''}
                    {log}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.div 
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="w-1.5 h-3 bg-blue-500 inline-block align-middle ml-1"
            />
          </div>
        </div>

        {/* Progress Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">
              {STEPS[activeStep].icon}
            </div>
            <div>
              <div className="text-[10px] font-bold text-white uppercase tracking-wider">{STEPS[activeStep].label}</div>
              <div className="text-[9px] text-slate-500">Processing stage...</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-mono text-blue-400">{progress}%</div>
            <div className="w-24 bg-slate-800 rounded-full h-1 mt-1 overflow-hidden">
              <motion.div 
                className="bg-blue-500 h-full"
                animate={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAnimation;
