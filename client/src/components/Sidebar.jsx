import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/', icon: '📊', label: 'Dashboard' },
    { path: '/contacts', icon: '👥', label: 'Contacts' },
    { path: '/pipeline', icon: '📈', label: 'Sales Pipeline' },
    { path: '/activities', icon: '📝', label: 'Activity Log' },
    { path: '/tasks', icon: '✅', label: 'Tasks' },
    { path: '/reports', icon: '📊', label: 'Reports' }
  ];

  return (
    <div style={{
      width: '220px',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-default)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      height: '100vh',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{
          fontFamily: 'Syne, sans-serif',
          fontWeight: '800',
          fontSize: '24px',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          CRM Pro
        </div>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          marginTop: '4px'
        }}>
          Customer Management
        </div>
      </div>

      <nav style={{ flex: 1, padding: '16px 8px' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                cursor: 'pointer',
                borderRadius: '8px',
                margin: '4px 8px',
                transition: 'all 0.15s ease',
                background: isActive ? 'var(--bg-surface2)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--bg-surface2)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }
              }}
            >
              <span style={{ marginRight: '12px', fontSize: '18px' }}>
                {item.icon}
              </span>
              <span style={{ fontSize: '14px', fontWeight: '500' }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '16px', borderTop: '1px solid var(--border-default)' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--accent-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '700',
            marginRight: '12px'
          }}>
            {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
              {user?.name}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;