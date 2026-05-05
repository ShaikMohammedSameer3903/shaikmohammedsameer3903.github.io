import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authReady } = useAuth();

  useEffect(() => {
    // Wait for AuthContext to process the OAuth session
    if (!authReady) return;

    if (isAuthenticated) {
      console.log('[OAuthCallback] Session established, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    } else {
      console.warn('[OAuthCallback] No session found after OAuth, redirecting to login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, authReady, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
        <p className="text-slate-500 font-semibold text-sm">Completing authentication...</p>
      </div>
    </div>
  );
};

export default OAuthCallback;
