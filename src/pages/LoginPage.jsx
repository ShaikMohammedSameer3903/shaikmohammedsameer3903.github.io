import React from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, isAuthenticated, authReady } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const lastSubmitTime = React.useRef(0);

  // Debounce helper to prevent rapid submissions
  const canSubmit = () => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    return !isSubmitting && !isLoading && timeSinceLastSubmit > 3000;
  };
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  });

  // Redirect authenticated users to dashboard ONLY when auth is ready
  React.useEffect(() => {
    if (authReady && !loading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      // Ensure we don't redirect back to login or root if we're already trying to go somewhere
      const target = (from === '/login' || from === '/') ? '/dashboard' : from;
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, loading, authReady, navigate, location.state]);

  if (loading || !authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    if (!canSubmit()) return;

    if (!supabase || !supabase.auth) {
      alert("Supabase not initialized");
      return;
    }

    lastSubmitTime.current = Date.now();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://pipeline-pro.tech/#/auth/callback'
        }
      });
      if (error) throw error;
      
    } catch (error) {
      console.error('AUTH ERROR:', error);
      let errorMessage = 'Failed to sign in with Google. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    if (!canSubmit()) return;

    if (!supabase || !supabase.auth) {
      alert("Supabase not initialized");
      return;
    }

    lastSubmitTime.current = Date.now();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'https://pipeline-pro.tech/#/auth/callback'
        }
      });
      if (error) throw error;
      
    } catch (error) {
      console.error('AUTH ERROR:', error);
      let errorMessage = 'Failed to sign in with GitHub. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    
    if (!canSubmit()) return;

    if (!supabase || !supabase.auth) {
      setError('Authentication is currently unavailable.');
      return;
    }

    lastSubmitTime.current = Date.now();
    setIsSubmitting(true);
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (error) {
        setError(error.message);
        return;
      }
      
      // AuthContext will handle the session state and redirect via useEffect
    } catch (error) {
      console.error('AUTH ERROR:', error);
      setError('Failed to sign in. Please try again later.');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 font-inter">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-premium shadow-primary/20">
              <span className="text-white text-xl font-bold">⚡</span>
            </div>
            <h1 className="text-2xl font-bold text-text tracking-tight">
              PipeLine<span className="text-primary">Pro</span>
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-text mb-2">
            Welcome back
          </h2>
          <p className="text-text-secondary">
            Sign in to access your CI/CD pipeline workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-surface rounded-2xl shadow-card-lg p-8 border border-border">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-error text-lg">⚠️</span>
                <p className="text-sm font-medium text-error">{error}</p>
              </div>
            </div>
          )}

          {/* GitHub Sign In Button */}
          <button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#24292e] text-white rounded-xl hover:bg-[#2f363d] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="font-semibold transition-colors">
                  Continue with GitHub
                </span>
              </>
            )}
          </button>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="font-semibold text-text group-hover:text-primary transition-colors">
                  Continue with Google
                </span>
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border"></div>
            <span className="text-xs text-text-muted font-medium uppercase tracking-wider">OR</span>
            <div className="flex-1 h-px bg-border"></div>
          </div>

          {/* Alternative Options */}
          <div className="space-y-3">
            {!showEmailForm ? (
              <button 
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-surface-secondary border border-border rounded-xl hover:bg-surface-tertiary transition-all duration-200"
              >
                <span className="text-lg">📧</span>
                <span className="font-medium text-text-secondary">Continue with Email</span>
              </button>
            ) : (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                    Email address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-text placeholder-text-muted"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-text mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 text-text placeholder-text-muted"
                    placeholder="Enter your password"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="font-semibold">Sign In</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-full px-6 py-2 text-sm text-text-muted hover:text-text transition-colors"
                >
                  ← Back to OAuth options
                </button>
              </form>
            )}
            <button 
              disabled
              title="SSO coming soon"
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-surface-secondary border border-border rounded-xl opacity-50 cursor-not-allowed transition-all duration-200"
            >
              <span className="text-lg">🔑</span>
              <span className="font-medium text-text-secondary">Continue with SSO <span className="text-xs text-text-muted">(Coming Soon)</span></span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="mb-4">
            <p className="text-sm text-text-muted">
              Don't have an account?{' '}
              <a 
                href="/register" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
                className="text-primary hover:underline font-medium"
              >
                Create account
              </a>
            </p>
          </div>
          <p className="text-sm text-text-muted">
            By signing in, you agree to our{' '}
            <a href="#" className="text-primary hover:underline font-medium">Terms</a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
