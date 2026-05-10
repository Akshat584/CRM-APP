import React, { useState } from 'react';
import { useCampaigns } from '../hooks/useCampaigns';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { formatDate } from '../utils/format';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Campaigns = () => {
  const { campaigns, loading, createCampaign, startCampaign } = useCampaigns();
  const { templates } = useWhatsApp();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', template_id: '', audience_filter: {} });

  const handleCreate = async () => {
    if (!formData.name || !formData.template_id) return;
    const res = await createCampaign(formData);
    if (res.success) setShowCreateModal(false);
  };

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Mass Communication</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Campaigns.</h2>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>New Launch</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6">
        {loading && campaigns.length === 0 ? (
          [1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-50 animate-pulse rounded-2xl" />)
        ) : (
          campaigns.map(camp => (
            <div key={camp.id} className="bg-surface-container-lowest p-8 rounded-3xl border border-slate-50 editorial-shadow flex items-center justify-between group hover:shadow-xl transition-all">
              <div className="flex items-center gap-8">
                 <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${camp.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 'bg-primary-container text-primary'}`}>
                    <span className="material-symbols-outlined text-3xl">
                      {camp.status === 'completed' ? 'verified' : camp.status === 'running' ? 'sync' : 'rocket_launch'}
                    </span>
                 </div>
                 <div>
                    <div className="flex items-center gap-3 mb-1">
                       <h3 className="text-xl font-bold text-on-surface">{camp.name}</h3>
                       <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded tracking-widest ${
                         camp.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                       }`}>{camp.status}</span>
                    </div>
                    <p className="text-xs text-on-surface-variant font-medium uppercase tracking-wider opacity-60">
                      Template: {camp.template_name} • Created {formatDate(camp.created_at)}
                    </p>
                 </div>
              </div>

              <div className="flex items-center gap-4">
                 {camp.status === 'draft' && (
                    <Button variant="primary" size="sm" onClick={() => startCampaign(camp.id)}>
                       Launch Signal
                    </Button>
                 )}
                 {camp.status === 'completed' && (
                    <div className="text-right">
                       <div className="text-2xl font-black text-primary tracking-tighter">100%</div>
                       <div className="text-[9px] font-black uppercase text-slate-300">Delivery Success</div>
                    </div>
                 )}
              </div>
            </div>
          ))
        )}

        {!loading && campaigns.length === 0 && (
           <div className="py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">rocket</span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active launches in the queue.</p>
           </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Launch Protocol">
        <div className="space-y-8">
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary transition-colors">Campaign Identifier *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary outline-none transition-all" 
                placeholder="e.g. Q3 Re-engagement Initiative" 
              />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Select Encrypted Template</label>
              <div className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto pr-2 scrollbar-thin">
                 {templates.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setFormData({...formData, template_id: t.id})}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.template_id === t.id ? 'border-primary bg-emerald-50' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                    >
                       <div className="text-sm font-bold text-on-surface mb-1">{t.name}</div>
                       <div className="text-[9px] text-slate-400 uppercase font-black">{t.language} • {t.category}</div>
                    </div>
                 ))}
              </div>
           </div>
           <div className="flex justify-end gap-4 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" size="lg" onClick={handleCreate} disabled={!formData.name || !formData.template_id}>
                Initialize Draft
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Campaigns;
