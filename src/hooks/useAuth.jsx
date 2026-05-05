import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

// Custom hook for authentication
export function useAuth() {
  const { user, loading, isAuthenticated, authReady, signOut: logout, profile, fetchProfile } = useAuthContext();
  return { user, loading, isAuthenticated, authReady, logout, profile, fetchProfile };
}

// Protected Route Component — DEPRECATED: use src/components/ProtectedRoute.jsx instead
// This export is kept for backward compatibility but delegates to the canonical version
export { default as ProtectedRoute } from '../components/ProtectedRoute';

// Auth Header Component with Enhanced Profile View
export function AuthHeader() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [userStats, setUserStats] = useState({
    pipelines: 0,
    successRate: 0,
    deployments: 0
  });

  // Fetch real user statistics
  const fetchUserStats = useCallback(async () => {
    if (!user) return;
    try {
      // 1. Try fetching from Supabase
      const { data: pipelines, error } = await supabase
        .from('pipelines')
        .select('*')
        .eq('user_id', user.id);
      
      // Handle missing table or other errors gracefully
      if (error) {
        const msg = error?.message || '';
        if (msg.includes('Could not find table') || msg.includes('does not exist') || error.code === '42P01') {
          // Silently ignore — table may not exist yet
        } else {
          console.warn('Pipeline stats fetch handled:', msg);
        }
      }
      
      const safePipelines = Array.isArray(pipelines) ? pipelines : [];
      
      const pipelineCount = safePipelines.length;
      const successfulPipelines = safePipelines.filter(p => p && (p.status === 'success' || p.status === 'active')).length;
      const successRate = pipelineCount > 0 ? Math.round((successfulPipelines / pipelineCount) * 100) : 100;
      
      const deploymentCount = safePipelines.reduce((total, pipeline) => {
        return total + ((pipeline && pipeline.runs) || 1);
      }, 0);
      
      setUserStats({
        pipelines: pipelineCount,
        successRate: successRate,
        deployments: deploymentCount
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

  // Refresh stats when dropdown is opened
  useEffect(() => {
    if (showProfile) {
      fetchUserStats().catch(err => console.warn('Stats fetch ignored:', err));
    }
  }, [showProfile, fetchUserStats]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback in case signOut fails
      window.location.href = '/';
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowProfile(!showProfile)}
        className="flex items-center gap-3 px-4 py-2 bg-surface-secondary rounded-xl border border-border hover:bg-surface-tertiary transition-all duration-200 group"
      >
        {user?.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt={user.user_metadata?.name || user.email} 
            className="w-8 h-8 rounded-full border-2 border-border group-hover:border-primary transition-colors"
          />
        ) : (
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-border group-hover:border-primary transition-colors">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        )}
        
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-text group-hover:text-primary transition-colors">
            {user?.user_metadata?.name || user?.email?.split('@')[0]}
          </p>
          <p className="text-xs text-text-muted">
            {user?.email}
          </p>
        </div>
        
        <motion.svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          animate={{ rotate: showProfile ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-text-muted group-hover:text-primary transition-colors"
        >
          <path d="M6 9l6 6 6-6" />
        </motion.svg>
      </button>

      {/* Profile Dropdown with Custom Background */}
      <AnimatePresence>
        {showProfile && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 overflow-hidden"
          >
            {/* Profile Header with Modern Gradient */}
            <div className="p-6 border-b border-white/10 bg-gradient-to-br from-blue-600 to-indigo-700">
              <div className="flex items-center gap-4">
                {user?.user_metadata?.avatar_url ? (
                  <img 
                    src={user.user_metadata.avatar_url} 
                    alt={user.user_metadata.name || user.email} 
                    className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-black text-2xl border-2 border-white/20 shadow-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                
                <div className="flex-1">
                  <h3 className="font-black text-white text-lg leading-tight">
                    {user?.user_metadata?.name || 'User'}
                  </h3>
                  <p className="text-xs text-white/70 truncate">
                    {user?.email}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <span className="text-[10px] text-emerald-100 font-bold uppercase tracking-wider">Active Now</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="p-6 grid grid-cols-3 gap-4 border-b border-gray-200 bg-white">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{userStats.pipelines}</div>
                <div className="text-xs text-gray-600">Pipelines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{userStats.successRate}%</div>
                <div className="text-xs text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{userStats.deployments}</div>
                <div className="text-xs text-gray-600">Deployments</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-2 bg-white">
              <button
                onClick={() => {
                  navigate('/my-pipelines');
                  setShowProfile(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">📦</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">My Pipelines</p>
                  <p className="text-xs text-gray-600">View and manage your pipelines</p>
                </div>
              </button>
              
              <button
                onClick={() => {
                  navigate('/dashboard');
                  setShowProfile(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">⚡</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Create New</p>
                  <p className="text-xs text-gray-600">Build a new pipeline</p>
                </div>
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/settings');
                  setShowProfile(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">⚙️</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Settings</p>
                  <p className="text-xs text-gray-600">Account preferences</p>
                </div>
              </button>
            </div>

            {/* Sign Out */}
            <div className="p-2 border-t border-gray-200 bg-white">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 rounded-lg transition-colors group"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-600">Sign Out</p>
                  <p className="text-xs text-gray-600">Sign out of your account</p>
                </div>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
