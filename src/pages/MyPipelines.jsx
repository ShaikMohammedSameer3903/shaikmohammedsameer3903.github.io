import React, { useState, useEffect, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { 
  FaPlay, FaEye, FaEdit, FaTrash, FaPlus, FaSync, 
  FaCog, FaServer, FaKey, FaSearch, FaFilter, FaHistory 
} from 'react-icons/fa';
import { 
  Search, Filter, Plus, RefreshCw, LayoutGrid, 
  List, MoreVertical, Play, Trash2, Edit3, 
  ExternalLink, Calendar, ChevronRight, AlertCircle,
  Box, CheckCircle2, Clock, X
} from 'lucide-react';
import { pipelineService } from '../services/pipelineService';
import { globalEvents, EVENTS } from '../utils/globalEvents';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="w-12 h-12 bg-slate-100 rounded-xl" />
      <div className="w-20 h-6 bg-slate-100 rounded-full" />
    </div>
    <div className="space-y-3">
      <div className="h-6 bg-slate-100 rounded-lg w-3/4" />
      <div className="h-4 bg-slate-100 rounded-lg w-1/2" />
      <div className="h-4 bg-slate-100 rounded-lg w-full" />
    </div>
    <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between">
      <div className="w-24 h-4 bg-slate-100 rounded" />
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
        <div className="w-8 h-8 bg-slate-100 rounded-lg" />
      </div>
    </div>
  </div>
);

const StatusBadge = memo(({ status }) => {
  const config = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle2 },
    success: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', icon: CheckCircle2 },
    running: { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', icon: Clock, animate: true },
    failed: { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', icon: AlertCircle },
    pending: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', icon: Clock },
  };

  const style = config[status?.toLowerCase()] || config.pending;
  const Icon = style.icon;

  return (
    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0 ${style.bg} ${style.text} ${style.border} border`}>
      <Icon size={10} className={style.animate ? 'animate-spin' : ''} />
      <span className="whitespace-nowrap">{status || 'pending'}</span>
    </div>
  );
});

const MyPipelines = () => {
  const [pipelines, setPipelines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pipelineToDelete, setPipelineToDelete] = useState(null);
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, isAuthenticated } = useAuth();

  const PLATFORMS = [
    { id: 'github', name: 'GitHub Actions', icon: '🐙' },
    { id: 'aws', name: 'AWS DevOps', icon: '☁️' },
    { id: 'jenkins', name: 'Jenkins', icon: '⚙️' },
    { id: 'gitlab', name: 'GitLab CI', icon: '🦊' },
  ];

  const fetchPipelines = async (silent = false) => {
    if (!isAuthenticated) return;
    if (!silent) setIsLoading(true);
    setError(null);
    
    try {
      const data = await pipelineService.getPipelines(true);
      setPipelines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch pipelines:', err);
      setError('Failed to load pipelines. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelines();
    
    const unsubscribe = globalEvents.on(EVENTS.PIPELINE_SAVED, () => {
      fetchPipelines(true);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  const filteredPipelines = useMemo(() => {
    return pipelines.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           p.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = filterPlatform === 'all' || p.platform === filterPlatform;
      return matchesSearch && matchesPlatform;
    });
  }, [pipelines, searchQuery, filterPlatform]);

  const confirmDelete = async () => {
    if (!pipelineToDelete?.id) return;
    try {
      // Try Supabase first for instant UI update
      if (user?.id && supabase) {
        const { data: deletedRows, error: supaErr, count } = await supabase
          .from('pipelines')
          .delete({ count: 'exact' })
          .eq('id', pipelineToDelete.id)
          .eq('user_id', user.id);
        
        if (!supaErr && count > 0) {
          setPipelines(prev => prev.filter(p => p.id !== pipelineToDelete.id));
          addToast('Pipeline deleted successfully', 'success');
          setShowDeleteModal(false);
          globalEvents.emit(EVENTS.PIPELINE_DELETED);
          return;
        } else if (supaErr) {
          console.warn('Supabase delete failed, falling back to API:', supaErr.message);
        }
      }
      
      // Fallback to API
      await pipelineService.deletePipeline(pipelineToDelete.id);
      setPipelines(prev => prev.filter(p => p.id !== pipelineToDelete.id));
      addToast('Pipeline deleted successfully', 'success');
      setShowDeleteModal(false);
      globalEvents.emit(EVENTS.PIPELINE_DELETED);
    } catch (err) {
      addToast('Failed to delete: ' + (err?.message || 'Unknown error'), 'error');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return isNaN(date) ? '--' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 🚀 Header Area */}
      <div className="flex flex-col gap-6 sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-600 rounded-full hidden sm:block" />
              My Pipelines
            </h1>
            <p className="text-slate-500 text-sm sm:text-base font-medium">Manage your production CI/CD architectures.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchPipelines()}
              className="p-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all shadow-sm group active:scale-95"
              title="Refresh Vault"
            >
              <RefreshCw size={18} className={`${isLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 sm:flex-none px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap"
            >
              <Plus size={18} strokeWidth={3} />
              New Pipeline
            </button>
          </div>
        </div>

        {/* 🔍 Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-medium"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-48">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <select 
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-sm font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="all">All Platforms</option>
                <option value="github">GitHub</option>
                <option value="aws">AWS</option>
                <option value="jenkins">Jenkins</option>
                <option value="gitlab">GitLab</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 📦 Grid Content */}
      <div className="pb-24 sm:pb-8">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : filteredPipelines.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-center px-6"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-blue-50 rounded-full flex items-center justify-center text-4xl sm:text-5xl mb-8">
              {searchQuery ? '🔍' : '📦'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 mb-3">
              {searchQuery ? 'No matches found' : 'Vault is empty'}
            </h2>
            <p className="text-slate-500 text-sm sm:text-base font-medium max-w-sm mx-auto mb-10">
              {searchQuery ? `We couldn't find any pipelines matching "${searchQuery}"` : 'Start your DevOps journey by creating your first deployment architecture.'}
            </p>
            <button 
              onClick={() => { searchQuery ? setSearchQuery('') : navigate('/dashboard') }}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95"
            >
              {searchQuery ? 'Clear Search' : 'Create First Pipeline'}
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredPipelines.map((pipeline, idx) => (
                <motion.div
                  key={pipeline.id || idx}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ y: -4 }}
                  className="group bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all flex flex-col justify-between h-full relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-xl sm:text-2xl group-hover:bg-blue-50 group-hover:scale-110 transition-all duration-300">
                        {PLATFORMS.find(p => p.id === pipeline.platform)?.icon || '🔧'}
                      </div>
                      <StatusBadge status={pipeline.status || 'active'} />
                    </div>

                    <div>
                      <h3 className="text-lg sm:text-xl font-black text-slate-800 group-hover:text-blue-600 transition-colors mb-1 truncate leading-tight">
                        {pipeline.name || 'Untitled Architecture'}
                      </h3>
                      <div className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-blue-500 uppercase tracking-widest">
                        <Box size={10} />
                        {pipeline.platform || 'General'}
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 leading-relaxed min-h-[32px] sm:min-h-[40px]">
                      {pipeline.description || 'Enterprise-grade CI/CD automation workflow.'}
                    </p>

                    <div className="flex flex-wrap gap-2 pt-2">
                      {pipeline.config && Object.entries(pipeline.config).slice(0, 2).map(([k, v]) => (
                        <span key={k} className="px-2 py-1 bg-slate-50 text-slate-400 text-[9px] font-bold uppercase rounded-md border border-slate-100 truncate max-w-[100px] sm:max-w-[120px]">
                          {k}: {String(v)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                      <Calendar size={12} />
                      {formatDate(pipeline.created_at || pipeline.createdAt)}
                    </div>
                    
                    <div className="flex gap-1 sm:gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/pipeline-builder', { state: { pipelineId: pipeline.id, editMode: true } }) }}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all active:scale-90"
                        title="Edit Workflow"
                      >
                        <Edit3 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setPipelineToDelete(pipeline); setShowDeleteModal(true); }}
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all active:scale-90"
                        title="Archive Architecture"
                      >
                        <Trash2 className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate('/pipeline-builder', { state: { pipeline } }) }}
                        className="ml-1 p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-90"
                        title="Launch Preview"
                      >
                        <Play className="w-4 h-4 sm:w-[18px] sm:h-[18px]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ⚠️ Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[10000] p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="text-red-500" size={32} />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">Delete Architecture?</h3>
              <p className="text-slate-500 font-medium mb-8">
                Are you sure you want to remove <span className="text-slate-900 font-bold">"{pipelineToDelete?.name}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg shadow-red-100"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPipelines;
