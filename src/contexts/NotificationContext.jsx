import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [simulationProgress, setSimulationProgress] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const [isRealtimeAvailable, setIsRealtimeAvailable] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('Offline');

  const addNotification = useCallback((notification) => {
    setNotifications(prev => [...prev, { ...notification, id: Date.now() }]);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const actions = {
    addNotification,
    removeNotification,
    clearNotifications,
    setSimulationProgress,
    setIsConnected,
    setIsRealtimeAvailable,
    setConnectionMessage
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    simulationProgress,
    isConnected,
    isRealtimeAvailable,
    connectionMessage,
    actions
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
