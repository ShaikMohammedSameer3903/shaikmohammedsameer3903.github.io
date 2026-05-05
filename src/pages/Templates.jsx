import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import TemplateCard from '../components/TemplateCard';
import PreviewModal from '../components/PreviewModal';
import { useToast } from '../components/ToastProvider';
import { usePipeline } from '../contexts/PipelineContext';
import { 
  templates, 
  PLATFORMS, 
  CATEGORIES, 
  DIFFICULTIES, 
  searchTemplates 
} from '../data/templates';
import { FaSearch, FaFilter, FaTimes, FaLayerGroup, FaArrowRight } from 'react-icons/fa';

const Templates = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  
  let pipelineContext;
  try {
    pipelineContext = usePipeline();
  } catch (error) {
    pipelineContext = { loadTemplate: null, actions: null };
  }
  
  const { loadTemplate, actions } = pipelineContext;

  // 7-day TTL cleanup logic on mount
  React.useEffect(() => {
    const STORAGE_KEY = 'pipeline_builder_state';
    const TTL_DAYS = 7;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const { timestamp } = JSON.parse(stored);
        const ageInDays = (Date.now() - timestamp) / (1000 * 60 * 60 * 24);
        if (ageInDays > TTL_DAYS) {
          localStorage.removeItem(STORAGE_KEY);
          // Cleanup old data
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Filter templates based on search and filters
  const filteredTemplates = useMemo(() => {
    let filtered = templates;

    // Apply search query first
    if (searchQuery && searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = templates.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.platform.toLowerCase().includes(query) ||
        template.category.toLowerCase().includes(query) ||
        template.difficulty.toLowerCase().includes(query) ||
        template.requirements.some(req => req.toLowerCase().includes(query))
      );
    }

    // Apply platform filter
    if (selectedPlatform !== 'all') {
      filtered = filtered.filter(t => t.platform === selectedPlatform);
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(t => t.difficulty === selectedDifficulty);
    }

    return filtered;
  }, [searchQuery, selectedPlatform, selectedCategory, selectedDifficulty]);

  const handlePreview = (template) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleUseTemplate = async (template, options = {}) => {
    // Check if pipeline context is available
    if (!loadTemplate || !actions) {
      // Pipeline context not available
      addToast('Pipeline context not available. Please refresh the page.', 'error');
      return;
    }
    
    try {
      // Reset current state first
      actions.resetState();
      
      // Load template into global state
      loadTemplate(template);
      
      // If AI mode, we'll signal it through the navigation state
      navigate('/dashboard', { 
        state: { 
          templateId: template.id,
          fromTemplates: true,
          aiMode: options.aiMode || false,
          autoTriggerAI: options.aiMode || false
        } 
      });
      
      addToast(options.aiMode ? `AI Smart Mode active for "${template.name}"` : `Template "${template.name}" loaded successfully`, 'success');
    } catch (error) {
      // Error loading template
      addToast('Failed to load template: ' + error.message, 'error');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedPlatform('all');
    setSelectedCategory('all');
    setSelectedDifficulty('all');
  };

  return (
    <>
      <div className="w-full space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                <FaLayerGroup className="text-xl" />
              </div>
              <h4 className="text-blue-600 font-black uppercase tracking-widest text-xs">Marketplace</h4>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Cloud Pipeline <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Templates</span>
            </h1>
            <p className="text-gray-500 text-lg font-medium max-w-2xl">
              Choose from 30+ production-ready CI/CD configurations optimized for high-performance DevOps teams.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-2xl font-black text-gray-900">{filteredTemplates.length}</p>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Available Blueprints</p>
            </div>
          </div>
        </div>

            {/* Modern Search & Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
          <div className="flex flex-col lg:flex-row gap-2">
            {/* Search Bar */}
            <div className="flex-1 relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, platform, or description..."
                className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:ring-0 text-gray-900 font-bold placeholder-gray-400"
              />
            </div>

            {/* Filter Controls */}
            <div className="flex items-center gap-2 p-2">
              <div className="h-10 w-px bg-gray-100 mx-2 hidden lg:block" />
              
              <select
                value={selectedPlatform}
                onChange={(e) => setSelectedPlatform(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="all">All Platforms</option>
                {PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
              </select>

              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="px-4 py-3 bg-gray-50 border-none rounded-xl font-bold text-sm text-gray-700 focus:ring-2 focus:ring-blue-600 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="all">All Levels</option>
                {DIFFICULTIES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>

              {(searchQuery || selectedPlatform !== 'all' || selectedDifficulty !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Clear Filters"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        {filteredTemplates.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20 bg-white rounded-xl p-8"
          >
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="text-3xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No templates found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: index * 0.1 }}
                  layout
                >
                  <TemplateCard 
                    template={template} 
                    onPreview={handlePreview}
                    onUseTemplate={handleUseTemplate}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* AI Builder CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white text-center relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity" />
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <FaArrowRight className="text-2xl" />
            </div>
            <h2 className="text-3xl font-black mb-4">Can't find what you need?</h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Let our AI-powered builder create a custom pipeline tailored to your specific requirements and infrastructure.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:-translate-y-1 shadow-xl"
            >
              Try AI Builder
            </button>
          </div>
        </motion.div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreviewModal && selectedTemplate && (
          <PreviewModal 
            template={selectedTemplate}
            onClose={() => setShowPreviewModal(false)}
            onUseTemplate={handleUseTemplate}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Templates;
