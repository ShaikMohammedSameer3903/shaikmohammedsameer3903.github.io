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

  const initializeAuth = useCallback(async () => {
    if (initialized.current) return;
    initialized.current = true;
    
    console.log('[Auth] Initializing...');
    setStatus(AUTH_STATUS.LOADING);

    // Safety timeout: Ensure authReady is set even if Supabase hangs
    const timeoutId = setTimeout(() => {
      console.warn('[Auth] Initialization timed out, forcing authReady');
      setAuthReady(true);
    }, 5000);

    try {
      if (!supabase) {
        console.warn('[Auth] Supabase not available');
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
        setAuthReady(true);
        return;
      }

      // 1. Get initial session from Supabase ONLY
      const { data: { session: initialSession }, error } = await supabase.auth.getSession();
      
      if (error) throw error;

      if (initialSession) {
        console.log('[Auth] Session found');
        setSession(initialSession);
        setUser(initialSession.user);
        
        // 2. Fetch profile and connect socket
        await fetchProfile();
        websocketService.connect();
        
        setStatus(AUTH_STATUS.AUTHENTICATED);
      } else {
        console.log('[Auth] No session found');
        setSession(null);
        setUser(null);
        setProfile(null);
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
      }
    } catch (err) {
      console.error('[Auth] Initialization error:', err.message);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
    } finally {
      clearTimeout(timeoutId);
      console.log('[Auth] Initialization complete');
      setAuthReady(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile]);

  useEffect(() => {
    initializeAuth();

    if (!supabase) return;

    // Listen for auth changes from Supabase ONLY
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.log(`[Auth] Event: ${event}`, {
        hasSession: !!currentSession,
        userId: currentSession?.user?.id,
        userEmail: currentSession?.user?.email
      });
      
      if (currentSession) {
        console.log('[Auth] Session active, setting authenticated state');
        setSession(currentSession);
        setUser(currentSession.user);
        
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          console.log('[Auth] Processing sign-in event');
          await fetchProfile();
          websocketService.connect();
          setStatus(AUTH_STATUS.AUTHENTICATED);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('[Auth] Token refreshed');
          setStatus(AUTH_STATUS.AUTHENTICATED);
        }
      } else {
        console.log('[Auth] Session ended');
        setSession(null);
        setUser(null);
        setProfile(null);
        websocketService.disconnect();
        setStatus(AUTH_STATUS.UNAUTHENTICATED);
      }
      
      // Ensure authReady is set on state change if it wasn't already
      setAuthReady(true);
    });

    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchProfile]);

  const signOut = async () => {
    setStatus(AUTH_STATUS.LOADING);
    try {
      if (supabase) await supabase.auth.signOut();
      
      websocketService.disconnect();
      setUser(null);
      setSession(null);
      setProfile(null);
      setStatus(AUTH_STATUS.UNAUTHENTICATED);
      
      // Use hash-safe redirect
      window.location.hash = '#/login';
    } catch (error) {
      console.error('[Auth] Sign out error:', error);
      window.location.hash = '#/login';
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
