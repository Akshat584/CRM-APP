import React, { createContext, useState, useContext } from 'react';

const CRMContext = createContext();

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within CRMProvider');
  }
  return context;
};

export const CRMProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [globalAction, setGlobalAction] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const refreshData = () => setRefreshTrigger(prev => prev + 1);

  const executeGlobalAction = () => {
    if (globalAction) {
      globalAction();
    }
  };

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  const value = {
    refreshTrigger,
    refreshData,
    setGlobalAction,
    executeGlobalAction,
    isSidebarCollapsed,
    toggleSidebar
  };

  return <CRMContext.Provider value={value}>{children}</CRMContext.Provider>;
};