import React, { useState } from 'react';
import { useAutomations } from '../hooks/useAutomations';
import { useWhatsApp } from '../hooks/useWhatsApp';
import Button from '../components/Button';
import Modal from '../components/Modal';

const Automations = () => {
  const { data: automations, loading, createAutomation, toggleAutomation, deleteAutomation } = useAutomations();
  const { templates } = useWhatsApp();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', keyword: '', reply_type: 'text', reply_text: '', reply_template_id: '' });

  const handleCreate = async () => {
    const ok = await createAutomation(formData);
    if (ok) {
      setShowCreateModal(false);
      setFormData({ name: '', keyword: '', reply_type: 'text', reply_text: '', reply_template_id: '' });
    }
  };

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Autonomous Protocols</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Automations.</h2>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>Initialize Protocol</Button>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading && automations.length === 0 ? (
          [1,2,3].map(i => <div key={i} className="h-64 bg-slate-50 animate-pulse rounded-3xl" />)
        ) : (
          automations.map(auto => (
            <div key={auto.id} className={`bg-surface-container-lowest p-8 rounded-[32px] border transition-all hover:shadow-xl ${auto.is_active ? 'border-primary-container' : 'border-slate-100 opacity-60 grayscale'}`}>
               <div className="flex justify-between items-start mb-8">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${auto.is_active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-200 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-2xl">{auto.reply_type === 'template' ? 'bolt' : 'chat_bubble'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <button onClick={() => toggleAutomation(auto.id, !auto.is_active)} className={`w-10 h-6 rounded-full transition-colors relative ${auto.is_active ? 'bg-primary' : 'bg-slate-300'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${auto.is_active ? 'left-5' : 'left-1'}`} />
                     </button>
                     <button onClick={() => deleteAutomation(auto.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <span className="material-symbols-outlined text-lg">delete</span>
                     </button>
                  </div>
               </div>

               <h3 className="text-xl font-bold text-on-surface mb-2 truncate">{auto.name || 'Unnamed Protocol'}</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
                 <span className="w-1.5 h-1.5 rounded-full bg-primary" /> 
                 Keyword: "{auto.keyword}"
               </p>

               <div className="bg-slate-50 rounded-2xl p-4 min-h-[80px]">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter mb-2">Automated Reply</p>
                  <p className="text-xs font-medium text-on-surface-variant line-clamp-2 italic">
                    {auto.reply_type === 'template' ? `[Template: ${auto.template_name}]` : auto.reply_text}
                  </p>
               </div>

               <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                     <span className="text-[20px] font-black text-on-surface tracking-tighter">{auto.trigger_count || 0}</span>
                     <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest mt-1">Triggers</span>
                  </div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase">{auto.reply_type} logic</span>
               </div>
            </div>
          ))
        )}

        {!loading && automations.length === 0 && (
           <div className="col-span-full py-20 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
              <span className="material-symbols-outlined text-6xl text-slate-200 mb-4 block">smart_toy</span>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No active logic protocols in memory.</p>
           </div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Logic Protocol" size="md">
        <div className="space-y-8">
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Protocol Name *</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary outline-none transition-all" 
                placeholder="e.g. Pricing Inquiry Auto-Reply" 
              />
           </div>

           <div className="grid grid-cols-2 gap-8">
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Trigger Keyword *</label>
                 <input 
                   type="text" 
                   value={formData.keyword}
                   onChange={e => setFormData({...formData, keyword: e.target.value})}
                   className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold shadow-sm outline-none border-none"
                   placeholder="e.g. Pricing"
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Reply Class</label>
                 <select 
                    value={formData.reply_type}
                    onChange={e => setFormData({...formData, reply_type: e.target.value})}
                    className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold shadow-sm outline-none border-none"
                 >
                    <option value="text">Plain Text</option>
                    <option value="template">Meta Template</option>
                 </select>
              </div>
           </div>

           {formData.reply_type === 'text' ? (
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Reply Body</label>
                 <textarea 
                    value={formData.reply_text}
                    onChange={e => setFormData({...formData, reply_text: e.target.value})}
                    className="w-full bg-slate-50 rounded-2xl py-4 px-5 min-h-[100px] text-sm outline-none border-none"
                    placeholder="Enter the automated response..."
                 />
              </div>
           ) : (
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-4">Select Template</label>
                 <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    {templates.map(t => (
                       <div 
                         key={t.id} 
                         onClick={() => setFormData({...formData, reply_template_id: t.id})}
                         className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${formData.reply_template_id === t.id ? 'border-primary bg-emerald-50' : 'border-slate-50 bg-white hover:border-slate-200'}`}
                       >
                          <div className="text-xs font-bold text-on-surface mb-1">{t.name}</div>
                          <div className="text-[9px] text-slate-400 uppercase font-black">{t.language}</div>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           <div className="flex justify-end gap-4 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button variant="primary" size="lg" onClick={handleCreate} disabled={!formData.name || !formData.keyword}>
                Initialize Protocol
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Automations;
