import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ selectedPlatform, collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard', section: 'main' },
    { id: 'builder', label: 'Build Pipeline', icon: '⚡', path: '/pipeline-builder', section: 'main' },
    { id: 'pipelines', label: 'My Pipelines', icon: '📦', path: '/my-pipelines', section: 'main' },
    { id: 'templates', label: 'Templates', icon: '☁️', path: '/templates', section: 'resources' },
    { id: 'settings', label: 'Settings', icon: '🛠️', path: '/settings', section: 'account' },
  ];

  const sections = [
    { key: 'main', label: 'Pipeline' },
    { key: 'resources', label: 'Resources' },
    { key: 'account', label: 'Account' },
  ];

  const isCollapsed = collapsed;

  return (
    <div className="flex flex-col h-full bg-[#1a1f2e] text-slate-400 font-inter">
      {/* Brand */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="PipeLinePro" className="w-9 h-9 rounded-lg flex-shrink-0" />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-lg font-black text-white tracking-tight whitespace-nowrap overflow-hidden"
              >
                PipeLine<span className="text-blue-400">Pro</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse Toggle */}
      <div className="px-3 py-2">
        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors text-xs"
        >
          <svg className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!isCollapsed && <span>Collapse</span>}
        </button>
      </div>

      {/* Menu Sections */}
      <nav className="flex-1 px-3 overflow-y-auto custom-scrollbar">
        {sections.map(section => {
          const sectionItems = menuItems.filter(i => i.section === section.key);
          if (sectionItems.length === 0) return null;

          return (
            <div key={section.key} className="mb-3">
              {!isCollapsed && (
                <p className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  {section.label}
                </p>
              )}
              <div className="space-y-0.5">
                {sectionItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative ${
                        isActive
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'hover:bg-white/5 hover:text-slate-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-500 rounded-r-full"
                        />
                      )}
                      <span className={`text-base flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                        {item.icon}
                      </span>
                      <AnimatePresence>
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="text-xs font-semibold whitespace-nowrap overflow-hidden"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Tooltip when collapsed */}
                      {isCollapsed && hoveredItem === item.id && (
                        <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-md shadow-lg whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Connection Status */}
      {!isCollapsed && (
        <div className="px-4 py-3">
          <div className="px-3 py-3 bg-white/5 rounded-xl border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">Active Node</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">
                {selectedPlatform === 'github' ? '🐙' : selectedPlatform === 'aws' ? '☁️' : '⚙️'}
              </span>
              <span className="text-[10px] font-semibold text-slate-300 capitalize">{selectedPlatform || 'No active host'}</span>
            </div>
          </div>
        </div>
      )}

      {/* User */}
      <div className="px-3 py-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" alt="Profile" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center font-bold text-white text-xs flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase() || 'P'}
            </div>
          )}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-[11px] font-semibold text-white truncate">{user?.user_metadata?.name || user?.email?.split('@')[0] || 'Member'}</p>
                <p className="text-[9px] text-slate-500 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
