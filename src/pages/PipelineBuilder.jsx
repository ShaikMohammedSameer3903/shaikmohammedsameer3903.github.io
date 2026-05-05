import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import CodeEditor from '../components/CodeEditor';
import AIChatPanel from '../components/AIChatPanel';
import FixAllPanel from '../components/FixAllPanel';
import { useToast } from '../components/ToastProvider';
import { usePipeline } from '../contexts/PipelineContext';
import { useNotifications } from '../contexts/NotificationContext';
import { PLATFORMS, getTemplateById } from '../data/templates';
import { API_CONFIG } from '../config/api';
import { globalEvents, EVENTS } from '../utils/globalEvents';
import { 
  FaTrash, FaSave, FaCog, FaPlay, FaExclamationTriangle, FaCode, 
  FaSpinner, FaRocket, FaLightbulb, FaBug, FaCheckCircle, FaTimesCircle
} from 'react-icons/fa';
import { 
  Sparkles, Terminal, Menu, X, PlayCircle, CheckCircle, AlertCircle, 
  Sun, Moon, ArrowRight, Lightbulb, Bug, Rocket, ChevronRight, Eye, 
  GitBranch, Clock, Zap, Layers, Activity
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { validateYaml } from '../services/pipelineParser';
import { pipelineService } from '../services/pipelineService';
import DragDropBuilder from '../components/DragDropBuilder';
import * as yaml from 'js-yaml';
import debounce from 'lodash/debounce';
import { safeApiRequest } from '../utils/safeFetch';
import { safeApiCall, normalizeSimulation } from '../utils/safeApiCall';
import aiService from '../services/aiAssistantService';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Move inline components outside to prevent initialization errors
const PipelineFlowViz = ({ simulationData, isSimulating, simulationStatus }) => {
  if (!simulationData || !Array.isArray(simulationData.jobs) || simulationData.jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <Layers className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">No pipeline to visualize</span>
        <span className="text-xs mt-1">Write YAML to see the flow</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-3 overflow-y-auto h-full pr-1">
      {simulationData.jobs.map((job, idx) => {
        if (!job || typeof job !== 'object') return null;
        
        const jobName = typeof job.name === 'string' ? job.name : 'Unnamed Job';
        const runsOn = typeof job['runs-on'] === 'string' ? job['runs-on'] : 'ubuntu-latest';
        const steps = Array.isArray(job.steps) ? job.steps : [];
        const needs = Array.isArray(job.needs || job.dependsOn) ? (job.needs || job.dependsOn) : [];
        const jobStatus = job.status || 'pending';
        const completedSteps = steps.filter(s => s?.status === 'success').length;
        
        const jobColor = jobStatus === 'success' ? 'bg-green-500' :
                         jobStatus === 'failed' ? 'bg-red-500' :
                         jobStatus === 'running' ? 'bg-blue-500 animate-pulse' :
                         jobStatus === 'skipped' ? 'bg-gray-500' :
                         isSimulating ? 'bg-blue-500 animate-pulse' :
                         simulationStatus === 'success' ? 'bg-green-500' :
                         simulationStatus === 'failed' ? 'bg-red-500' :
                         'bg-slate-600';
        
        return (
          <div key={jobName} className="space-y-1">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white ${jobColor}`}>
                {idx + 1}
              </div>
              <span className="text-sm font-medium text-slate-200">{jobName}</span>
              {needs.length > 0 && (
                <span className="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                  needs: {needs.join(', ')}
                </span>
              )}
              <span className="text-xs text-slate-500 ml-auto">{runsOn} • {completedSteps}/{steps.length}</span>
            </div>
            {steps.map((step, sIdx) => {
              if (!step || typeof step !== 'object') return null;
              
              const stepName = typeof step.name === 'string' ? step.name :
                               typeof step.uses === 'string' ? step.uses :
                               typeof step.run === 'string' ? step.run :
                               `Step ${sIdx + 1}`;
              
              const stepColor = step.status === 'success' ? 'bg-green-400' :
                                step.status === 'failed' ? 'bg-red-400' :
                                step.status === 'running' ? 'bg-blue-400 animate-pulse' :
                                'bg-slate-500';
              
              return (
                <div key={sIdx} className="flex items-center gap-2 ml-6">
                  <div className={`w-1.5 h-1.5 rounded-full ${stepColor}`} />
                  <span className="text-xs text-slate-400 truncate">
                    {stepName}
                  </span>
                </div>
              );
            })}
            {idx < simulationData.jobs.length - 1 && (
              <div className="ml-3 flex items-center gap-1">
                <div className="w-px h-2 bg-slate-600" />
                <span className="text-[9px] text-slate-600">↓</span>
                <div className="w-px h-2 bg-slate-600" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SmartErrorPanel = ({ smartErrors }) => {
  if (!Array.isArray(smartErrors) || smartErrors.length === 0) return null;
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {smartErrors.map((err, idx) => (
          <motion.div
            key={err.type}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className={`rounded-lg border p-3 ${
              err.severity === 'error'
                ? 'bg-red-900/30 border-red-700/50'
                : 'bg-amber-900/30 border-amber-700/50'
            }`}
          >
            <div className="flex items-start gap-2">
              {err.severity === 'error' ? (
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${
                  err.severity === 'error' ? 'text-red-300' : 'text-amber-300'
                }`}>{err.message}</p>
                <pre className="mt-2 text-xs bg-slate-800/60 rounded p-2 text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto">
                  {err.suggestion}
                </pre>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const PipelineBuilder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { actions: notificationActions, simulationProgress, isConnected, isRealtimeAvailable, connectionMessage } = useNotifications();
  
  // Initialize realtime simulation data to prevent undefined errors
  const realtimeSimulationData = useMemo(() => ({
    jobStatus: simulationProgress || {}
  }), [simulationProgress]);
  const {
    template,
    pipelineName,
    platform,
    description,
    envVariables,
    secrets,
    config,
    isLoading,
    actions,
    generatePipelineCode,
    savePipeline
  } = usePipeline();

  // ─── IDE State ───────────────────────────────────────────
  const [pipelineMetadata, setPipelineMetadata] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileActiveView, setMobileActiveView] = useState('editor');
  const [activePanel, setActivePanel] = useState('editor');
  const [activeConsoleTab, setActiveConsoleTab] = useState('logs');
  const [showAIPanel, setShowAIPanel] = useState(true);
  
  // Fix All state
  const [showFixAllPanel, setShowFixAllPanel] = useState(false);
  const [isFixingAll, setIsFixingAll] = useState(false);
  const [fixAllResult, setFixAllResult] = useState(null);

  // Hardened state initialization with localStorage safety
  const [yamlCode, setYamlCode] = useState(() => {
    try {
      const stored = localStorage.getItem('pipelinepro_yaml_code');
      if (typeof stored === 'string' && stored.length > 0 && stored !== 'undefined') return stored;
    } catch (error) {
      console.warn('Failed to load YAML from localStorage:', error);
    }
    // Return a default if nothing in storage
    return `name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test`;
  });
  const [smartErrors, setSmartErrors] = useState([]);
  const [smartWarnings, setSmartWarnings] = useState([]);
  const [simulationData, setSimulationData] = useState({
  jobs: [],
  totalJobs: 0,
  totalSteps: 0
});
  const [executionLogs, setExecutionLogs] = useState([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentSimulationProgress, setCurrentSimulationProgress] = useState(0);
  const [simulationStatus, setSimulationStatus] = useState('idle');
  
  const [loadingStates, setLoadingStates] = useState({
    aiProcessing: false,
    yamlValidation: false,
    saveOperation: false,
    simulation: false
  });

  const [workflowStep, setWorkflowStep] = useState(1);

  // ─── Workflow Steps Config ───────────────────────────────
  const WORKFLOW_STEPS = [
    { id: 1, name: 'Configure', icon: FaCog, desc: 'Set pipeline settings' },
    { id: 2, name: 'Write YAML', icon: FaCode, desc: 'Create pipeline code' },
    { id: 3, name: 'Validate', icon: FaCheckCircle, desc: 'Check syntax & structure' },
    { id: 4, name: 'Simulate', icon: PlayCircle, desc: 'Test execution' }
  ];

  // Initialize from template or location state
  useEffect(() => {
    const state = location.state;
    if (state?.editMode && state?.pipelineId) {
      actions.setPipelineName('Editing Pipeline');
    } else if (state?.templateId && !template) {
      const templateData = getTemplateById(state.templateId);
      if (templateData && actions?.loadTemplate) actions.loadTemplate(templateData);
    }
  }, [location.state, template, actions]);

  // Immediate localStorage sync in state setter
  const setYamlCodeWithSync = useCallback((newValue) => {
    const value = (typeof newValue === 'string') ? newValue : '';
    setYamlCode(value);
    
    // Immediate localStorage sync
    try {
      localStorage.setItem('pipelinepro_yaml_code', value);
    } catch (error) {
      console.warn('Failed to sync YAML to localStorage:', error);
      // Continue without localStorage - app still works
    }
  }, []);

  // Sync initial code from usePipeline with error handling
  const initialCodeSynced = useRef(false);
  useEffect(() => {
    let isMounted = true;
    const syncCode = async () => {
      if (!initialCodeSynced.current && !yamlCode && (template || location.state?.templateId)) {
        try {
          const code = await generatePipelineCode();
          if (isMounted && code && typeof code === 'string') {
            setYamlCodeWithSync(code);
            initialCodeSynced.current = true;
            addLog('SUCCESS', '✅ Pipeline template loaded');
          } else {
            throw new Error('Invalid code generated');
          }
        } catch (err) {
          addLog('ERROR', `❌ Template load failed: ${err?.message || 'Unknown error'}`);
          
          // Fallback: provide basic template
          if (isMounted) {
            const fallbackCode = `name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test`;
            setYamlCodeWithSync(fallbackCode);
            addLog('INFO', '📝 Using fallback template');
          }
        }
      }
    };
    syncCode();
    return () => { isMounted = false; };
  }, [template, generatePipelineCode, yamlCode, location.state, setYamlCodeWithSync]);

  // Real-time YAML Validation & Simulation Update (safe)
  const debouncedUpdate = useMemo(() => debounce((code) => {
    if (!code || typeof code !== 'string') return;
    
    // 1. Validation (safe)
    try {
      const validation = validateYaml(code);
      setSmartErrors(prev => {
        const errors = validation?.errors || [];
        return JSON.stringify(prev) !== JSON.stringify(errors) ? errors : prev;
      });
      setSmartWarnings(prev => {
        const warnings = validation?.warnings || [];
        return JSON.stringify(prev) !== JSON.stringify(warnings) ? warnings : prev;
      });
    } catch (e) {
      setSmartErrors([]);
      setSmartWarnings([]);
    }

    // 2. Simulation Data Parsing with explicit validation
    try {
      const parsed = yaml.load(code);
      if (!parsed || typeof parsed !== 'object') {
        setSimulationData(null);
        return;
      }
      
      const jobs = parsed.jobs;
      if (!jobs || typeof jobs !== 'object') {
        setSimulationData(null);
        return;
      }
      
      const simulationStructure = Object.keys(jobs).map(jobName => {
        const job = jobs[jobName];
        const steps = job && Array.isArray(job.steps) ? job.steps : [];
        const needs = job && Array.isArray(job.needs) ? job.needs : [];
        
        return {
          name: typeof jobName === 'string' && jobName ? jobName : 'Unnamed Job',
          steps: steps,
          'runs-on': jobName === 'phases' ? 'aws-environment' : (job && typeof job['runs-on'] === 'string' ? job['runs-on'] : 'ubuntu-latest'),
          needs: needs
        };
      });
      
      const totalSteps = (simulationStructure || []).reduce((acc, job) => {
        return acc + (job && Array.isArray(job.steps) ? job.steps.length : 0);
      }, 0);
      
      const newData = {
        jobs: simulationStructure,
        totalJobs: (simulationStructure || []).length,
        totalSteps: totalSteps
      };
      
      setSimulationData(newData);
    } catch (e) {
      setSimulationData(null);
    }
  }, 500), []);

  useEffect(() => {
    debouncedUpdate(yamlCode);
    return () => debouncedUpdate.cancel();
  }, [yamlCode, debouncedUpdate]);

  const handleCodeChange = useCallback((value) => {
    const newValue = (typeof value === 'string') ? value : '';
    setYamlCodeWithSync(newValue);
    if (workflowStep < 2) setWorkflowStep(2);
  }, [workflowStep, setYamlCodeWithSync]);

  const handleApplyAIChanges = useCallback((newCode) => {
    if (typeof newCode === 'string' && newCode.length > 0) {
      handleCodeChange(newCode);
      addToast('AI changes applied', 'success');
    } else {
      addToast('AI returned empty code', 'error');
    }
  }, [handleCodeChange, addToast]);

  const handleFixAll = useCallback(async () => {
    if (!yamlCode || yamlCode.trim().length === 0) {
      addToast('No code to fix', 'error');
      return;
    }

    setIsFixingAll(true);
    setFixAllResult(null);
    setShowFixAllPanel(true);

    try {
      const currentFile = {
        path: 'pipeline.yml',
        content: yamlCode,
        language: 'yaml'
      };

      const relatedFiles = [];
      
      // Add related files if they exist (e.g., Dockerfile, package.json)
      const dockerfileMatch = yamlCode.match(/dockerfile|docker/i);
      if (dockerfileMatch) {
        relatedFiles.push({
          path: 'Dockerfile',
          content: 'FROM node:18\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nCMD ["npm", "start"]',
          language: 'dockerfile'
        });
      }

      const packageMatch = yamlCode.match(/npm|node|package\.json/i);
      if (packageMatch) {
        relatedFiles.push({
          path: 'package.json',
          content: '{\n  "name": "pipeline-app",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "node index.js",\n    "test": "jest"\n  }\n}',
          language: 'json'
        });
      }

      const result = await aiService.fixAllFiles(currentFile, relatedFiles);
      
      if (result && result.fixedFiles && result.fixedFiles.length > 0) {
        setFixAllResult(result);
        addToast(`AI processed ${result.fixedFiles.length} file(s)`, 'success');
      } else {
        throw new Error('No fixes returned from AI');
      }
    } catch (error) {
      addToast('Failed to fix code: ' + error.message, 'error');
      
      // Show fallback result
      setFixAllResult({
        fixedFiles: [{
          path: 'pipeline.yml',
          content: yamlCode,
          changes: 'No changes made due to error'
        }],
        errors: [{
          file: 'pipeline.yml',
          line: 1,
          message: error.message,
          severity: 'error'
        }],
        suggestions: []
      });
    } finally {
      setIsFixingAll(false);
    }
  }, [yamlCode, addToast]);

  const handleApplyFix = useCallback((fixedFile) => {
    if (fixedFile && fixedFile.content) {
      handleCodeChange(fixedFile.content);
      setShowFixAllPanel(false);
      addToast(`Applied fixes to ${fixedFile.path}`, 'success');
    }
  }, [handleCodeChange, addToast]);

  const addLog = useCallback((level, message) => {
    const timestamp = new Date().toISOString();
    setExecutionLogs(prev => [...prev, { timestamp, level, message, id: Date.now() + Math.random() }]);
  }, []);

  const runSimulation = async () => {
    // Prevent multiple simultaneous simulations
    if (isSimulating) {
      return;
    }
    
    if (!yamlCode || yamlCode.trim().length === 0) {
      addToast('No pipeline code to simulate', 'error');
      addLog('ERROR', '❌ No pipeline code for simulation');
      return;
    }
    
    setIsSimulating(true);
    setExecutionLogs([]);
    setCurrentSimulationProgress(0);
    setActiveConsoleTab('logs');
    setSimulationStatus('running');
    addLog('INFO', '🚀 Starting real pipeline simulation...');

    try {
      addLog('INFO', '📡 Connecting to backend...');
      
      // Debug: Show the YAML being sent
      addLog('DEBUG', `📤 Sending YAML (${yamlCode.split('\n').length} lines):`);
      yamlCode.split('\n').slice(0, 10).forEach((line, i) => {
        addLog('DEBUG', `  ${i + 1}: ${line}`);
      });
      if (yamlCode.split('\n').length > 10) {
        addLog('DEBUG', `  ... and ${yamlCode.split('\n').length - 10} more lines`);
      }
      
      let userId = 'demo-user';
      try {
        const authData = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}');
        userId = authData?.currentSession?.user?.id || 'demo-user';
      } catch (e) { /* use default */ }
      const normalized = await safeApiCall(() => safeApiRequest(API_CONFIG.ENDPOINTS.SIMULATE, {
        method: 'POST',
        headers: { 
          'x-user-id': userId
        },
        body: JSON.stringify({
          pipelineCode: yamlCode,
          mode: 'quick'
        })
      }));

      addLog('INFO', '📡 Backend response received...');

      if (!normalized.success) {
        throw new Error(normalized.error || 'Simulation failed');
      }

      const sim = normalizeSimulation(normalized.data);
      const steps = sim.steps;
      const logs = sim.logs;
      const jobs = sim.jobs;
      const status = sim.status;
      const simulationId = sim.simulationId || sim.id || null;

      if (simulationId) addLog('INFO', `📡 Simulation started with ID: ${simulationId}`);
      
      // Debug: Show jobs received
      addLog('DEBUG', `📥 Received ${Array.isArray(jobs) ? jobs.length : 0} jobs from backend`);
      if (Array.isArray(jobs)) {
        jobs.forEach((job, idx) => {
          addLog('DEBUG', `  Job ${idx + 1}: ${job.name || job.id} (${Array.isArray(job.steps) ? job.steps.length : 0} steps, needs: ${(job.needs || []).join(', ') || 'none'})`);
        });
      }
      
      // Process all logs from the simulation
      if (Array.isArray(logs) && logs.length > 0) {
        logs.forEach(log => {
          const level = log.level?.toUpperCase() || 'INFO';
          addLog(level, log.message);
        });
      }

      // Update simulation data with job-structured results
      if (Array.isArray(jobs) && jobs.length > 0) {
        const totalSteps = jobs.reduce((sum, j) => sum + (Array.isArray(j.steps) ? j.steps.length : 0), 0);
        const completedSteps = jobs.reduce((sum, j) => sum + (Array.isArray(j.steps) ? j.steps.filter(s => s.status === 'success').length : 0), 0);
        setCurrentSimulationProgress(totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0);
        setSimulationData({ jobs, totalJobs: jobs.length, totalSteps });
        addLog('INFO', `📊 Progress: ${completedSteps}/${totalSteps} steps across ${jobs.length} jobs`);
      } else if (Array.isArray(steps) && steps.length > 0) {
        const totalSteps = steps.length;
        const completedSteps = steps.filter(step => step.status === 'success').length;
        setCurrentSimulationProgress((completedSteps / totalSteps) * 100);
        addLog('INFO', `📊 Progress: ${completedSteps}/${totalSteps} steps completed`);
      } else {
        addLog('INFO', `📊 No steps data received from simulation`);
      }

      setSimulationStatus(status);
      
      // Simulation complete
      
      if (status === 'success') {
        addLog('SUCCESS', '🎉 Pipeline simulation completed successfully!');
        addToast('Simulation completed successfully!', 'success');
      } else if (status === 'failed') {
        addLog('ERROR', '❌ Pipeline simulation failed');
        addToast('Simulation failed', 'error');
      } else {
        addLog('INFO', `📡 Simulation status: ${status}`);
      }

    } catch (error) {
      const errorMessage = error?.message || 'Unknown simulation error';
      addLog('ERROR', `❌ Simulation error: ${errorMessage}`);
      setSimulationStatus('failed');
      addToast(`Simulation failed: ${errorMessage}`, 'error');
    } finally {
      setIsSimulating(false);
      addLog('INFO', '📡 Simulation process ended');
    }
  };

  const fixPipelineWithAI = async () => {
    // Prevent multiple simultaneous calls
    if (loadingStates.aiProcessing) {
      return;
    }
    
    setLoadingStates(prev => ({ ...prev, aiProcessing: true }));
    addLog('INFO', '🤖 AI is analyzing and fixing your pipeline...');
    
    try {
      // Validate input before API call
      if (!yamlCode || yamlCode.trim().length === 0) {
        throw new Error('No pipeline code to fix');
      }
      
      // Browser-compatible timeout with AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await safeApiRequest(`${API_CONFIG.ENDPOINTS.AI_PROCESS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'fix',
          code: yamlCode,
          context: { platform: platform || 'github' }
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      
      // Validate response structure
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid API response');
      }
      
      if (!result.success || !result.content) {
        throw new Error(result?.error || 'AI fix returned no results');
      }
      
      // Extract code from response (strip markdown fences)
      const cleaned = result.content
        .replace(/^```(?:ya?ml)?\s*\n?/i, '')
        .replace(/\n?```\s*$/i, '')
        .trim();
      
      if (cleaned && cleaned.length > 0) {
        handleCodeChange(cleaned);
        addToast('AI fixed your pipeline!', 'success');
        addLog('SUCCESS', '✅ AI successfully fixed the pipeline');
      } else {
        throw new Error('AI returned empty code');
      }
    } catch (e) {
      const errorMessage = e?.message || 'Unknown error occurred';
      addToast(`AI Fix Failed: ${errorMessage}`, 'error');
      addLog('ERROR', `❌ AI Fix Failed: ${errorMessage}`);
      
      // Fallback: try to recover with basic validation
      if (yamlCode && yamlCode.includes('name:')) {
        addLog('INFO', '📝 Using existing code as fallback');
      }
    } finally {
      // Always reset loading state to prevent UI freeze
      setLoadingStates(prev => ({ ...prev, aiProcessing: false }));
    }
  };

const handleSave = async () => {
    // Prevent multiple simultaneous saves
    if (loadingStates.saveOperation) {
      return;
    }
    
    if (!yamlCode || yamlCode.trim().length === 0) {
      addToast('No pipeline code to save', 'error');
      return;
    }
    
    const name = pipelineName || 'Untitled Pipeline';
    
    setLoadingStates(prev => ({ ...prev, saveOperation: true }));
    
    try {
      const result = await pipelineService.savePipeline({
        name,
        yaml: yamlCode,
        platform: platform || 'github',
        language: 'node',
        deployment: 'docker',
        description: '',
        config: {},
        status: 'active'
      });

      if (!result || (result.success === false && !result.data)) {
        throw new Error(result?.error || 'Failed to save pipeline');
      }

      addToast('Pipeline saved successfully', 'success');
      addLog('SUCCESS', '✅ Pipeline saved to database');
      const savedId = result?.data?.id || result?.id;
      if (savedId) addLog('INFO', `📝 Pipeline ID: ${savedId}`);
      
      // Emit global event for UI refresh
      globalEvents.emit(EVENTS.PIPELINE_SAVED, {
        pipeline: result.data || result,
        timestamp: new Date().toISOString()
      });
      
      // Redirect to My Pipelines after save to see the new entry
      setTimeout(() => {
        navigate('/my-pipelines');
      }, 1500);
      
      // Also save to localStorage as backup (already handled by setYamlCodeWithSync)
      addLog('INFO', '📝 Pipeline backed up to localStorage');
      
    } catch (err) {
      const errorMessage = err?.message || 'Unknown error occurred';
      addToast(`Failed to save pipeline: ${errorMessage}`, 'error');
      addLog('ERROR', `❌ Save Failed: ${errorMessage}`);
      
      // Fallback: ensure localStorage has the data
      try {
        localStorage.setItem('pipelinepro_yaml_code', yamlCode);
        addLog('INFO', '📝 Pipeline saved to localStorage as fallback');
      } catch (localStorageError) {
        addLog('ERROR', '❌ Even localStorage fallback failed');
      }
    } finally {
      // Always reset loading state to prevent UI freeze
      setLoadingStates(prev => ({ ...prev, saveOperation: false }));
    }
  };


  const getErrorMessage = (field) => {
    const error = smartErrors.find(e => e.field === field);
    return error ? error.message : '';
  };

  const bgBase = isDarkMode ? 'bg-slate-950' : 'bg-slate-50';
  const bgPanel = isDarkMode ? 'bg-slate-900' : 'bg-white';
  const borderClr = isDarkMode ? 'border-slate-800' : 'border-slate-200';
  const textPrimary = isDarkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = isDarkMode ? 'text-slate-400' : 'text-slate-500';

  return (
    <div className={`min-h-screen ${bgBase} transition-colors duration-300`}>
      {/* ─── WORKFLOW GUIDANCE BANNER ──────────────────────── */}
      <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border-b sticky top-0 z-40`}>
        <div className="max-w-[1800px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
              <Rocket className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className={`text-xs sm:text-sm font-semibold ${textPrimary} truncate max-w-[100px] sm:max-w-none`}>PipelinePro</span>
          </div>

          {/* Workflow Steps */}
          <div className="hidden md:flex items-center gap-1">
            {WORKFLOW_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => setWorkflowStep(step.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    workflowStep >= step.id
                      ? 'bg-blue-600 text-white'
                      : `${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`
                  }`}
                >
                  <step.icon className="w-3 h-3" />
                  <span className="hidden lg:inline">{step.name}</span>
                </button>
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <ChevronRight className={`w-3 h-3 ${workflowStep > step.id ? 'text-blue-500' : textSecondary}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Dark/Light Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 sm:p-2 rounded-lg transition-colors ${isDarkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {isDarkMode ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Connection Status */}
            <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
              isConnected ? 'bg-green-500/10 text-green-500' :
              isRealtimeAvailable ? 'bg-amber-500/10 text-amber-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isConnected ? 'bg-green-500 animate-pulse' :
                isRealtimeAvailable ? 'bg-amber-500' : 'bg-red-500'
              }`} />
              <span>{isConnected ? 'Live' : isRealtimeAvailable ? 'Connecting' : 'Offline'}</span>
            </div>

            {/* Fix Pipeline (AI) */}
            <button
              onClick={() => fixPipelineWithAI()}
              disabled={loadingStates.aiProcessing}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loadingStates.aiProcessing ? (
                <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Fixing...</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5" />Fix</>
              )}
            </button>

            {/* Simulate */}
            <button
              onClick={() => runSimulation()}
              disabled={isSimulating || !simulationData}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? (
                <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />Run</>
              ) : (
                <><PlayCircle className="w-3.5 h-3.5" />Simulate</>
              )}
            </button>

            {/* Fix All */}
            <button
              onClick={handleFixAll}
              disabled={isLoading || isFixingAll}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 active:scale-95"
            >
              {isFixingAll ? (
                <><FaSpinner className="w-3 h-3 animate-spin" /><span className="hidden sm:inline">Fixing</span></>
              ) : (
                <><FaBug className="w-3 h-3" /><span className="hidden sm:inline">Fix All</span></>
              )}
            </button>

            {/* Save */}
            <button
              onClick={handleSave}
              disabled={isLoading || loadingStates.saveOperation}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 active:scale-95"
            >
              {loadingStates.saveOperation ? (
                <><FaSpinner className="w-3 h-3 animate-spin" /><span className="hidden sm:inline">Saving</span></>
              ) : (
                <><FaSave className="w-3 h-3" /><span className="hidden sm:inline">Save</span></>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE TABS ───────────────────────────────────── */}
      <div className={`md:hidden ${bgPanel} ${borderClr} border-b`}>
        <div className="flex">
          {[
            { id: 'config', label: 'Config', Icon: FaCog },
            { id: 'editor', label: 'Editor', Icon: Terminal },
            { id: 'console', label: 'Console', Icon: Eye },
            { id: 'ai', label: 'AI', Icon: Sparkles }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setMobileActiveView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${
                mobileActiveView === tab.id
                  ? 'text-blue-500 border-b-2 border-blue-500'
                  : textSecondary
              }`}
            >
              <tab.Icon className="w-3.5 h-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── 3-COLUMN IDE LAYOUT ──────────────────────────── */}
      <div className="max-w-[1800px] mx-auto h-[calc(100vh-144px)] md:h-[calc(100vh-56px)] flex overflow-hidden">
        
        {/* ═══ LEFT: Steps Library & Drag-Drop ═══ */}
        <aside className={`${mobileActiveView === 'config' ? 'block' : 'hidden md:block'} w-full md:w-64 lg:w-80 ${bgPanel} ${borderClr} border-r flex flex-col overflow-y-auto z-10`}>
          <div className="flex-1">
            <DragDropBuilder 
              yamlCode={yamlCode}
              onSyncCode={handleCodeChange}
              simulationStatus={realtimeSimulationData?.jobStatus}
            />
          </div>
        </aside>

        {/* ═══ CENTER: Editor + Console ═══ */}
        <main className={`${mobileActiveView === 'editor' || mobileActiveView === 'console' ? 'block' : 'hidden md:block'} flex-1 flex flex-col min-w-0 bg-slate-950 relative`}>
          {/* Tabs for Center Panel */}
          <div className="flex items-center bg-slate-900 border-b border-slate-800 px-2 sm:px-4 sticky top-0 z-20">
            <button 
              onClick={() => setActivePanel('editor')}
              className={`px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold border-b-2 transition-colors ${activePanel === 'editor' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                <Terminal className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="hidden xs:inline">PIPELINE.YAML</span>
                <span className="xs:hidden">YAML</span>
              </div>
            </button>
            <button 
              onClick={() => setActivePanel('flow')}
              className={`px-3 sm:px-4 py-2.5 text-[10px] sm:text-xs font-bold border-b-2 transition-colors ${activePanel === 'flow' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                <span className="hidden xs:inline">VISUAL GRAPH</span>
                <span className="xs:hidden">GRAPH</span>
              </div>
            </button>
          </div>

          <div className="flex-1 relative min-h-0 overflow-hidden">
            {activePanel === 'editor' ? (
              <div className="h-full w-full">
                <CodeEditor
                  value={yamlCode}
                  onChange={handleCodeChange}
                  isDarkMode={isDarkMode}
                  height="100%"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-slate-900 overflow-auto">
                <DragDropBuilder 
                  yamlCode={yamlCode}
                  onSyncCode={handleCodeChange}
                  simulationStatus={realtimeSimulationData?.jobStatus}
                  view="graph"
                />
              </div>
            )}
          </div>

          {/* Console / Logs Section - Responsive Height */}
          <div className={`${mobileActiveView === 'console' ? 'flex-1' : 'h-1/3'} border-t border-slate-800 bg-slate-950 flex flex-col min-h-[180px] sm:min-h-[200px]`}>
            <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-slate-900 bg-slate-900/50">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500">Console</span>
                {isSimulating && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 sm:w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${currentSimulationProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {['logs', 'flow', 'errors'].map(tabId => (
                  <button
                    key={tabId}
                    onClick={() => setActiveConsoleTab(tabId)}
                    className={`px-2 sm:px-3 py-1 text-[9px] sm:text-[10px] font-bold rounded-md uppercase tracking-wider transition-colors ${activeConsoleTab === tabId ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tabId}
                  </button>
                ))}
              </div>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-[10px] sm:text-[11px] space-y-1 custom-scrollbar">
              {activeConsoleTab === 'logs' ? (
                executionLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2 opacity-50">
                    <Terminal size={20} />
                    <p className="text-[10px]">Awaiting simulation...</p>
                  </div>
                ) : (
                  executionLogs.map((log) => (
                    <div key={log.id} className="flex gap-2 sm:gap-3 leading-relaxed">
                      <span className="text-slate-600 shrink-0 tabular-nums">{new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      <span className={cn(
                        "font-bold shrink-0 w-12 sm:w-16",
                        log.level === 'ERROR' ? 'text-red-500' :
                        log.level === 'SUCCESS' ? 'text-emerald-500' :
                        log.level === 'WARN' ? 'text-amber-500' : 'text-blue-400'
                      )}>[{log.level}]</span>
                      <span className="text-slate-300 break-all sm:break-normal">{log.message}</span>
                    </div>
                  ))
                )
              ) : activeConsoleTab === 'flow' ? (
                <PipelineFlowViz 
                  simulationData={simulationData} 
                  isSimulating={isSimulating} 
                  simulationStatus={simulationStatus} 
                />
              ) : (
                <SmartErrorPanel smartErrors={smartErrors} />
              )}
            </div>
          </div>
        </main>

        {/* ═══ RIGHT: AI Assistant ═══ */}
        {showAIPanel && (
          <aside className={`${mobileActiveView === 'ai' ? 'block' : 'hidden md:flex'} w-full md:w-80 lg:w-96 ${bgPanel} ${borderClr} border-l flex-col z-10`}>
            <AIChatPanel
              currentCode={yamlCode}
              onApplyCode={handleApplyAIChanges}
              platform={platform || 'github'}
              isDarkMode={isDarkMode}
            />
          </aside>
        )}
      </div>

      {/* Fix All Panel */}
      <FixAllPanel
        isOpen={showFixAllPanel}
        onClose={() => setShowFixAllPanel(false)}
        isFixing={isFixingAll}
        result={fixAllResult}
        onApplyFix={handleApplyFix}
      />
    </div>
  );
};

export default PipelineBuilder;
