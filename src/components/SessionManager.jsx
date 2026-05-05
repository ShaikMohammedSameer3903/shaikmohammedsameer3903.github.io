import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const SessionManager = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Session management logic
    console.log('SessionManager: User authenticated:', isAuthenticated);
  }, [isAuthenticated]);

  return null; // This component doesn't render anything
};

export default SessionManager;
