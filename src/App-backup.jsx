import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MyPipelines from './pages/MyPipelines';
import Templates from './pages/Templates';
import PipelineBuilder from './pages/PipelineBuilder';
import AccountSettings from './pages/AccountSettings';
import { ProtectedRoute } from './hooks/useAuth.jsx';
import { ToastProvider } from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-pipelines" 
            element={
              <ProtectedRoute>
                <MyPipelines />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/templates" 
            element={
              <ProtectedRoute>
                <Templates />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pipeline-builder" 
            element={
              <ProtectedRoute>
                <PipelineBuilder />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <AccountSettings />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}

export default App;
