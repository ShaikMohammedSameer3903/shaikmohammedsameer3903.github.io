import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  parsePipelineConfig, 
  getPipelineSummary,
  detectPlatform,
  JOB_STATUS,
  STEP_STATUS
} from '../utils/simulator'
import { API_CONFIG } from '../utils/apiConfig';
import { safeApiRequest } from '../utils/safeFetch';
import VisualWorkflow from './VisualWorkflow'

const STEP_COLORS = {
  [STEP_STATUS.PENDING]: 'bg-gray-300',
  [STEP_STATUS.RUNNING]: 'bg-blue-500',
  [STEP_STATUS.SUCCESS]: 'bg-green-500',
  [STEP_STATUS.FAILURE]: 'bg-red-500'
}

function Simulator({ generatedCode, setSimStatus, setSimCurrentStage, platform: platformProp }) {
  // Safe state initialization with defaults
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [currentJobIndex, setCurrentJobIndex] = useState(-1);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [expandedSteps, setExpandedSteps] = useState(new Set());
  
  // Safe platform detection
  const pipelineMetadata = useMemo(() => ({ platform: platformProp || 'github' }), [platformProp]);
  const [showConsole, setShowConsole] = useState(false);

  // Fallback sample code for demo when no generatedCode
  const sampleCode = `name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test`;

  // Use provided code or sample for demo
  const codeToSimulate = generatedCode || sampleCode;

  // Fallback simulation when backend is unavailable
  const runFallbackSimulation = useCallback(async () => {
    try {
      const config = parsePipelineConfig(codeToSimulate, pipelineMetadata.platform);
      
      if (!config.jobs || config.jobs.length === 0) {
        throw new Error('No valid jobs found in pipeline configuration');
      }

      // Set initial jobs with pending status so UI shows the pipeline structure
      const initialJobs = config.jobs.map(job => ({
        ...job,
        name: job.name || 'Unnamed Job',
        steps: Array.isArray(job.steps) ? job.steps.map(s => ({ ...s, status: STEP_STATUS.PENDING })) : [],
        status: JOB_STATUS.PENDING,
        'runs-on': job['runs-on'] || 'ubuntu-latest',
        dependsOn: job.dependsOn || job.needs || []
      }));
      setJobs(initialJobs);

      // Reset and prepare for simulation
      setLogs([{
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `🔄 Using fallback simulation for ${config.jobs.length} jobs...`,
        job: 'System',
        step: 'Fallback Mode'
      }]);

      // Simulate each job with realistic timing
      for (let jobIndex = 0; jobIndex < config.jobs.length; jobIndex++) {
        const job = config.jobs[jobIndex];
        setCurrentJobIndex(jobIndex);
        
        // Add job start log
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'INFO',
          message: `📦 Starting job: ${job.name}`,
          job: job.name,
          step: 'Job Start'
        }]);

        // Update job status to running (safe)
        setJobs(prev => prev.map((j, index) => 
          index === jobIndex ? { ...j, status: JOB_STATUS.RUNNING } : j
        ));

        // Simulate job steps (safe access)
        const steps = Array.isArray(job.steps) ? job.steps : [];
        if (steps.length > 0) {
          for (let stepIndex = 0; stepIndex < steps.length; stepIndex++) {
            const step = steps[stepIndex];
            setCurrentStepIndex(stepIndex);
            
            // Add step start log
            setLogs(prev => [...prev, {
              timestamp: new Date().toISOString(),
              level: 'INFO',
              message: `▶️ Running: ${step?.name || step?.uses || 'Step ' + (stepIndex + 1)}`,
              job: job.name || 'Unnamed Job',
              step: step?.name || step?.uses || 'Step ' + (stepIndex + 1)
            }]);

            // Update step status to running
            setJobs(prev => prev.map((j, jIndex) => 
              jIndex === jobIndex ? {
                ...j,
                steps: Array.isArray(j.steps) ? j.steps.map((s, sIndex) => 
                  sIndex === stepIndex ? { ...s, status: STEP_STATUS.RUNNING } : s
                ) : []
              } : j
            ));

            // Simulate step execution time
            await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

            // Randomly determine step success (90% success rate for demo)
            const stepSuccess = Math.random() > 0.1;
            
            if (stepSuccess) {
              // Add step success log
              setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                level: 'SUCCESS',
                message: `✅ Completed: ${step?.name || step?.uses || 'Step ' + (stepIndex + 1)}`,
                job: job.name || 'Unnamed Job',
                step: step?.name || step?.uses || 'Step ' + (stepIndex + 1)
              }]);

              // Update step status to success
              setJobs(prev => prev.map((j, jIndex) => 
                jIndex === jobIndex ? {
                  ...j,
                  steps: Array.isArray(j.steps) ? j.steps.map((s, sIndex) => 
                    sIndex === stepIndex ? { ...s, status: STEP_STATUS.SUCCESS } : s
                  ) : []
                } : j
              ));
            } else {
              // Add step failure log
              setLogs(prev => [...prev, {
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                message: `❌ Failed: ${step?.name || step?.uses || 'Step ' + (stepIndex + 1)}`,
                job: job.name || 'Unnamed Job',
                step: step?.name || step?.uses || 'Step ' + (stepIndex + 1)
              }]);

              // Update step status to failure
              setJobs(prev => prev.map((j, jIndex) => 
                jIndex === jobIndex ? {
                  ...j,
                  status: JOB_STATUS.FAILURE,
                  steps: Array.isArray(j.steps) ? j.steps.map((s, sIndex) => 
                    sIndex === stepIndex ? { ...s, status: STEP_STATUS.FAILURE } : s
                  ) : []
                } : j
              ));

              // Stop simulation on first failure
              setSimStatus('failed');
              setSimCurrentStage(`${job.name || 'Unnamed Job'} - Step Failed`);
              return;
            }
          }
        }

        // Update job status to success
        setJobs(prev => prev.map((j, index) => 
          index === jobIndex ? { ...j, status: JOB_STATUS.SUCCESS } : j
        ));

        // Add job completion log
        setLogs(prev => [...prev, {
          timestamp: new Date().toISOString(),
          level: 'SUCCESS',
          message: `✅ Job completed: ${job.name}`,
          job: job.name,
          step: 'Job Complete'
        }]);

        // Small delay between jobs
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // All jobs completed successfully
      setSimStatus('success');
      setSimCurrentStage('Pipeline Completed');
      
      // Add completion log
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'SUCCESS',
        message: `🎉 Pipeline simulation completed successfully!`,
        job: 'System',
        step: 'Complete'
      }]);

    } catch (error) {
      console.error('Fallback simulation error:', error);
      setLogs(prev => [...prev, {
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        message: `❌ Fallback simulation failed: ${error.message}`,
        job: 'System',
        step: 'Error'
      }]);
      setSimStatus('failed');
      setSimCurrentStage('Simulation Failed');
    } finally {
      setCurrentJobIndex(-1);
      setCurrentStepIndex(-1);
    }
  }, [codeToSimulate, pipelineMetadata.platform, setSimStatus, setSimCurrentStage]);

  // Simulation runner logic
  const runSimulation = useCallback(async () => {
    if (!codeToSimulate || isRunning) return;

    setIsRunning(true);
    setProgress(0);
    setSimStatus('running');
    setLogs([]);
    setJobs([]);

    try {
      // 1. Initial logs
      setLogs([{
        timestamp: new Date().toISOString(),
        level: 'INFO',
        message: `🚀 Starting pipeline simulation for ${pipelineMetadata.platform}...`,
        job: 'System',
        step: 'Initialization'
      }]);

      // 2. Call backend to simulate
      const response = await safeApiRequest(API_CONFIG.ENDPOINTS.SIMULATE, {
        method: 'POST',
        body: JSON.stringify({
          pipelineCode: codeToSimulate,
          platform: pipelineMetadata.platform,
          mode: 'full'
        })
      });

      if (response.offline) {
        console.warn('Simulation API unavailable, using fallback simulation');
        await runFallbackSimulation();
        return;
      }

      if (!response.success) {
        console.warn('Simulation API failed, using fallback simulation:', response.error);
        await runFallbackSimulation();
        return;
      }

    // 3. Process results
    if (response.success && response.data) {
      const simData = response.data || {};
      const { logs: buildLogs = [], steps: buildSteps = [], jobs: buildJobs = [], status: rawStatus = 'failed' } = simData;
      // Normalize status: backend may return 'success'/'failed'/'failure'/'SUCCESS'/'FAIL'
      const status = rawStatus === 'success' || rawStatus === 'SUCCESS' ? 'success'
        : rawStatus === 'failed' || rawStatus === 'failure' || rawStatus === 'FAIL' ? 'failed'
        : rawStatus || 'failed';
      
      const safeLogs = Array.isArray(buildLogs) ? buildLogs : [];
      const safeSteps = Array.isArray(buildSteps) ? buildSteps : [];
      const safeJobs = Array.isArray(buildJobs) ? buildJobs : [];
      
      setLogs(prev => [...(Array.isArray(prev) ? prev : []), ...safeLogs]);
      
      // Use job-structured data if available, otherwise fall back to flat steps
      if (safeJobs.length > 0) {
        const mappedJobs = safeJobs.map(job => ({
          ...job,
          name: job.name || job.id || 'Unnamed Job',
          status: job.status === 'success' || job.status === 'SUCCESS' ? JOB_STATUS.SUCCESS
            : job.status === 'failed' || job.status === 'failure' ? JOB_STATUS.FAILURE
            : job.status === 'skipped' ? JOB_STATUS.SKIPPED
            : job.status === 'running' ? JOB_STATUS.RUNNING
            : JOB_STATUS.PENDING,
          steps: Array.isArray(job.steps) ? job.steps.map((s, idx) => ({
            ...s,
            id: s?.id || `step-${idx}`,
            name: s?.name || s?.uses || s?.run || `Step ${idx + 1}`,
            status: s?.status === 'success' || s?.status === 'SUCCESS' ? STEP_STATUS.SUCCESS
              : s?.status === 'failed' || s?.status === 'failure' ? STEP_STATUS.FAILURE
              : STEP_STATUS.PENDING
          })) : [],
          'runs-on': job['runs-on'] || 'ubuntu-latest',
          dependsOn: job.needs || []
        }));
        setJobs(mappedJobs);
      } else {
        // Fallback: map flat steps into a single job
        const mappedSteps = safeSteps.map((s, idx) => ({
          ...s,
          id: s?.id || `step-${idx}`,
          status: s?.status || STEP_STATUS.PENDING
        }));
        setJobs(mappedSteps.length > 0 ? [{
          id: 'main-job',
          name: 'Simulation Run',
          status: status || 'running',
          steps: mappedSteps,
          'runs-on': 'ubuntu-latest',
          dependsOn: []
        }] : []);
      }
      
      setSimStatus(status === 'success' ? 'success' : 'failed');
      setProgress(100);
    } else {
      // Fallback if response.data is missing
      console.warn('No response.data found or success is false, using fallback simulation');
      await runFallbackSimulation();
      return;
    }
    } catch (error) {
      console.error('Simulation Error:', error);
      await runFallbackSimulation();
    } finally {
      setIsRunning(false);
    }
  }, [codeToSimulate, isRunning, pipelineMetadata.platform, setSimStatus, runFallbackSimulation]);

  // Sync jobs with code when code changes (safe parsing)
  useEffect(() => {
    if (codeToSimulate && !isRunning) {
      try {
        const config = parsePipelineConfig(codeToSimulate, pipelineMetadata.platform);
        
        if (config.error || !config.jobs || config.jobs.length === 0) {
          setJobs([]);
        } else {
          // Ensure all jobs have required fields
          const safeJobs = config.jobs.map(job => ({
            ...job,
            name: job.name || 'Unnamed Job',
            steps: Array.isArray(job.steps) ? job.steps : [],
            status: job.status || JOB_STATUS.PENDING,
            'runs-on': job['runs-on'] || 'ubuntu-latest'
          }));
          setJobs(safeJobs);
        }
      } catch (error) {
        console.error('[Simulator] Parse error:', error);
        setJobs([]);
      }
    } else if (!codeToSimulate) {
      setJobs([]);
    }
  }, [codeToSimulate, pipelineMetadata.platform, isRunning]);

  // Calculate progress from jobs (safe access)
  useEffect(() => {
    if (jobs && jobs.length > 0) {
      try {
        const summary = getPipelineSummary(jobs);
        setProgress(summary.progress || 0);
        setSimStatus(summary.status || 'idle');
        
        // Find current running job
        const runningJob = jobs.find(job => job.status === JOB_STATUS.RUNNING);
        if (runningJob) {
          setSimCurrentStage(runningJob?.name || 'Running Job');
        } else if (summary.status === 'success' || summary.status === 'SUCCESS') {
          setSimCurrentStage('Pipeline Completed');
        } else if (summary.status === 'failure' || summary.status === 'failed' || summary.status === 'FAIL') {
          setSimCurrentStage('Pipeline Failed');
        } else {
          setSimCurrentStage(null);
        }
      } catch (error) {
        console.error('[Simulator] Progress calculation error:', error);
        setProgress(0);
        setSimStatus('idle');
        setSimCurrentStage(null);
      }
    }
  }, [jobs, setSimStatus, setSimCurrentStage]);

  const resetSimulation = useCallback(() => {
    setLogs([]);
    setJobs([]);
    setProgress(0);
    setSimStatus('idle');
    setSimCurrentStage(null);
    setSelectedJob(null);
  }, [setSimStatus, setSimCurrentStage]);

  const toggleStepExpansion = useCallback((stepId) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  }, []);

  // Auto-scroll logs to bottom
  useEffect(() => {
    if (logs.length > 0) {
      const timeoutId = setTimeout(() => {
        const logContainer = document.getElementById('log-container');
        if (logContainer) {
          logContainer.scrollTop = logContainer.scrollHeight;
        }
      }, 100);
      return () => clearTimeout(timeoutId);
    }
  }, [logs]);

  // UI guard - return loading state if critical data is missing
  if (!pipelineMetadata || !codeToSimulate) {
    return (
      <div className="bg-slate-900 rounded-lg p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-white">Initializing simulation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-lg p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">Pipeline Simulator</h3>
            <p className="text-slate-400 text-sm">
              {pipelineMetadata.platform} • {(jobs || []).length} jobs
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowConsole(!showConsole)}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
          >
            {showConsole ? 'Hide' : 'Show'} Console
          </button>
          
          <button
            onClick={resetSimulation}
            disabled={isRunning}
            className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          
          <button
            onClick={runSimulation}
            disabled={isRunning || !codeToSimulate}
            className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Running...
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Simulation
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 min-h-0">
        {/* Visual Workflow */}
        <div className="flex-1">
          <VisualWorkflow 
            jobs={jobs}
            selectedJob={selectedJob}
            onJobSelect={setSelectedJob}
            currentJobIndex={currentJobIndex}
            currentStepIndex={currentStepIndex}
          />
        </div>

        {/* Console Logs */}
        {showConsole && (
          <div className="w-96 bg-slate-800 rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium text-sm">Console Output</h4>
              <span className="text-slate-400 text-xs">{(logs || []).length} logs</span>
            </div>
            
            <div 
              id="log-container"
              className="flex-1 overflow-y-auto space-y-2 font-mono text-xs"
            >
              {!Array.isArray(logs) || logs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No logs yet. Run simulation to see output.
                </div>
              ) : (
                logs.map((log, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-start gap-2 ${
                      log.level === 'ERROR' ? 'text-red-400' :
                      log.level === 'SUCCESS' ? 'text-green-400' :
                      log.level === 'WARNING' ? 'text-yellow-400' :
                      'text-slate-300'
                    }`}
                  >
                    <span className="text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="shrink-0 w-16">
                      {log.job}
                    </span>
                    <span className="flex-1">
                      {log.message}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Job Details */}
      {selectedJob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 bg-slate-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium">{selectedJob.name}</h4>
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              selectedJob.status === JOB_STATUS.SUCCESS ? 'bg-green-900 text-green-200' :
              selectedJob.status === JOB_STATUS.FAILURE ? 'bg-red-900 text-red-200' :
              selectedJob.status === JOB_STATUS.RUNNING ? 'bg-blue-900 text-blue-200' :
              'bg-gray-700 text-gray-300'
            }`}>
              {selectedJob.status}
            </div>
          </div>
          
          <div className="space-y-2">
              {!Array.isArray(selectedJob?.steps) || selectedJob.steps.length === 0 ? (
                <div className="text-slate-500 text-sm py-4">
                  No steps available for this job.
                </div>
              ) : (
                selectedJob.steps.map((step, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                onClick={() => toggleStepExpansion(step.id || index)}
              >
                <div className={`w-2 h-2 rounded-full ${STEP_COLORS[step.status || STEP_STATUS.PENDING]}`} />
                <span className="text-slate-300 text-sm flex-1">
                  {step?.name || step?.uses || `Step ${index + 1}`}
                </span>
                <svg 
                  className={`w-4 h-4 text-slate-500 transition-transform ${
                    expandedSteps.has(step.id || index) ? 'rotate-90' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))
              )}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Simulator
