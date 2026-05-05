import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { PipelineProvider } from './contexts/PipelineContext';
import { ToastProvider } from './components/ToastProvider';
import { ProtectedRoute } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import PipelineBuilder from './pages/PipelineBuilder';
import MyPipelines from './pages/MyPipelines';
import Settings from './pages/AccountSettings';
import Login from './pages/LoginPage';
import Register from './pages/Register';

function App() {
  return (
    <ToastProvider>
      <PipelineProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                      <Header />
                      <Dashboard />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              <Route path="/templates" element={
                <ProtectedRoute>
                  <Templates />
                </ProtectedRoute>
              } />
              
              <Route path="/pipeline-builder" element={
                <ProtectedRoute>
                  <PipelineBuilder />
                </ProtectedRoute>
              } />
              
              <Route path="/my-pipelines" element={
                <ProtectedRoute>
                  <MyPipelines />
                </ProtectedRoute>
              } />
              
              <Route path="/settings" element={
                <ProtectedRoute>
                  <div className="flex h-screen bg-[#f9fafb] overflow-hidden">
                    <Sidebar />
                    <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                      <Header />
                      <Settings />
                    </div>
                  </div>
                </ProtectedRoute>
              } />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </PipelineProvider>
    </ToastProvider>
  );
}

export default App;
