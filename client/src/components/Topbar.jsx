import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
import Button from './Button';
import { useNotifications } from '../hooks/useNotifications';
import { formatDate } from '../utils/format';

const Topbar = ({ actionLabel, onActionClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  
  const { data: notifications, loading: loadingNotifications } = useNotifications();
  const notificationRef = useRef(null);
  const calendarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await apiClient.get('/search', { params: { q: search } });
        setResults(Array.isArray(res.data.data) ? res.data.data : []);
        setShowResults(true);
      } catch (err) {
        console.error(err);
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-18rem)] h-20 glass-effect flex items-center justify-between px-12 z-40 shadow-sm shadow-emerald-900/5 font-label text-sm uppercase tracking-widest">
      <div className="flex-1 flex items-center max-w-xl">
        <div className="w-full relative group">
          <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            className="w-full bg-transparent border-none focus:ring-0 pl-8 text-sm font-label uppercase tracking-widest text-on-surface placeholder:text-slate-300"
            placeholder="SEARCH THE LEDGER..." 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setShowResults(true)}
          />
          <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-500"></div>

          {showResults && results.length > 0 && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-xl shadow-2xl p-4 normal-case tracking-normal z-50">
              {results.map(r => (
                <div 
                  key={r.id} 
                  onClick={() => {
                    setSearch('');
                    setShowResults(false);
                    navigate(r.type === 'contact' ? '/contacts' : '/pipeline');
                  }}
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div>
                    <div className="text-sm font-bold text-on-surface">{r.name}</div>
                    <div className="text-[10px] text-slate-400">{r.sub}</div>
                  </div>
                  <span className="text-[9px] font-bold bg-slate-100 px-2 py-0.5 rounded uppercase">{r.type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        <div className="flex items-center gap-6 text-slate-400">
          <div className="relative" ref={notificationRef}>
            <button 
              className={`hover:text-primary transition-all relative ${showNotifications ? 'text-primary' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="material-symbols-outlined">notifications</span>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-white"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute top-10 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-50 z-50 normal-case tracking-normal">
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Ledger Alerts</span>
                  <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">{notifications.length} NEW</span>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-thin">
                  {notifications.length > 0 ? (
                    notifications.map(n => (
                      <div key={n.id} className="p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors">
                        <div className="flex gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${n.type === 'task' ? 'bg-emerald-50 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
                            {n.type === 'task' ? '✓' : '$'}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-on-surface">{n.title}</div>
                            <div className="text-xs text-on-surface-variant mb-1">{n.body}</div>
                            <div className="text-[9px] font-black uppercase text-slate-300 tracking-tighter">{formatDate(n.date)}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center">
                      <div className="text-4xl opacity-20 mb-2">🎉</div>
                      <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Horizon Clear</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={calendarRef}>
            <button 
              className={`hover:text-primary transition-all ${showCalendar ? 'text-primary' : ''}`}
              onClick={() => setShowCalendar(!showCalendar)}
            >
              <span className="material-symbols-outlined">calendar_today</span>
            </button>
            {showCalendar && (
              <div className="absolute top-10 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-50 z-50 normal-case tracking-normal">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Deadline Ledger</span>
                </div>
                <div className="p-6">
                   <div className="space-y-6">
                      {notifications.slice(0, 5).map(n => (
                        <div key={n.id} className="flex items-center gap-4">
                           <div className="flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-slate-50 text-primary">
                              <span className="text-[8px] font-black uppercase tracking-tighter leading-none">{new Date(n.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                              <span className="text-sm font-bold leading-none">{new Date(n.date).getDate()}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-on-surface truncate">{n.body}</div>
                              <div className="text-[9px] font-black uppercase text-slate-300">{n.type} DEADLINE</div>
                           </div>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                         <div className="text-center py-8">
                            <p className="text-[10px] font-black uppercase text-slate-300 tracking-widest">No upcoming milestones</p>
                         </div>
                      )}
                   </div>
                </div>
              </div>
            )}
          </div>
          
          <button className="hover:text-primary transition-all">
            <span className="material-symbols-outlined">chat_bubble_outline</span>
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-100"></div>
        
        <div className="flex items-center gap-4">
          {actionLabel && (
            <Button variant="primary" size="sm" onClick={onActionClick}>
              {actionLabel}
            </Button>
          )}
          <span className="text-sm font-label uppercase tracking-widest text-primary font-extrabold hidden lg:block">The Ledger</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

