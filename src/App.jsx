import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './services/supabaseClient';
import './polyfills'; 
import './utils/errorHandler'; 
import { PipelineProvider } from './contexts/PipelineContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './components/ToastProvider';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Templates = lazy(() => import('./pages/Templates'));
const PipelineBuilder = lazy(() => import('./pages/PipelineBuilder'));
const MyPipelines = lazy(() => import('./pages/MyPipelines'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Register = lazy(() => import('./pages/Register'));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3" />
      <p className="text-sm text-gray-500 font-medium">Loading...</p>
    </div>
  </div>
);

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <PipelineProvider>
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Public routes only accessible when logged out */}
                    <Route 
                      path="/" 
                      element={session ? <Navigate to="/dashboard" replace /> : <LandingPage />} 
                    />
                    <Route 
                      path="/login" 
                      element={session ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
                    />
                    <Route 
                      path="/register" 
                      element={session ? <Navigate to="/dashboard" replace /> : <Register />} 
                    />

                    {/* Protected routes only accessible when logged in */}
                    <Route 
                      path="/dashboard" 
                      element={session ? <Layout><Dashboard /></Layout> : <Navigate to="/login" replace />} 
                    />
                    <Route 
                      path="/templates" 
                      element={session ? <Layout><Templates /></Layout> : <Navigate to="/login" replace />} 
                    />
                    <Route 
                      path="/pipeline-builder" 
                      element={session ? <Layout><PipelineBuilder /></Layout> : <Navigate to="/login" replace />} 
                    />
                    <Route 
                      path="/my-pipelines" 
                      element={session ? <Layout><MyPipelines /></Layout> : <Navigate to="/login" replace />} 
                    />
                    <Route 
                      path="/settings" 
                      element={session ? <Layout><AccountSettings /></Layout> : <Navigate to="/login" replace />} 
                    />

                    {/* Catch-all */}
                    <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </PipelineProvider>
          </NotificationProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
