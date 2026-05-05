import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JOB_STATUS, STEP_STATUS } from '../utils/simulator';

// Job node colors and animations
const JOB_COLORS = {
  [JOB_STATUS.PENDING]: 'border-gray-300 bg-white',
  [JOB_STATUS.RUNNING]: 'border-blue-500 bg-blue-50',
  [JOB_STATUS.SUCCESS]: 'border-green-500 bg-green-50',
  [JOB_STATUS.FAILURE]: 'border-red-500 bg-red-50',
  [JOB_STATUS.SKIPPED]: 'border-gray-400 bg-gray-50'
};

const JOB_RINGS = {
  [JOB_STATUS.RUNNING]: 'ring-4 ring-blue-200 animate-pulse',
  [JOB_STATUS.SUCCESS]: 'ring-4 ring-green-200',
  [JOB_STATUS.FAILURE]: 'ring-4 ring-red-200',
  [JOB_STATUS.SKIPPED]: 'ring-2 ring-gray-200',
  [JOB_STATUS.PENDING]: ''
};

// Step status colors
const STEP_COLORS = {
  [STEP_STATUS.PENDING]: 'bg-gray-100 text-gray-600',
  [STEP_STATUS.RUNNING]: 'bg-blue-500 text-white',
  [STEP_STATUS.SUCCESS]: 'bg-green-500 text-white',
  [STEP_STATUS.FAILURE]: 'bg-red-500 text-white'
};

const JobNode = memo(({ job, index, onClick, isExpanded, onToggleExpand, logs, onJobSelect }) => {
  const getJobIcon = () => {
    switch (job.status) {
      case JOB_STATUS.SUCCESS: return '✅';
      case JOB_STATUS.RUNNING: return '⚡';
      case JOB_STATUS.FAILURE: return '❌';
      case JOB_STATUS.SKIPPED: return '⏭️';
      default: return '⏸️';
    }
  };

  const getStatusColor = () => {
    return JOB_COLORS[job.status] || JOB_COLORS[JOB_STATUS.PENDING];
  };

  const getStatusRing = () => {
    return JOB_RINGS[job.status] || '';
  };

  const steps = Array.isArray(job?.steps) ? job.steps : [];
  const completedSteps = (Array.isArray(steps) ? steps : []).filter(step => step?.status === STEP_STATUS.SUCCESS).length;
  const totalSteps = (Array.isArray(steps) ? steps : []).length;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: "spring" }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative"
    >
      {/* Job Node */}
      <motion.div
        onClick={() => onJobSelect(job)}
        className={`
          relative bg-white rounded-2xl border-2 p-6 cursor-pointer
          transition-all duration-300 hover:shadow-2xl
          ${getStatusColor()} ${getStatusRing()}
          ${job.status === JOB_STATUS.RUNNING ? 'scale-105 shadow-xl' : 'shadow-lg'}
          min-w-[200px]
        `}
      >
        {/* Job Header */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg bg-white shadow border border-gray-200">
            {getJobIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 text-sm truncate">{job?.name || 'Unnamed Job'}</h3>
            <p className="text-xs text-gray-500">
              {(Array.isArray(job?.steps) ? job.steps : []).length} steps
            </p>
          </div>
          {job.status === JOB_STATUS.RUNNING && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping" />
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1">
            <span>{completedSteps}/{totalSteps}</span>
            <span className="font-medium capitalize">{job.status}</span>
          </div>
        </div>

        {/* Steps Preview */}
        <div className="space-y-1.5 mb-3">
          {(Array.isArray(job?.steps) ? job.steps : []).slice(0, isExpanded ? (job?.steps?.length || 0) : 3).map((step, stepIndex) => (
            <div key={step?.id || stepIndex} className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${STEP_COLORS[step?.status || STEP_STATUS.PENDING]}`} />
              <span className="text-[11px] text-gray-600 truncate flex-1">{step?.name || 'Step'}</span>
              {step?.status === STEP_STATUS.RUNNING && (
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              )}
            </div>
          ))}
          {!isExpanded && (job?.steps?.length || 0) > 3 && (
            <button onClick={(e) => { e.stopPropagation(); onToggleExpand(); }} className="text-[10px] text-blue-500 hover:text-blue-700">
              +{(job?.steps?.length || 0) - 3} more
            </button>
          )}
        </div>

        {isExpanded && (job?.steps?.length || 0) > 3 && (
          <button
            onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
            className="text-[10px] text-gray-400 hover:text-gray-600 mb-2"
          >
            Show less
          </button>
        )}
      </motion.div>

    </motion.div>
  );
});

JobNode.displayName = 'JobNode';

const DependencyArrow = memo(({ fromJob, toJob, isActive }) => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: isActive ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
      className="absolute top-1/2 left-full w-16 h-16 -translate-y-1/2 z-10"
      style={{ left: '100%' }}
    >
      <motion.path
        d="M 0 32 L 48 32"
        stroke={isActive ? '#10b981' : '#9ca3af'}
        strokeWidth="2"
        fill="none"
        markerEnd="url(#arrowhead)"
        animate={isActive ? { strokeDashoffset: 0 } : {}}
        transition={{ duration: 1 }}
        strokeDasharray="5 5"
      />
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isActive ? '#10b981' : '#9ca3af'}
          />
        </marker>
      </defs>
      {isActive && (
        <motion.circle
          cx="24"
          cy="32"
          r="3"
          fill="#10b981"
          animate={{ x: [0, 48] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.svg>
  );
});

DependencyArrow.displayName = 'DependencyArrow';

const VisualWorkflow = ({ 
  jobs = [], 
  logs = [], 
  onJobSelect,
  onRetry,
  platform = 'github'
}) => {
  const [expandedJobs, setExpandedJobs] = useState({});
  const [selectedJob, setSelectedJob] = useState(null);

  // Calculate pipeline summary
  const safeJobs = Array.isArray(jobs) ? jobs : [];
  const summary = {
    totalJobs: safeJobs.length,
    completedJobs: safeJobs.filter(job => job?.status === JOB_STATUS.SUCCESS).length,
    failedJobs: safeJobs.filter(job => job?.status === JOB_STATUS.FAILURE).length,
    runningJobs: safeJobs.filter(job => job?.status === JOB_STATUS.RUNNING).length,
    pendingJobs: safeJobs.filter(job => job?.status === JOB_STATUS.PENDING).length,
    totalSteps: safeJobs.reduce((sum, job) => sum + (Array.isArray(job?.steps) ? job.steps.length : 0), 0),
    completedSteps: safeJobs.reduce((sum, job) => 
      sum + (Array.isArray(job?.steps) ? job.steps.filter(step => step?.status === STEP_STATUS.SUCCESS).length : 0), 0),
    progress: safeJobs.length > 0 ? safeJobs.reduce((sum, job) => sum + ((Array.isArray(job?.steps) ? job.steps.length : 0) > 0 ? (job.steps.filter(step => step?.status === STEP_STATUS.SUCCESS).length / job.steps.length * 100) : 0), 0) / safeJobs.length : 0,
    status: safeJobs.some(job => job?.status === JOB_STATUS.FAILURE) ? 'failed' : 
           (safeJobs.length > 0 && safeJobs.every(job => job?.status === JOB_STATUS.SUCCESS)) ? 'success' : 
           safeJobs.some(job => job?.status === JOB_STATUS.RUNNING) ? 'running' : 'pending'
  };

  const toggleJobExpansion = useCallback((jobId) => {
    setExpandedJobs(prev => ({
      ...prev,
      [jobId]: !prev[jobId]
    }));
  }, []);

  const handleJobSelect = useCallback((job) => {
    setSelectedJob(job);
    onJobSelect?.(job);
  }, [onJobSelect]);

  // Group jobs by execution level (based on dependencies)
  const organizeJobsByLevel = useCallback(() => {
    if (!Array.isArray(jobs)) return [];
    const levels = [];
    const processed = new Set();
    const jobMap = new Map(jobs.map(job => [job?.id || 'unknown', job]));

    // Find jobs with no dependencies (level 0)
    const findJobsAtLevel = (level) => {
      const levelJobs = [];
      jobs.forEach(job => {
        const jobId = job?.id || 'unknown';
        if (!processed.has(jobId)) {
          const deps = Array.isArray(job?.dependsOn) ? job.dependsOn : [];
          const allDepsProcessed = deps.every(dep => processed.has(dep));
          
          if (level === 0 && deps.length === 0) {
            levelJobs.push(job);
            processed.add(jobId);
          } else if (level > 0 && allDepsProcessed) {
            levelJobs.push(job);
            processed.add(jobId);
          }
        }
      });
      return levelJobs;
    };

    let level = 0;
    while (processed.size < jobs.length && level < 10) {
      const levelJobs = findJobsAtLevel(level);
      if (levelJobs.length === 0) break;
      levels.push(levelJobs);
      level++;
    }

    return levels;
  }, [jobs]);

  const jobLevels = organizeJobsByLevel();

  // Group logs by job
  const getLogsForJob = useCallback((jobId) => {
    return (Array.isArray(logs) ? logs : []).filter(log => log.job === (Array.isArray(jobs) ? jobs : []).find(j => j.id === jobId)?.name);
  }, [logs, jobs]);

  return (
    <div className="space-y-8">
      {/* Pipeline Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <motion.div 
              animate={summary.status === 'running' ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: summary.status === 'running' ? Infinity : 0, duration: 2 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl ${
                summary.status === 'failed' ? 'bg-red-100 border-2 border-red-200' : 
                summary.status === 'success' ? 'bg-green-100 border-2 border-green-200' : 
                summary.status === 'running' ? 'bg-blue-100 border-2 border-blue-200 animate-pulse' : 
                'bg-gray-100 border-2 border-gray-200'
              }`}
            >
              {summary.status === 'failed' ? '❌' : 
               summary.status === 'success' ? '🎉' : 
               summary.status === 'running' ? '⚡' : '⏸️'}
            </motion.div>
            <div>
              <h2 className="font-bold text-2xl text-gray-800">
                {summary.status === 'failed' ? 'Pipeline Failed' : 
                 summary.status === 'success' ? 'Pipeline Completed Successfully' : 
                 summary.status === 'running' ? 'Pipeline Executing' : 'Pipeline Ready'}
              </h2>
              <p className="text-gray-500 mt-1">
                Platform: <span className="font-medium capitalize">{platform}</span> • 
                {summary.totalJobs} jobs • 
                {summary.totalSteps} steps • 
                Status: <span className={`font-medium ${
                  summary.status === 'success' ? 'text-green-600' : 
                  summary.status === 'failed' ? 'text-red-600' : 
                  summary.status === 'running' ? 'text-blue-600' : 'text-gray-600'
                }`}>{summary.status}</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600">{Math.round(summary.progress)}%</div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
            {summary.status === 'failed' && onRetry && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onRetry}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg flex items-center gap-2"
              >
                <span>🔄</span>
                Retry
              </motion.button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary.progress}%` }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full relative"
            >
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ repeat: summary.status === 'running' ? Infinity : 0, duration: 2 }}
                className="h-full bg-white opacity-20 absolute inset-0"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Job Execution Graph */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl border border-gray-200 p-4 md:p-6 shadow-xl"
      >
        <div className="mb-4">
          <h3 className="font-bold text-lg md:text-2xl text-gray-800 mb-1">Execution Graph</h3>
          <p className="text-gray-500">Jobs are organized by dependencies. Parallel jobs execute simultaneously.</p>
        </div>

        {/* Job Levels */}
        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2">
          {jobLevels.map((level, levelIndex) => (
            <div key={levelIndex}>
              {/* Level Label */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">{levelIndex + 1}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Level {levelIndex + 1}</h4>
                  <p className="text-sm text-gray-500">
                    {level.length === 1 ? 'Sequential execution' : `Parallel execution (${level.length} jobs)`}
                  </p>
                </div>
              </div>

              {/* Jobs in this level - responsive grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                {level.map((job, jobIndex) => (
                  <div key={job.id} className="relative">
                    <JobNode
                      job={job}
                      index={jobIndex}
                      onClick={() => handleJobSelect(job)}
                      isExpanded={expandedJobs[job.id] || false}
                      onToggleExpand={() => toggleJobExpansion(job.id)}
                      logs={getLogsForJob(job.id)}
                      onJobSelect={handleJobSelect}
                    />
                    
                    {/* Dependency Arrows */}
                    {(job.dependsOn || []).map((depId, depIndex) => {
                      const depJob = jobs.find(j => j.id === depId);
                      const isActive = depJob?.status === JOB_STATUS.SUCCESS;
                      return (
                        <DependencyArrow
                          key={depIndex}
                          fromJob={depJob}
                          toJob={job}
                          isActive={isActive}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Execution Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600">⚡</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">Status</div>
          </div>
          <div className="font-bold text-lg text-gray-800 capitalize">{summary.status}</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600">✅</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">Completed</div>
          </div>
          <div className="font-bold text-lg text-gray-800">{summary.completedJobs}/{summary.totalJobs}</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">⚡</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">Running</div>
          </div>
          <div className="font-bold text-lg text-gray-800">{summary.runningJobs}</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-purple-600">📝</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">Steps</div>
          </div>
          <div className="font-bold text-lg text-gray-800">{summary.completedSteps}/{summary.totalSteps}</div>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-white rounded-xl p-4 border border-gray-200 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <span className="text-orange-600">🎯</span>
            </div>
            <div className="text-sm text-gray-500 font-medium">Platform</div>
          </div>
          <div className="font-bold text-lg text-gray-800 capitalize">{platform}</div>
        </motion.div>
      </div>
    </div>
  );
};

export default VisualWorkflow;
