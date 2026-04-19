import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CRMProvider, useCRM } from './context/CRMContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Pipeline from './pages/Pipeline';
import ActivityLog from './pages/ActivityLog';
import Tasks from './pages/Tasks';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'var(--bg-page)',
        color: 'var(--text-primary)',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  return user ? <Navigate to="/" /> : children;
};

const MainLayout = ({ children, actionLabel, onActionClick }) => {
  const { logout } = useAuth();
  const { executeGlobalAction } = useCRM();

  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick();
    } else {
      executeGlobalAction();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar actionLabel={actionLabel} onActionClick={handleActionClick} />
        <div style={{
          marginTop: '56px',
          padding: '24px',
          height: 'calc(100vh - 56px)',
          overflowY: 'auto'
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
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
      <Route path="/contacts" element={
        <ProtectedRoute>
          <MainLayout actionLabel="+ Add Contact">
            <Contacts />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/pipeline" element={
        <ProtectedRoute>
          <MainLayout actionLabel="+ Add Deal">
            <Pipeline />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/activities" element={
        <ProtectedRoute>
          <MainLayout actionLabel="+ Log Activity">
            <ActivityLog />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/tasks" element={
        <ProtectedRoute>
          <MainLayout actionLabel="+ Add Task">
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
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <div style={{
        '--bg-page': '#0a0b0f',
        '--bg-surface': '#111318',
        '--bg-surface2': '#181b22',
        '--bg-surface3': '#1e2330',
        '--border-default': '#232736',
        '--border-emphasis': '#2d3347',
        '--accent-blue': '#4f8ef7',
        '--accent-purple': '#a78bfa',
        '--text-primary': '#e8eaf0',
        '--text-secondary': '#8b90a7',
        '--text-muted': '#545872',
        '--color-success': '#10b981',
        '--color-warning': '#f59e0b',
        '--color-danger': '#f87171',
        '--color-orange': '#f97316'
      }}>
        <AuthProvider>
          <ToastProvider>
            <CRMProvider>
              <AppRoutes />
            </CRMProvider>
          </ToastProvider>
        </AuthProvider>
      </div>
    </Router>
  );
};

export default App;