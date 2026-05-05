import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import ControlPanel from '../components/ControlPanel';
import CodeEditor from '../components/CodeEditor';
import ValidationPanel from '../components/ValidationPanel';
import Simulator from '../components/Simulator';
import EnhancedStepper from '../components/EnhancedStepper';
import AIChatPanel from '../components/AIChatPanel';
import DragDropBuilder from '../components/DragDropBuilder';
import { Button, Card } from '../components/FormSystem';
import { validatePipeline } from '../utils/validator';
import { useToast } from '../components/ToastProvider';
import { useGestures } from '../hooks/useGestures';
import { 
  FaSearch, FaTimes, FaSpinner, FaMagic, FaBook, 
  FaHistory, FaExternalLinkAlt, FaRocket, FaCheckCircle, FaCloud,
  FaCode, FaProjectDiagram
} from 'react-icons/fa';
import { Sparkles } from 'lucide-react';
import { templates, searchTemplates, PLATFORMS } from '../data/templates';
import { pipelineService } from '../services/pipelineService';
import { recoverYaml } from '../services/pipelineParser';

// Ensure templates is always an array
const safeTemplates = Array.isArray(templates) ? templates : [];

const ALL_PLATFORMS = [
    { id: 'github', name: 'GitHub Actions', icon: '🐙', color: 'from-slate-700 to-slate-900', desc: 'Modern Git-ops and OSS automation', category: 'CI/CD', difficulty: 'Easy' },
    { id: 'aws', name: 'AWS', icon: '☁️', color: 'from-orange-400 to-amber-600', desc: 'EC2, Lambda, ECS, S3 & CodePipeline', category: 'Cloud', difficulty: 'Medium' },
    { id: 'azure', name: 'Azure', icon: '🔷', color: 'from-blue-500 to-cyan-600', desc: 'Azure DevOps, VMs, Functions & AKS', category: 'Cloud', difficulty: 'Medium' },
    { id: 'gcp', name: 'Google Cloud', icon: '🌐', color: 'from-red-500 to-yellow-500', desc: 'Cloud Run, GKE, Compute & Functions', category: 'Cloud', difficulty: 'Medium' },
    { id: 'jenkins', name: 'Jenkins CI', icon: '⚙️', color: 'from-gray-600 to-gray-800', desc: 'Self-hosted, highly custom automation', category: 'CI/CD', difficulty: 'Hard' },
    { id: 'vercel', name: 'Vercel', icon: '▲', color: 'from-gray-900 to-black', desc: 'Zero-config frontend deployments', category: 'Static', difficulty: 'Easy' },
    { id: 'netlify', name: 'Netlify', icon: '🌿', color: 'from-teal-500 to-emerald-600', desc: 'Jamstack & static site hosting', category: 'Static', difficulty: 'Easy' },
    { id: 'digitalocean', name: 'DigitalOcean', icon: '🌊', color: 'from-blue-600 to-indigo-700', desc: 'App Platform, Droplets & Kubernetes', category: 'Cloud', difficulty: 'Easy' }
  ];

const RECOMMENDED_MAP = {
  react: ['vercel', 'netlify'],
  node: ['aws', 'digitalocean'],
  python: ['aws', 'gcp'],
  java: ['aws', 'azure'],
  go: ['gcp', 'aws'],
  microservices: ['aws', 'azure', 'gcp']
};

import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();
  const { user, isAuthenticated } = useAuth();
  
  const [editorMode, setEditorMode] = useState('visual');
  const [step, setStep] = useState(1);
  const [selectedPlatform, setSelectedPlatform] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('node');
  const [selectedDeployment, setSelectedDeployment] = useState('docker');
  const [yamlCode, setYamlCode] = useState('');
  const [stats, setStats] = useState({
    totalPipelines: 0,
    totalDeployments: 0,
    activePipelines: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [savedPipelines, setSavedPipelines] = useState([]);
  const [simulationStatus, setSimulationStatus] = useState('idle');
  const [simulationCurrentStage, setSimulationCurrentStage] = useState(null);
  const [platformSearch, setPlatformSearch] = useState('');
  const [isAiOpen, setIsAiOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const response = await apiClient.get('/api/analytics');
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Dashboard data fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [isAuthenticated]);

  const gestures = useGestures({
    onSwipeLeft: () => step < 7 && setStep(s => s + 1),
    onSwipeRight: () => step > 1 && setStep(s => s - 1),
    onPullDown: () => window.location.reload()
  });

  const filteredPlatforms = useMemo(() => {
    if (!platformSearch || typeof platformSearch !== 'string') return ALL_PLATFORMS || [];
    const searchLower = platformSearch.toLowerCase();
    return (ALL_PLATFORMS || []).filter(p => 
      p && p.name && p.desc && 
      (p.name.toLowerCase().includes(searchLower) || 
       p.desc.toLowerCase().includes(searchLower))
    );
  }, [platformSearch]);

  useEffect(() => {
    if (location.state?.fromTemplates && templates) {
      const templateId = location.state.templateId;
      const template = location.state.template || safeTemplates.find(t => t && t.id === templateId);
      
      if (template && template.platform) {
        setSelectedPlatform(template.platform);
        setSelectedLanguage(template.language || 'node');
        setSelectedDeployment(template.deployment || 'docker');
        setYamlCode(template.code || '');
        
        if (location.state.aiMode) {
          setStep(4);
          addToast(`AI Smart Mode active for "${template.name ?? 'Unknown'}"`, 'success');
        } else {
          setStep(4);
          addToast(`Template "${template.name ?? 'Unknown'}" loaded!`, 'success');
        }
      }
    }
  }, [location.state, addToast, templates]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const data = await pipelineService.getPipelines();
        const safeData = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
        setSavedPipelines(safeData.slice(0, 3));
      } catch (e) {
        console.warn('[Dashboard] Failed to fetch recent pipelines:', e?.message);
        setSavedPipelines([]);
      }
    };
    fetchRecent();
  }, []);

  const goToStep = useCallback((stepNum) => {
    setStep(stepNum);
  }, []);

  useEffect(() => {
    if (step === 5 && yamlCode) {
      const result = validatePipeline(yamlCode);
      setValidationResult(result);
      if (result?.isValid) {
        addToast('Pipeline validation passed!', 'success');
      } else {
        addToast('Pipeline validation failed. Please check the code.', 'error');
      }
    }
  }, [step, yamlCode, addToast]);

  const handlePlatformSelect = useCallback((platform) => {
    setSelectedPlatform(platform);
    addToast("Platform selected: " + platform?.toUpperCase(), 'success');
    setStep(2);
  }, [addToast]);

  const handleSave = async () => {
    const finalCode = yamlCode;
    if (!finalCode || !selectedPlatform) {
      addToast('Please generate and review a pipeline first', 'error');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const pipelineData = {
        name: `${String(selectedPlatform || "").toUpperCase()} Pipeline - ${new Date().toLocaleDateString()}`,
        platform: selectedPlatform,
        language: selectedLanguage,
        deployment: selectedDeployment,
        code: finalCode,
        config: {
          platform: selectedPlatform,
          language: selectedLanguage,
          deployment: selectedDeployment
        },
        status: 'active'
      };
      
      const response = await apiClient.post('/api/pipelines', pipelineData);
      if (response.success) {
        addToast('Pipeline saved successfully!', 'success');
        navigate('/my-pipelines');
      }
    } catch (err) {
      const msg = err?.message || 'Failed to save pipeline';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/api/pipelines/generate', {
        platform: selectedPlatform,
        language: selectedLanguage,
        deployment: selectedDeployment
      });
      
      const pipelineCode = response?.data?.pipelineCode || response?.pipelineCode || (typeof response?.data === 'string' ? response.data : null);
      
      if (pipelineCode && typeof pipelineCode === 'string' && pipelineCode.trim().length > 0) {
        setYamlCode(pipelineCode);
        addToast('Cloud model generated!', 'success');
        setStep(4);
      } else {
        throw new Error('No code returned from AI engine');
      }
    } catch (err) {
      const msg = err?.message || 'AI Generation unavailable';
      setError(msg);
      addToast(msg, 'error');
      
      const fallback = `# Industry Standard ${String(selectedPlatform || "").toUpperCase()} Pipeline\nname: ${String(selectedPlatform || "").toUpperCase()} Flow\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - name: Build\n        run: echo "Building..."`;
      
      setYamlCode(fallback);
      setStep(4);
    } finally {
      setIsGenerating(false);
    }
  };

  const UIFeedback = () => {
    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[110] w-full max-w-md px-4"
        >
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-2xl shadow-2xl flex items-center space-x-3 backdrop-blur-md">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <FaTimes className="text-red-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-red-800 font-bold text-sm">System Error</h3>
              <p className="text-red-600 text-xs mt-0.5 truncate">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-400">
              <FaTimes />
            </button>
          </div>
        </motion.div>
      );
    }
    return null;
  };

  useEffect(() => {
    if (selectedPlatform && (step === 3 || step === 4)) {
      const syncedCode = `# Architecture for ${String(selectedLanguage || "").toUpperCase()} targeting ${String(selectedDeployment || "").toUpperCase()}\nname: Production Workflow\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4`;
      if (!yamlCode || step === 3) {
        setYamlCode(syncedCode);
      }
    }
  }, [selectedLanguage, selectedDeployment, selectedPlatform, step]);

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Choose Your Cloud Host</h2>
              <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto">Select a primary platform. Our AI engine will architect the perfect production-ready model.</p>
            </div>

            <div className="relative max-w-xl mx-auto mb-10">
              <FaSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search hosts (GitHub, AWS, Azure...)"
                value={platformSearch}
                onChange={(e) => setPlatformSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-blue-500 transition-all outline-none font-bold text-slate-800 shadow-xl shadow-blue-500/5"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {(filteredPlatforms || []).map((plat) => {
                if (!plat || !plat.id) return null;
                const isRecommended = selectedLanguage && RECOMMENDED_MAP && RECOMMENDED_MAP[selectedLanguage] && Array.isArray(RECOMMENDED_MAP[selectedLanguage]) && RECOMMENDED_MAP[selectedLanguage].includes(plat.id);
                return (
                <motion.div
                  key={plat.id}
                  whileHover={{ y: -6, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handlePlatformSelect(plat.id)}
                  className={`relative p-6 rounded-2xl bg-white border-2 transition-all cursor-pointer group shadow-sm overflow-hidden ${
                    selectedPlatform === plat.id ? 'border-blue-600 ring-4 ring-blue-600/10' : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  {isRecommended && (
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase rounded-full tracking-wider">Recommended</span>
                  )}
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${plat.color} flex items-center justify-center text-white text-3xl shadow-lg mb-4 group-hover:rotate-6 transition-transform`}>
                    {plat.icon}
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-1">{plat.name}</h3>
                  <p className="text-slate-500 font-medium text-xs leading-relaxed mb-4">{plat.desc}</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      plat.difficulty === 'Easy' ? 'bg-green-50 text-green-600' :
                      plat.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-600'
                    }`}>{plat.difficulty}</span>
                  </div>
                </motion.div>
                );
              })}
            </div>
          </motion.div>
        );
      
      case 2:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-12">
            <Card className="text-center space-y-8">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mx-auto shadow-inner">
                <FaCloud className="text-blue-600 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-slate-900">Architecture Logic</h2>
                <p className="text-slate-500 font-medium text-lg leading-relaxed">Defining core dependencies for your build. We'll generate a production-ready model based on these settings.</p>
              </div>
              <Button onClick={() => setStep(3)} size="xl" className="w-full" rightIcon={FaMagic}>
                Continue to Configuration
              </Button>
            </Card>
          </motion.div>
        );
      
      case 3:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <ControlPanel
              selectedPlatform={selectedPlatform}
              selectedLanguage={selectedLanguage}
              selectedDeployment={selectedDeployment}
              onLanguageChange={setSelectedLanguage}
              onDeploymentChange={setSelectedDeployment}
              onGenerate={handleGenerate}
              isLoading={isGenerating}
            />
          </motion.div>
        );
      
      case 4:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 flex items-center gap-4">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl shadow-lg shadow-blue-500/10" />
                  Architecture Designer
                </h2>
                <p className="text-slate-500 font-medium">Design and refine your CI/CD model with visual blocks or direct code.</p>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm mr-2 w-full sm:w-auto">
                  <button 
                    onClick={() => setEditorMode('visual')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      editorMode === 'visual' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <FaProjectDiagram size={14} /> VISUAL
                  </button>
                  <button 
                    onClick={() => setEditorMode('code')}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all ${
                      editorMode === 'code' ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <FaCode size={14} /> CODE
                  </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                   <Button variant="secondary" onClick={handleGenerate} className="flex-1 sm:flex-none" leftIcon={FaMagic}>Re-Architect</Button>
                   <Button onClick={() => setStep(5)} className="flex-1 sm:flex-none" rightIcon={FaRocket}>Confirm Flow</Button>
                </div>
              </div>
            </div>

            {editorMode === 'visual' ? (
              <DragDropBuilder onSyncCode={setYamlCode} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 min-h-[600px]">
                  <CodeEditor
                    value={yamlCode}
                    onChange={setYamlCode}
                    language="yaml"
                    height="600px"
                  />
                </div>
                <div className="lg:col-span-1">
                  <div className="lg:sticky lg:top-6">
                    <AIChatPanel
                      currentCode={yamlCode}
                      onApplyCode={(code) => {
                        setYamlCode(code);
                        setEditorMode('code');
                      }}
                      platform={selectedPlatform}
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        );
      
      case 5:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
            <ValidationPanel validationResult={validationResult} onFix={() => setStep(4)} />
            <div className="mt-12 flex flex-col items-center gap-4">
              {!validationResult?.isValid && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm max-w-lg text-center">
                  ⚠️ Your YAML has validation errors. You can try to fix them manually or use the auto-recovery feature.
                  <button 
                    onClick={() => {
                      const fixed = recoverYaml(yamlCode);
                      setYamlCode(fixed);
                      addToast('YAML recovered to safe default', 'info');
                    }}
                    className="block mx-auto mt-2 font-bold underline hover:text-amber-900"
                  >
                    Auto-Recover to Safe Default
                  </button>
                </div>
              )}
              <Button 
                onClick={() => setStep(6)} 
                size="xl" 
                className={`px-12 ${!validationResult?.isValid ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                rightIcon={FaRocket}
                disabled={!validationResult?.isValid}
              >
                {validationResult?.isValid ? 'Start Simulation Run' : 'Fix YAML to Continue'}
              </Button>
            </div>
          </motion.div>
        );
      
      case 6:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <Simulator 
              generatedCode={yamlCode} 
              setSimStatus={setSimulationStatus} 
              setSimCurrentStage={setSimulationCurrentStage} 
              platform={selectedPlatform} 
            />
            {simulationStatus === 'success' && (
              <Card className="max-w-2xl mx-auto text-center border-emerald-100 bg-emerald-50/30 space-y-6">
                <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto shadow-xl">✓</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-emerald-900">Simulation Passed!</h3>
                  <p className="text-emerald-700 font-medium">Your architecture is validated and production-ready. No logic failures detected.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleSave} variant="success" size="lg" isLoading={isLoading} leftIcon={FaRocket}>Save Pipeline</Button>
                  <Button onClick={() => setStep(7)} variant="secondary" size="lg">Review & Finalize</Button>
                </div>
              </Card>
            )}
            {simulationStatus === 'failed' && (
              <Card className="max-w-2xl mx-auto text-center border-red-100 bg-red-50/30 space-y-6">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white text-4xl mx-auto shadow-xl">✗</div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-red-900">Simulation Failed</h3>
                  <p className="text-red-700 font-medium">Your pipeline encountered errors during simulation. Review the logs above and fix issues.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={() => setStep(4)} variant="secondary" size="lg">Back to Editor</Button>
                  <Button onClick={() => { setSimulationStatus('idle'); }} size="lg">Retry Simulation</Button>
                </div>
              </Card>
            )}
          </motion.div>
        );
      
      case 7:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-20 text-center space-y-10">
            <div className="space-y-4">
              <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center text-6xl mb-8 mx-auto animate-bounce">🚀</div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">Pipeline Synchronized!</h2>
              <p className="text-slate-500 text-xl font-medium max-w-lg mx-auto leading-relaxed">Your CI/CD workflow is ready for live deployment. We've archived this build to your vault.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Button onClick={handleSave} size="xl" className="w-full sm:w-auto" isLoading={isLoading} leftIcon={FaRocket}>Save to Dashboard</Button>
              <Button onClick={() => setStep(1)} variant="secondary" size="xl" className="w-full sm:w-auto">Build Another</Button>
            </div>
          </motion.div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div 
      className="w-full relative"
      onTouchStart={gestures.onTouchStart}
      onTouchMove={gestures.onTouchMove}
      onTouchEnd={gestures.onTouchEnd}
    >
      <UIFeedback />

      <AnimatePresence>
        {isAiOpen && (
          <AIChatPanel 
            currentCode={yamlCode} 
            onApplyCode={(code) => { setYamlCode(code); setStep(4); }}
            platform={selectedPlatform}
          />
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAiOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center z-40 border-4 border-white md:hidden"
      >
        <Sparkles size={24} />
      </motion.button>

      {(isGenerating || isLoading) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[9999]">
          <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-100 max-w-xs w-full">
            <FaSpinner className="animate-spin text-blue-600 text-5xl mb-6" />
            <p className="text-slate-900 font-black text-lg uppercase tracking-widest">{isGenerating ? "Architecting..." : "Archiving..."}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100 mb-8 overflow-hidden relative group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-blue-500/10 transition-colors" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter flex items-center gap-4">
              <span className="w-2 md:w-3 h-10 md:h-12 bg-blue-600 rounded-full" /> 
              AI Cloud Architect
            </h1>
            <p className="text-slate-500 font-medium text-base md:text-xl">Design, validate and deploy enterprise pipelines at scale.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100 self-start md:self-center shadow-inner">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Engine Online</span>
          </div>
        </div>

        <div className="mt-10 md:mt-14 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <EnhancedStepper currentStep={step} totalSteps={7} onStepClick={goToStep} />
        </div>
      </div>

      <div className="w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "circOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>

      {gestures.isPulling && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-blue-600 bg-white shadow-xl px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2">
          <FaSpinner className="animate-spin" />
          <span className="text-xs font-bold uppercase tracking-widest">Release to Reload</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
