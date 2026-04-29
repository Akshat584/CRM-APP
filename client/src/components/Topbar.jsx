import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/apiClient';
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
          <button className="hover:text-primary transition-all">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:text-primary transition-all">
            <span className="material-symbols-outlined">calendar_today</span>
          </button>
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
