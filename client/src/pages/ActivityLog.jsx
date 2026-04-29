import React, { useState, useEffect } from 'react';
import { useActivities, useCreateActivity } from '../hooks/useActivities';
import { useContacts } from '../hooks/useContacts';
import { useDeals } from '../hooks/useDeals';
import { useCRM } from '../context/CRMContext';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { getRelativeTime } from '../utils/format';

const ActivityLog = () => {
  const [typeFilter, setTypeFilter] = useState('All');
  const { refreshTrigger, setGlobalAction, refreshData } = useCRM();
  const { data: activities, loading, refetch } = useActivities({
    type: typeFilter === 'All' ? undefined : typeFilter.toLowerCase(),
    trigger: refreshTrigger
  });
  const { data: contacts } = useContacts({ limit: 100 });
  const { createActivity } = useCreateActivity();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ type: 'call', subject: '', body: '', contact_id: '', deal_id: '' });

  useEffect(() => {
    setGlobalAction(() => () => {
      setFormData({ type: 'call', subject: '', body: '', contact_id: '', deal_id: '' });
      setShowCreateModal(true);
    });
    return () => setGlobalAction(null);
  }, [setGlobalAction]);

  useEffect(() => { refetch(); }, [refreshTrigger]);

  const activityTypes = ['All', 'Call', 'Email', 'Meeting', 'Note', 'Task'];

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Audit Trail</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Ledger.</h2>
          <div className="flex gap-4">
             <Button variant="primary" onClick={() => setShowCreateModal(true)}>Log Interaction</Button>
          </div>
        </div>
      </section>

      <div className="flex gap-3 mb-12 overflow-x-auto pb-4 scrollbar-hide">
        {activityTypes.map((filter) => (
          <button
            key={filter}
            onClick={() => setTypeFilter(filter)}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
              typeFilter === filter ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="bg-surface-container-lowest p-10 rounded-3xl editorial-shadow relative">
        <h3 className="text-xs font-black tracking-widest uppercase mb-12 opacity-60">Interaction Sequence</h3>
        
        <div className="relative pl-8 space-y-12 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2.5px] before:bg-slate-100">
          {loading ? (
             [1,2,3].map(i => <div key={i} className="h-24 bg-slate-50 animate-pulse rounded-xl" />)
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="relative group transition-all">
                <div className="absolute -left-[26px] top-0 w-3 h-3 rounded-full bg-primary ring-4 ring-white group-hover:scale-125 transition-transform"></div>
                <div className="flex justify-between items-start">
                  <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-emerald-50 px-2 py-0.5 rounded">{activity.type} recorded</span>
                       <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{getRelativeTime(activity.activity_date)}</span>
                    </div>
                    <h4 className="text-xl font-bold text-on-surface mb-2">{activity.subject}</h4>
                    <p className="text-on-surface-variant leading-relaxed text-sm italic opacity-80">"{activity.body}"</p>
                  </div>
                </div>
              </div>
            ))
          )}
          {!loading && activities.length === 0 && (
            <div className="py-20 text-center">
               <span className="material-symbols-outlined text-6xl text-slate-100 mb-4 block">history</span>
               <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Sequence clean. No interactions found.</p>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Log Entry" size="md">
        <div className="space-y-8">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Interaction Class</label>
            <select 
              value={formData.type} 
              onChange={e => setFormData({...formData, type: e.target.value})}
              className="w-full bg-slate-50 rounded-xl py-4 px-5 text-sm font-bold shadow-sm"
            >
              <option value="call">Voice Call</option>
              <option value="email">Digital Correspondence</option>
              <option value="meeting">Physical Meeting</option>
              <option value="note">Internal Strategy</option>
              <option value="task">Operational Task</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Subject Header</label>
            <input 
              type="text" 
              value={formData.subject} 
              onChange={e => setFormData({...formData, subject: e.target.value})} 
              className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary transition-all outline-none" 
              placeholder="Brief summary..." 
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Minutes / Record</label>
            <textarea 
              value={formData.body} 
              onChange={e => setFormData({...formData, body: e.target.value})} 
              className="w-full text-sm font-medium py-4 px-5 bg-slate-50 rounded-2xl min-h-[150px] outline-none focus:ring-2 focus:ring-primary/10" 
              placeholder="Detailed record of interaction..." 
            />
          </div>
          <Button variant="primary" fullWidth size="lg" onClick={async () => {
             await createActivity(formData);
             setShowCreateModal(false);
             refreshData();
          }}>Commit Record</Button>
        </div>
      </Modal>
    </div>
  );
};

export default ActivityLog;
