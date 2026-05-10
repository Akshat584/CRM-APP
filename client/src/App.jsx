import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider, useCRM } from './context/CRMContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CommandPalette from './components/CommandPalette';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import ActivityLog from './pages/ActivityLog';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';
import WhatsAppInbox from './pages/WhatsAppInbox';
import Campaigns from './pages/Campaigns';
import Automations from './pages/Automations';
import TeamSettings from './pages/TeamSettings';
import Properties from './pages/Properties';
import EmailInbox from './pages/EmailInbox';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-on-surface text-lg">
        Synchronizing...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-on-surface text-lg">
        Synchronizing...
      </div>
    );
  }

  return user ? <Navigate to="/" /> : children;
};

const MainLayout = ({ children, actionLabel, onActionClick }) => {
  const { executeGlobalAction, isSidebarCollapsed } = useCRM();

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    } else {
      executeGlobalAction();
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div 
        className={`flex-1 flex flex-col h-screen relative overflow-hidden transition-all duration-500 ease-in-out ${
          isSidebarCollapsed ? 'ml-24' : 'ml-72'
        }`}
      >
        <Topbar actionLabel={actionLabel} onActionClick={handleActionClick} />
        <div className="pt-20 flex-1 overflow-y-auto scrollbar-thin">
          <div className="p-12 max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <CommandPalette />}
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/properties" element={
        <ProtectedRoute>
          <MainLayout actionLabel="Add Listing">
            <Properties />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/emails" element={
        <ProtectedRoute>
          <MainLayout>
            <EmailInbox />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/contacts" element={
        <ProtectedRoute>
          <MainLayout actionLabel="Add Contact">
            <Contacts />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/pipeline" element={
        <ProtectedRoute>
          <MainLayout actionLabel="Create Deal">
            <Pipeline />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/activities" element={
        <ProtectedRoute>
          <MainLayout actionLabel="Log Activity">
            <ActivityLog />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <MainLayout actionLabel="Add Task">
            <Tasks />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <Reports />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/whatsapp" element={
        <ProtectedRoute>
          <MainLayout>
            <WhatsAppInbox />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/campaigns" element={
        <ProtectedRoute>
          <MainLayout>
            <Campaigns />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/automations" element={
        <ProtectedRoute>
          <MainLayout>
            <Automations />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/team" element={
        <ProtectedRoute>
          <MainLayout>
            <TeamSettings />
          </MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  </>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <ToastProvider>
            <CRMProvider>
              <AppRoutes />
            </CRMProvider>
          </ToastProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
