import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { isSidebarCollapsed, toggleSidebar } = useCRM();

  const menuItems = [
    { path: '/', icon: 'dashboard', label: 'Overview' },
    { path: '/contacts', icon: 'group', label: 'Contacts' },
    { path: '/pipeline', icon: 'payments', label: 'Pipeline' },
    { path: '/activities', icon: 'event_note', label: 'Activities' },
    { path: '/tasks', icon: 'checklist', label: 'Tasks' },
    { path: '/whatsapp', icon: 'forum', label: 'WhatsApp' },
    { path: '/campaigns', icon: 'rocket_launch', label: 'Campaigns' },
    { path: '/automations', icon: 'precision_manufacturing', label: 'Automations' },
    { path: '/reports', icon: 'monitoring', label: 'Analytics' },
    { path: '/team', icon: 'settings_accessibility', label: 'Team' }
  ];

  return (
    <aside 
      className={`h-screen fixed left-0 top-0 z-50 bg-slate-50 flex flex-col py-6 transition-all duration-500 ease-in-out border-none shadow-xl shadow-emerald-900/5 ${
        isSidebarCollapsed ? 'w-24 px-4' : 'w-72 px-6'
      }`}
    >
      {/* Brand & Toggle */}
      <div className={`flex items-center mb-8 px-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
              account_balance
            </span>
          </div>
          {!isSidebarCollapsed && (
            <div className="animate-fadeIn">
              <h1 className="text-xl font-extrabold text-primary tracking-tighter leading-none">Aurelius</h1>
              <p className="text-[9px] uppercase tracking-widest text-slate-400 font-bold opacity-60">Real Estate CRM</p>
            </div>
          )}
        </div>
        {!isSidebarCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-2 hover:bg-emerald-100/50 rounded-lg text-slate-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">menu_open</span>
          </button>
        )}
      </div>

      {isSidebarCollapsed && (
        <button 
          onClick={toggleSidebar}
          className="mx-auto mb-8 p-2 hover:bg-emerald-100/50 rounded-lg text-slate-400 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-xl">menu</span>
        </button>
      )}

      {/* Navigation with Custom Scrollbar */}
      <nav className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/10 hover:scrollbar-thumb-primary/20 scrollbar-track-transparent">
        <div className="flex flex-col gap-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                title={isSidebarCollapsed ? item.label : ''}
                className={`flex items-center transition-all duration-300 group overflow-hidden ${
                  isSidebarCollapsed ? 'justify-center p-3' : 'gap-4 px-4 py-3'
                } ${
                  isActive 
                    ? 'text-primary font-bold bg-emerald-50 rounded-xl' 
                    : 'text-slate-500 font-medium hover:text-emerald-800 hover:bg-emerald-50 rounded-xl'
                }`}
              >
                <span className="material-symbols-outlined shrink-0" style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>
                  {item.icon}
                </span>
                {!isSidebarCollapsed && (
                  <span className="text-sm tracking-tight whitespace-nowrap animate-slideInSmall">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Footer Area */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <button 
          onClick={() => navigate('/pipeline')}
          title={isSidebarCollapsed ? 'Create Deal' : ''}
          className={`bg-primary text-white font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 flex items-center justify-center gap-2 hover:opacity-90 ${
            isSidebarCollapsed ? 'w-12 h-12 rounded-full mx-auto p-0' : 'w-full py-4 px-6 rounded-xl text-sm'
          }`}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          {!isSidebarCollapsed && <span className="whitespace-nowrap">Create Deal</span>}
        </button>

        <div className={`mt-8 flex items-center px-2 overflow-hidden ${isSidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-primary shrink-0 flex items-center justify-center text-white font-bold text-sm border-2 border-white shadow-sm">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??'}
          </div>
          {!isSidebarCollapsed && (
            <div className="flex flex-col min-w-0 animate-fadeIn">
              <span className="text-xs font-bold text-primary truncate leading-tight">{user?.name}</span>
              <span className="text-[10px] text-slate-400 truncate uppercase tracking-tighter">{user?.role || 'Executive'}</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
