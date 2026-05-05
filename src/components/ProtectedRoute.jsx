import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { loading, isAuthenticated, authReady } = useAuth();
  const location = useLocation();

  // Wait for auth to be ready before making any decisions
  if (!authReady || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-600 mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-black text-blue-600">PRO</span>
            </div>
          </div>
          <p className="text-slate-500 font-semibold text-sm">Authenticating...</p>
          <p className="text-slate-400 text-xs mt-1">Securing your session</p>
        </div>
      </div>
    );
  }

  // Only redirect if auth is ready and user is not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
