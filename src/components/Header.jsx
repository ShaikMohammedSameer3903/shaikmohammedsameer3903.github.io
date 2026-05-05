import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthHeader } from '../hooks/useAuth.jsx';
import { usePipeline } from '../contexts/PipelineContext.jsx';
import { templates } from '../data/templates';
import NotificationBell from './NotificationBell';

const Header = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { loadTemplate } = usePipeline();
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const safeTemplates = Array.isArray(templates) ? templates : [];
      const filtered = safeTemplates.filter(t => 
        t && (
          (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.platform || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.description || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectTemplate = (template) => {
    loadTemplate(template);
    setSearchText('');
    setShowSuggestions(false);
    // Navigate to pipeline builder to use the selected template
    navigate('/pipeline-builder');
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-xl border-b border-slate-100 shadow-sm"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="px-3 md:px-8 lg:px-12 h-14 md:h-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuToggle}
            className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search / Context */}
          <div ref={searchRef} className="relative hidden md:block">
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 px-5 py-2.5 rounded-2xl w-96 group focus-within:ring-2 focus-within:ring-violet-500/20 transition-all">
              <span className="text-slate-400 group-focus-within:text-violet-500">🔍</span>
              <input
                type="text"
                placeholder="Search pipelines..."
                value={searchTerm}
                onChange={(e) => setSearchText(e.target.value)}
                onFocus={() => searchTerm.trim().length > 1 && setShowSuggestions(true)}
                className="bg-transparent border-none focus:outline-none text-sm font-medium text-slate-600 placeholder:text-slate-400 w-full"
              />
              <span className="text-[10px] font-black text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-sm">⌘K</span>
            </div>

            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden py-2 z-50"
                >
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Suggested Templates</span>
                  </div>
                  {Array.isArray(suggestions) && suggestions.length > 0 ? (
                    suggestions.map(template => template && (
                      <button
                        key={template.id || Math.random()}
                        onClick={() => handleSelectTemplate(template)}
                        className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-sm group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
                          {(template.platform || '').toLowerCase() === 'github' ? '🐙' : (template.platform || '').toLowerCase() === 'aws' ? '☁️' : '🤖'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800">{template.name || 'Untitled Template'}</p>
                          <p className="text-[10px] text-slate-400 line-clamp-1">{template.description || 'No description available'}</p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-slate-400 font-medium">No templates found matching "{searchTerm}"</p>
                    </div>
                  )}
                  <div className="px-4 py-2 border-t border-slate-50 mt-1">
                    <button 
                      onClick={() => {
                        setShowSuggestions(false);
                        navigate('/templates');
                      }}
                      className="text-[10px] font-bold text-violet-500 hover:text-violet-600 uppercase tracking-wider w-full text-center"
                    >
                      View all templates
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Brand (Mobile only) */}
          <div className="flex md:hidden items-center gap-2">
            <img src="/logo.png" alt="PipeLinePro" className="w-8 h-8 rounded-lg" />
            <span className="text-base font-black text-slate-800 tracking-tight">PipeLine<span className="text-blue-600">Pro</span></span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">System Normal</span>
          </div>

          <NotificationBell />

          <div className="h-8 w-px bg-slate-100 hidden sm:block" />

          <AuthHeader />
        </div>
      </div>
    </header>
  );
};

export default Header;
