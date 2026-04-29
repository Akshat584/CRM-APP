import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menuItems = [
    { path: '/', icon: 'dashboard', label: 'Overview' },
    { path: '/contacts', icon: 'group', label: 'Contacts' },
    { path: '/pipeline', icon: 'payments', label: 'Pipeline' },
    { path: '/activities', icon: 'event_note', label: 'Activities' },
    { path: '/tasks', icon: 'checklist', label: 'Tasks' },
    { path: '/reports', icon: 'monitoring', label: 'Analytics' }
  ];

  return (
    <aside className="h-screen w-72 fixed left-0 top-0 z-50 bg-slate-50 flex flex-col py-10 px-6 gap-y-8 font-label tracking-tight border-none">
      <div className="flex items-center gap-3 px-2">
        <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
            account_balance
          </span>
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-primary tracking-tighter">Aurelius</h1>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold opacity-60">Executive CRM</p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-y-1 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-4 px-4 py-3 transition-all duration-300 group ${
                isActive 
                  ? 'text-primary font-bold bg-emerald-50 rounded-r-full scale-95 opacity-90' 
                  : 'text-slate-500 font-medium hover:text-emerald-800 hover:bg-emerald-50'
              }`}
            >
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                {item.icon}
              </span>
              <span className="text-sm tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-2">
        <button 
          onClick={() => navigate('/pipeline')}
          className="w-full bg-primary text-white py-4 px-6 rounded-xl font-bold text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create Deal
        </button>

        <div className="mt-8 flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high shrink-0">
            <div className="w-full h-full bg-primary flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-primary truncate">{user?.name}</span>
            <span className="text-xs text-slate-400 truncate">{user?.role || 'Executive'}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
