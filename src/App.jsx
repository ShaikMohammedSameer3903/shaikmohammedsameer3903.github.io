import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './polyfills'; // Load polyfills before other modules
import './utils/errorHandler'; // Initialize global error handler
import { PipelineProvider } from './contexts/PipelineContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ToastProvider } from './components/ToastProvider';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import SessionManager from './components/SessionManager';
import AppWrapper from './components/AppWrapper';

// Lazy load pages with error handling for code splitting
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
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <NotificationProvider>
            <PipelineProvider>
              <SessionManager />
              <Router>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route element={<AppWrapper />}>
                      {/* Public Routes — always accessible, no redirect */}
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<Register />} />
                      
                      {/* Simplified Callback Route */}
                      <Route path="/auth/callback" element={<div />} />

                      {/* Protected Routes — redirect to /login only if not authenticated */}
                      <Route element={<ProtectedRoute />}>
                        <Route element={<Layout />}>
                          <Route path="/dashboard" element={<ErrorBoundary name="Dashboard"><Dashboard /></ErrorBoundary>} />
                          <Route path="/templates" element={<ErrorBoundary name="Templates"><Templates /></ErrorBoundary>} />
                          <Route path="/pipeline-builder" element={<ErrorBoundary name="PipelineBuilder"><PipelineBuilder /></ErrorBoundary>} />
                          <Route path="/my-pipelines" element={<ErrorBoundary name="MyPipelines"><MyPipelines /></ErrorBoundary>} />
                          <Route path="/settings" element={<ErrorBoundary name="Settings"><AccountSettings /></ErrorBoundary>} />
                        </Route>
                      </Route>
                    </Route>

                    {/* Catch-all → redirect unknown routes to landing */}
                    <Route path="*" element={<Navigate to="/" replace />} />
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
