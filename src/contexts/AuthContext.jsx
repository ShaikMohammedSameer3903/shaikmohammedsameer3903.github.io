import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../services/supabaseClient';
import websocketService from '../services/websocketService';
import apiClient from '../services/apiClient';

const AuthContext = createContext();

// Auth States
const AUTH_STATUS = {
  IDLE: 'IDLE',
  LOADING: 'LOADING',
  AUTHENTICATED: 'AUTHENTICATED',
  UNAUTHENTICATED: 'UNAUTHENTICATED',
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState(AUTH_STATUS.IDLE);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  
  const initialized = useRef(false);

  // Fetch profile via backend API
  const fetchProfile = useCallback(async () => {
    try {
      const response = await apiClient.get('/api/profile');
      if (response && response.success) {
        setProfile(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      console.warn('[Auth] Profile fetch failed:', err.message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initializeAuth = async () => {
      setStatus(AUTH_STATUS.LOADING);
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      
      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchProfile();
        websocketService.connect();
        setStatus(AUTH_STATUS.AUTHENTICATED);
      } else {
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
      }
      setAuthReady(true);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await fetchProfile();
          websocketService.connect();
        }
        setStatus(AUTH_STATUS.AUTHENTICATED);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        websocketService.disconnect();
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
      }
      setAuthReady(true);
    });

    return () => subscription?.unsubscribe();
  }, [fetchProfile]);

  const signOut = async () => {
    setStatus(AUTH_STATUS.LOADING);
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
      
      // Full cleanup
      websocketService.disconnect();
      setUser(null);
      setSession(null);
      setProfile(null);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      
      // Force hard reload to clear all states and navigate home
      window.location.href = '/';
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      window.location.href = '/';
    } finally {
      setAuthReady(true);
    }
  };

  const value = {
    user,
    session,
    profile,
    status,
    authReady,
    loading: status === AUTH_STATUS.LOADING || status === AUTH_STATUS.IDLE,
    isAuthenticated: status === AUTH_STATUS.AUTHENTICATED,
    signOut,
    refreshProfile: fetchProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
