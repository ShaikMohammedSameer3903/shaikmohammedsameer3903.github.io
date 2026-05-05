import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import { 
  LayoutDashboard, 
  Layers, 
  History, 
  Settings,
  Plus
} from 'lucide-react';

function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Close sidebar on navigation (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const mobileNavItems = [
    { id: 'dashboard', label: 'Build', icon: LayoutDashboard, path: '/dashboard' },
    { id: 'pipelines', label: 'Pipelines', icon: History, path: '/my-pipelines' },
    { id: 'templates', label: 'Templates', icon: Layers, path: '/templates' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <div 
      className="h-screen flex bg-slate-50 overflow-hidden font-inter selection:bg-blue-100 selection:text-blue-900"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — Desktop: fixed, Mobile: slide-in drawer */}
      <motion.aside
        animate={{ width: sidebarCollapsed ? 80 : 280 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed md:static inset-y-0 left-0 z-50
          flex-shrink-0 bg-white border-r border-slate-200
          transform transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </motion.aside>

      {/* Main Content Area — SaaS Layout Structure */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Fixed Header */}
        <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-50/50">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-32 md:pb-8"
          >
            <Outlet />
          </motion.div>
        </main>

        {/* Mobile Floating Action Button (Quick New) */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate('/dashboard')}
          className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl shadow-blue-500/40 flex items-center justify-center z-40 border-4 border-white"
        >
          <Plus size={24} strokeWidth={3} />
        </motion.button>

        {/* Mobile Bottom Navigation (Glassmorphism) */}
        <nav className="md:hidden fixed bottom-4 left-4 right-4 bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl z-[100] overflow-hidden px-2 h-16 flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
          {mobileNavItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(item.path);
                }}
                className={`flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-2xl transition-all relative ${
                  isActive ? 'text-blue-600' : 'text-slate-400'
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-blue-50' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default Layout;
