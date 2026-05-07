import React, { useState, useEffect } from 'react';
import { useContacts, useContact, useCreateContact, useUpdateContact, useDeleteContact, useExportContacts, useImportContacts } from '../hooks/useContacts';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, getRelativeTime } from '../utils/format';
import Modal from '../components/Modal';
import Button from '../components/Button';

const ContactDetails = ({ contactId, onBack }) => {
  const { data: contact, loading } = useContact(contactId);
  const { updateContact } = useUpdateContact();
  const { deleteContact } = useDeleteContact();
  const { refreshData } = useCRM();

  if (loading) return <div className="animate-pulse space-y-8"><div className="h-64 bg-slate-100 rounded-2xl" /><div className="h-96 bg-slate-100 rounded-2xl" /></div>;
  if (!contact) return null;

  return (
    <div className="animate-slideIn">
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-8 hover:translate-x-[-4px] transition-transform">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Directory
      </button>

      {/* HERO PROFILE SECTION */}
      <section className="flex flex-col md:flex-row gap-12 items-start mb-16">
        <div className="relative">
          <div className="w-48 h-64 bg-primary-container rounded-2xl shadow-2xl shadow-primary/10 flex items-end p-6">
             <span className="text-8xl font-black text-on-primary-container opacity-20 select-none">
               {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
             </span>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-primary-fixed text-on-primary-fixed-variant px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest shadow-xl">
            {contact.status === 'Customer' ? 'VIP Client' : contact.status}
          </div>
        </div>
        <div className="flex-1 pt-4">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-5xl font-extrabold tracking-tighter text-on-surface mb-2">{contact.name}</h2>
              <p className="text-on-surface-variant font-medium tracking-wide flex items-center gap-2">
                {contact.role || 'Partner'} <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span> {contact.company || 'Private Entity'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="primary" className="px-6 py-3">
                <span className="material-symbols-outlined text-lg mr-2">call</span>
                Call
              </Button>
              <Button variant="secondary" className="px-6 py-3">
                <span className="material-symbols-outlined text-lg mr-2">mail</span>
                Email
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-8 mt-12">
            <div className="border-l-2 border-primary-fixed pl-6">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Lifetime Value</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(contact.lifetime_value || 0)}</p>
            </div>
            <div className="border-l-2 border-primary-fixed pl-6">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Email</p>
              <p className="text-lg font-bold text-primary truncate">{contact.email}</p>
            </div>
            <div className="border-l-2 border-primary-fixed pl-6">
              <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mb-1">Risk Score</p>
              <p className="text-2xl font-bold text-primary">Low</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-8">
          {/* ACTIVE DEALS BENTO */}
          <div className="bg-surface-container-low rounded-3xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-extrabold uppercase tracking-widest">Active Deals</h3>
              <button className="text-xs font-bold text-primary tracking-widest uppercase flex items-center gap-1">
                View Pipeline <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contact.deals?.map(deal => (
                <div key={deal.id} className="bg-surface-container-lowest p-6 rounded-2xl group cursor-pointer hover:ring-2 ring-primary/10 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-extrabold px-2 py-1 bg-primary-fixed text-on-primary-fixed-variant rounded uppercase">{deal.stage}</span>
                    <span className="text-on-surface-variant text-xs">{getRelativeTime(deal.created_at)}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-4">{deal.title}</h4>
                  <p className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(deal.value)}</p>
                </div>
              ))}
              {(!contact.deals || contact.deals.length === 0) && (
                <div className="col-span-2 py-12 text-center text-slate-400 font-medium italic">No active deals found in ledger.</div>
              )}
            </div>
          </div>

          {/* INTERNAL NOTES */}
          <div className="relative bg-white p-10 rounded-3xl overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-8xl">format_quote</span>
            </div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Internal Strategy Notes
            </h3>
            <blockquote className="text-xl font-light leading-relaxed text-on-surface italic">
              "Relationship established. Focus on high-yield opportunities and direct communication. Values data-backed projections."
            </blockquote>
          </div>
        </div>

        {/* RIGHT COLUMN: INTERACTION HISTORY */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-surface-container-low rounded-3xl p-8 sticky top-24">
            <h3 className="text-lg font-extrabold uppercase tracking-widest mb-10">Interaction History</h3>
            <div className="relative pl-8 border-l border-outline-variant flex flex-col gap-12">
               {contact.activities?.slice(0, 4).map((activity, idx) => (
                 <div key={activity.id} className="relative">
                    <div className={`absolute -left-[41px] top-0 w-4 h-4 rounded-full ring-4 ring-surface-container-low ${idx === 0 ? 'bg-primary' : 'bg-outline-variant'}`}></div>
                    <p className="text-[10px] font-extrabold text-on-surface-variant uppercase tracking-widest mb-2">{getRelativeTime(activity.activity_date)}</p>
                    <h5 className="text-sm font-bold text-on-surface">{activity.subject}</h5>
                    <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{activity.body}</p>
                 </div>
               ))}
               {(!contact.activities || contact.activities.length === 0) && (
                 <div className="text-slate-400 text-xs italic">No history recorded yet.</div>
               )}
            </div>
            <Button variant="secondary" fullWidth className="mt-12 uppercase tracking-widest text-[10px]">Load Older History</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'Lead' });
  
  const { setGlobalAction, refreshTrigger, refreshData } = useCRM();
  const { createContact } = useCreateContact();
  const { exportContacts, loading: exporting } = useExportContacts();
  const { importContacts, loading: importing } = useImportContacts();

  useEffect(() => {
    setGlobalAction(() => () => {
      setFormData({ name: '', email: '', phone: '', company: '', status: 'Lead' });
      setShowCreateModal(true);
    });
    return () => setGlobalAction(null);
  }, [setGlobalAction]);

  const { data: contacts, loading } = useContacts({
    search: searchTerm,
    status: statusFilter === 'All' ? undefined : statusFilter,
    limit: 50,
    trigger: refreshTrigger
  });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await importContacts(file);
      e.target.value = null; // reset
      refreshData();
    }
  };

  if (selectedContactId) {
    return <ContactDetails contactId={selectedContactId} onBack={() => setSelectedContactId(null)} />;
  }

  return (
    <div className="view-content animate-slideIn">
      {/* Page Header Section */}
      <div className="flex flex-col gap-8 mb-16">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-5xl font-extrabold text-on-surface tracking-tight">Contacts</h2>
            <p className="text-on-surface-variant text-lg font-light">Managing {contacts?.length || 0} professional connections</p>
          </div>
          <div className="flex gap-4 items-center">
            <input type="file" id="csv-upload" accept=".csv" className="hidden" onChange={handleFileChange} />
            <label htmlFor="csv-upload" className="cursor-pointer">
              <Button variant="secondary" className="px-6 pointer-events-none" disabled={importing}>
                {importing ? 'Importing...' : 'Import CSV'}
              </Button>
            </label>
            <Button variant="secondary" className="px-6" onClick={exportContacts} disabled={exporting}>
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button variant="primary" className="px-6" onClick={() => setShowCreateModal(true)}>Add Contact</Button>
          </div>
        </div>
        {/* Filters */}
        <div className="flex items-center gap-3">
          {['All', 'Lead', 'Prospect', 'Customer', 'Churned'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${
                statusFilter === status ? 'bg-primary text-on-primary' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Contacts Grid (Bento Style) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          [1,2,3,4,5,6].map(i => <div key={i} className="h-72 bg-slate-50 animate-pulse rounded-xl" />)
        ) : (
          contacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setSelectedContactId(contact.id)}
              className="group bg-surface-container-lowest p-8 rounded-xl transition-all duration-300 flex flex-col justify-between h-72 border-none cursor-pointer hover:shadow-xl hover:translate-y-[-4px]"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-6">
                  <div className="text-6xl font-black text-surface-container-highest select-none opacity-40">
                    {contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">{contact.name}</h3>
                    <p className="text-sm text-on-surface-variant font-medium uppercase tracking-wider">{contact.role || 'Partner'}</p>
                    <p className="text-xs text-slate-400">{contact.company || 'Private Entity'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-widest ${
                  contact.status === 'Customer' ? 'bg-primary-fixed text-on-primary-fixed-variant' : 'bg-slate-100 text-slate-500'
                }`}>
                  {contact.status}
                </span>
              </div>
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                    {contact.name[0]}
                  </div>
                </div>
                <button className="text-primary font-bold text-sm flex items-center gap-2 group/btn">
                  View Profile
                  <span className="material-symbols-outlined text-sm group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Add New Contact">
         <div className="space-y-8">
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-on-surface-variant">Identity</label>
              <input 
                type="text" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full text-xl font-semibold py-3 placeholder:text-slate-300" 
                placeholder="Full Name" 
              />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-on-surface-variant">Contact Vector</label>
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full text-xl font-semibold py-3 placeholder:text-slate-300" 
                placeholder="email@example.com" 
              />
            </div>
            <div className="group">
              <label className="block text-[10px] uppercase tracking-widest font-bold mb-2 text-on-surface-variant">Corporate Affiliation</label>
              <input 
                type="text" 
                value={formData.company} 
                onChange={e => setFormData({...formData, company: e.target.value})}
                className="w-full text-xl font-semibold py-3 placeholder:text-slate-300" 
                placeholder="Company Name" 
              />
            </div>
            <Button variant="primary" fullWidth size="lg" onClick={async () => {
              await createContact(formData);
              setShowCreateModal(false);
              refreshData();
            }}>Initialize Record</Button>
         </div>
      </Modal>
    </div>
  );
};

export default Contacts;
