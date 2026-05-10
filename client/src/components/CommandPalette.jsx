import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await apiClient.get('/search', { params: { q: query } });
        setResults(res.data.data || []);
        setSelectedIndex(0);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (item) => {
    setIsOpen(false);
    if (item.type === 'contact') navigate('/contacts');
    else if (item.type === 'deal') navigate('/pipeline');
    else if (item.type === 'whatsapp') navigate('/whatsapp');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden animate-slideInSmall border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
           <span className="material-symbols-outlined text-primary text-2xl">search</span>
           <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search the Ledger (Contacts, Deals, Conversations)..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-xl font-bold text-on-surface placeholder:text-slate-300"
           />
           <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
              <span className="text-[10px] font-black text-slate-400">ESC</span>
           </div>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-4 scrollbar-thin">
           {results.length > 0 ? (
              <div className="space-y-1">
                 {results.map((item, idx) => (
                    <div 
                       key={item.id}
                       onClick={() => handleSelect(item)}
                       onMouseEnter={() => setSelectedIndex(idx)}
                       className={`p-4 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                          idx === selectedIndex ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.01]' : 'hover:bg-slate-50'
                       }`}
                    >
                       <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                             idx === selectedIndex ? 'bg-white/20' : 'bg-slate-100 text-slate-400'
                          }`}>
                             <span className="material-symbols-outlined">
                                {item.type === 'contact' ? 'person' : item.type === 'deal' ? 'payments' : 'forum'}
                             </span>
                          </div>
                          <div>
                             <p className={`text-sm font-bold ${idx === selectedIndex ? 'text-white' : 'text-on-surface'}`}>{item.name}</p>
                             <p className={`text-[10px] font-medium uppercase tracking-widest ${idx === selectedIndex ? 'text-white/60' : 'text-slate-400'}`}>
                                {item.sub}
                             </p>
                          </div>
                       </div>
                       <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${
                          idx === selectedIndex ? 'bg-white/20 text-white' : 'bg-slate-50 text-slate-400'
                       }`}>
                          {item.type}
                       </span>
                    </div>
                 ))}
              </div>
           ) : query.trim() ? (
              <div className="py-20 text-center text-slate-300">
                 {loading ? (
                    <div className="animate-spin text-4xl">sync</div>
                 ) : (
                    <>
                       <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                       <p className="text-xs font-black uppercase tracking-widest">No matching records found in the Ledger</p>
                    </>
                 )}
              </div>
           ) : (
              <div className="p-8">
                 <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6">Suggested Actions</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:border-primary transition-all">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-lg">add</span>
                       </div>
                       <span className="text-xs font-bold text-on-surface">New Contact</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-4 group cursor-pointer hover:border-primary transition-all">
                       <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-primary shadow-sm">
                          <span className="material-symbols-outlined text-lg">bolt</span>
                       </div>
                       <span className="text-xs font-bold text-on-surface">New Automation</span>
                    </div>
                 </div>
              </div>
           )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center px-8">
           <div className="flex gap-6">
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm text-slate-300">keyboard_arrow_down</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase">Navigate</span>
              </div>
              <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-sm text-slate-300">keyboard_return</span>
                 <span className="text-[10px] font-black text-slate-400 uppercase">Select</span>
              </div>
           </div>
           <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Aurelius Command Palette</p>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
