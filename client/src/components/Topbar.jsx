import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';
import { useLocation } from 'react-router-dom';
import Button from './Button';

const Topbar = ({ actionLabel, onActionClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get('/search', { params: { q: search } });
        setResults(res.data.data);
        setShowResults(true);
      } catch (err) {
        console.error(err);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Dashboard',
      '/contacts': 'Contacts',
      '/pipeline': 'Sales Pipeline',
      '/activities': 'Activity Log',
      '/tasks': 'Tasks',
      '/reports': 'Reports & Analytics'
    };
    return titles[path] || 'CRM';
  };

  return (
    <div style={{
      height: '56px',
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-default)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      position: 'fixed',
      left: '220px',
      right: 0,
      top: 0,
      zIndex: 99
    }}>
      <h1 style={{
        fontFamily: 'Syne, sans-serif',
        fontWeight: '700',
        fontSize: '16px',
        color: 'var(--text-primary)',
        margin: 0
      }}>
        {getPageTitle()}
      </h1>

      <div style={{ position: 'relative', flex: 1, maxWidth: '400px', margin: '0 24px' }}>
        <input 
          type="text" 
          placeholder="Global search contacts, deals..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setShowResults(true)}
          style={{
            width: '100%',
            padding: '8px 12px 8px 36px',
            background: 'var(--bg-surface2)',
            border: '1px solid var(--border-default)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            fontSize: '13px'
          }}
        />
        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
        
        {showResults && results.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '42px',
            left: 0,
            right: 0,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '8px'
          }}>
            {results.map(r => (
              <div 
                key={r.id} 
                onClick={() => {
                  setSearch('');
                  setShowResults(false);
                  navigate(r.type === 'contact' ? '/contacts' : '/pipeline');
                }}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-surface2)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '500' }}>{r.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{r.sub}</div>
                </div>
                <span style={{ fontSize: '10px', padding: '2px 6px', background: 'var(--bg-surface3)', borderRadius: '4px', textTransform: 'uppercase' }}>{r.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {actionLabel && (
        <Button onClick={onActionClick}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Topbar;