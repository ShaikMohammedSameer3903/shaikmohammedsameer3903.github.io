import React from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const [formData, setFormData] = React.useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitCount, setSubmitCount] = React.useState(0);
  const lastSubmitTime = React.useRef(0);

  // Debounce helper to prevent rapid submissions
  const canSubmit = () => {
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime.current;
    return !isSubmitting && !isLoading && timeSinceLastSubmit > 5000; // 5 second cooldown
  };

  const handleGoogleSignUp = async () => {
    if (!supabase) {
      alert("Supabase not initialized");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://pipeline-pro.tech/auth/callback'
        }
      });

      if (error) throw error;
    } catch (error) {
      setError('Failed to sign up with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubSignUp = async () => {
    if (!supabase) {
      alert("Supabase not initialized");
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: 'https://pipeline-pro.tech/auth/callback'
        }
      });

      if (error) throw error;
    } catch (error) {
      setError('Failed to sign up with GitHub. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    
    if (!canSubmit()) return;

    lastSubmitTime.current = Date.now();
    setSubmitCount(prev => prev + 1);
    setIsSubmitting(true);
    setIsLoading(true);
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    // Password strength validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }

    try {
      if (!supabase) {
        setError('Authentication service unavailable. Please try again later.');
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: 'https://pipeline-pro.tech/auth/callback'
        }
      });

      if (error) {
        // Handle specific errors including rate limit
        if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
          setError('Too many signup attempts. Please wait a few minutes before trying again or check if you already have an account.');
        } else if (error.message?.includes('User already registered')) {
          setError('An account with this email already exists. Please try logging in instead.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (error.message?.includes('invalid')) {
          setError('Invalid email address. Please use a valid email format.');
        } else if (error.message?.includes('Password')) {
          setError('Password is too weak. Please use a stronger password (at least 6 characters).');
        } else {
          setError(`Registration failed: ${error.message}`);
        }
        return;
      }
      
      if (data.user) {
        if (data.session) {
          setSuccess('Account created successfully! Redirecting to dashboard...');
          // Navigate immediately since we have a session
          navigate('/dashboard', { replace: true });
        } else if (data.user.identities?.length === 0) {
          // User already exists (even if error didn't catch it)
          setError('An account with this email already exists. Please try logging in.');
          setTimeout(() => navigate('/login', { replace: true }), 3000);
        } else {
          setSuccess('✅ Account created! Please check your email (including spam folder) to confirm your account.');
          setTimeout(() => {
            navigate('/login', { replace: true });
          }, 5000);
        }
      } else {
        setSuccess('Account creation completed. Please check your email for confirmation.');
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    } catch (error) {
      setError('Failed to create account. Please try again later.');
    } finally {
      setIsLoading(false);
      // Reset submitting state after a delay to prevent rapid retries
      setTimeout(() => {
        setIsSubmitting(false);
      }, 10000); // Increased to 10 seconds to prevent rate limit
    }
  };

  // No auto-redirect on mount — only redirect after explicit registration success (handled in handleSubmit)
  // If user is already logged in, they can navigate to dashboard manually

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
            Create your account
          </h2>
          <p className="text-text-secondary">
            Start building powerful CI/CD pipelines today
          </p>
        </div>

        {/* Register Card */}
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

          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-success/10 border border-success/20 rounded-xl">
              <div className="flex items-center gap-3">
                <span className="text-success text-lg">✅</span>
                <p className="text-sm font-medium text-success">{success}</p>
              </div>
            </div>
          )}

          {/* GitHub Sign Up Button */}
          <button
            onClick={handleGitHubSignUp}
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
                  Sign up with GitHub
                </span>
              </>
            )}
          </button>

          {/* Google Sign Up Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface border-2 border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed mb-3"
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
                  Sign up with Google
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

          {/* Email Sign Up Form */}
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 bg-surface-secondary border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-text-muted">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
          <p className="text-sm text-text-muted mt-2">
            By signing up, you agree to our{' '}
            <a href="#" className="text-primary hover:underline font-medium">Terms</a>{' '}
            and{' '}
            <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
