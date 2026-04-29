import React, { useState, useEffect } from 'react';
import { useDeals, useUpdateDeal, useCreateDeal, useDeleteDeal } from '../hooks/useDeals';
import { useContacts } from '../hooks/useContacts';
import { useCRM } from '../context/CRMContext';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { formatCurrency } from '../utils/format';

const Pipeline = () => {
  const { refreshTrigger, setGlobalAction, refreshData } = useCRM();
  const { data: deals, loading, refetch } = useDeals({ trigger: refreshTrigger });
  const { data: contacts } = useContacts({ limit: 100 });
  const { createDeal } = useCreateDeal();
  const { updateDeal } = useUpdateDeal();
  const { deleteDeal } = useDeleteDeal();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [formData, setFormData] = useState({ title: '', company: '', value: 0, stage: 'New', probability: 50, contact_id: '' });

  useEffect(() => {
    setGlobalAction(() => () => {
      setFormData({ title: '', company: '', value: 0, stage: 'New', probability: 50, contact_id: '' });
      setShowCreateModal(true);
    });
    return () => setGlobalAction(null);
  }, [setGlobalAction]);

  useEffect(() => { refetch(); }, [refreshTrigger]);
  
  const [draggedDeal, setDraggedDeal] = useState(null);
  const stages = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

  const groupedDeals = stages.reduce((acc, stage) => {
    acc[stage] = deals?.filter(deal => deal.stage === stage) || [];
    return acc;
  }, {});

  const handleDrop = async (stage) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      await updateDeal(draggedDeal.id, { stage });
      refreshData();
    }
    setDraggedDeal(null);
  };

  if (loading) return <div className="animate-pulse space-y-12"><div className="h-12 bg-slate-100 rounded-xl w-1/4" /><div className="grid grid-cols-5 gap-6"><div className="col-span-1 h-[600px] bg-slate-50 rounded-2xl" /></div></div>;

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Sales Lifecycle</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Pipeline.</h2>
          <div className="flex gap-4">
             <Button variant="primary" onClick={() => setShowCreateModal(true)}>New Opportunity</Button>
          </div>
        </div>
      </section>

      <div className="flex gap-6 overflow-x-auto pb-12 scrollbar-hide">
        {stages.map((stage) => {
          const stageDeals = groupedDeals[stage] || [];
          const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

          return (
            <div
              key={stage}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(stage)}
              className={`min-w-[320px] rounded-3xl p-6 transition-all ${
                draggedDeal && draggedDeal.stage !== stage ? 'bg-emerald-50 ring-2 ring-primary/10' : 'bg-slate-50'
              }`}
            >
              <div className="mb-8 px-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">{stage}</span>
                  <span className="text-[10px] font-bold text-slate-400">{stageDeals.length} deals</span>
                </div>
                <div className="text-2xl font-black text-on-surface tracking-tighter">{formatCurrency(stageValue)}</div>
              </div>

              <div className="flex flex-col gap-4">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => setDraggedDeal(deal)}
                    onClick={() => { 
                      setSelectedDeal(deal); 
                      setFormData({ title: deal.title, company: deal.company, value: deal.value, stage: deal.stage, probability: deal.probability, contact_id: deal.contact_id }); 
                      setShowEditModal(true); 
                    }}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-primary-fixed hover:shadow-xl transition-all cursor-grab active:cursor-grabbing group"
                  >
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{deal.company}</span>
                    <h4 className="text-sm font-bold text-on-surface mb-6 group-hover:text-primary transition-colors">{deal.title}</h4>
                    <div className="flex justify-between items-end">
                       <span className="text-lg font-black text-primary tracking-tighter">{formatCurrency(deal.value)}</span>
                       <span className="text-[10px] font-bold text-slate-300">{deal.probability}%</span>
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="py-12 text-center text-slate-300 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">Empty Stage</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Initialize New Deal - Matching Reference Style */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Opportunity" size="lg">
         <div className="space-y-12 py-4">
            <p className="text-on-surface-variant text-sm font-medium opacity-80">Define the parameters for this upcoming fiscal commitment. Every ledger entry begins with intentionality.</p>
            
            <div className="grid grid-cols-12 gap-12">
               <div className="col-span-7 space-y-12">
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 group-focus-within:text-primary transition-colors">Opportunity Name</label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full text-2xl font-semibold border-b-2 border-slate-100 focus:border-primary px-0 pb-4 transition-all outline-none" 
                      placeholder="e.g. Q4 Infrastructure Renewal" 
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-2 group-focus-within:text-primary transition-colors">Projected Value</label>
                    <div className="flex items-end gap-3 border-b-2 border-slate-100 focus-within:border-primary transition-all pb-4">
                      <span className="text-4xl font-light text-slate-300">$</span>
                      <input 
                        type="number" 
                        value={formData.value} 
                        onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                        className="w-full text-6xl font-black tracking-tighter outline-none" 
                        placeholder="0.00" 
                      />
                    </div>
                  </div>
               </div>

               <div className="col-span-5 space-y-8">
                  <div className="bg-slate-50 rounded-2xl p-8">
                    <h3 className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-6">Primary Contact</h3>
                    <select 
                      value={formData.contact_id} 
                      onChange={e => setFormData({...formData, contact_id: e.target.value})}
                      className="w-full bg-white rounded-xl py-4 px-5 text-sm font-bold shadow-sm outline-none border-none focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="">Select individual...</option>
                      {contacts?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
                    </select>
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-slate-100 flex justify-end gap-6">
               <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Save to Drafts</Button>
               <Button variant="primary" size="lg" onClick={async () => {
                 await createDeal(formData);
                 setShowCreateModal(false);
                 refreshData();
               }}>Initialize Opportunity</Button>
            </div>
         </div>
      </Modal>

      {/* Edit Modal simplified for speed but kept consistent */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Update Opportunity">
         <div className="space-y-8">
            <div>
              <label className="label-md block mb-2">Stage</label>
              <select 
                value={formData.stage} 
                onChange={e => setFormData({...formData, stage: e.target.value})}
                className="w-full text-lg font-bold"
              >
                {stages.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-6">
               <div className="flex-1">
                  <label className="label-md block mb-2">Value</label>
                  <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="text-xl font-bold" />
               </div>
               <div className="flex-1">
                  <label className="label-md block mb-2">Probability %</label>
                  <input type="number" value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})} className="text-xl font-bold" />
               </div>
            </div>
            <div className="flex gap-4 pt-4">
              <Button variant="primary" fullWidth onClick={async () => {
                 await updateDeal(selectedDeal.id, formData);
                 setShowEditModal(false);
                 refreshData();
              }}>Commit Changes</Button>
              <Button variant="danger" onClick={async () => {
                if (window.confirm('Abandon this opportunity?')) {
                  await deleteDeal(selectedDeal.id);
                  setShowEditModal(false);
                  refreshData();
                }
              }}>Abandon</Button>
            </div>
         </div>
      </Modal>
    </div>
  );
};

export default Pipeline;
