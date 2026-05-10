import React, { useState } from 'react';
import { useEmails } from '../hooks/useEmails';
import { useContacts } from '../hooks/useContacts';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';
import { formatDate } from '../utils/format';

const EmailInbox = () => {
  const { data: emails, loading, sendEmail } = useEmails();
  const { data: contacts } = useContacts({ limit: 100 });
  const [showCompose, setShowCompose] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  
  const [formData, setFormData] = useState({ contact_id: '', subject: '', body: '' });

  const handleCompose = async () => {
    if (!formData.contact_id || !formData.subject || !formData.body) return;
    const ok = await sendEmail(formData);
    if (ok.success) {
      setShowCompose(false);
      setFormData({ contact_id: '', subject: '', body: '' });
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 animate-slideIn">
      {/* 1. Inbox List */}
      <div className="w-96 border-r border-slate-50 flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tight text-on-surface">Inbox.</h2>
          <Button variant="primary" size="sm" onClick={() => setShowCompose(true)}>
             <span className="material-symbols-outlined text-sm mr-2">edit_square</span> Compose
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {loading ? (
            <div className="p-4 space-y-4">
               {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-50 animate-pulse rounded-2xl" />)}
            </div>
          ) : (
            emails.map(email => (
              <div 
                key={email.id} 
                onClick={() => setSelectedEmail(email)}
                className={`p-5 cursor-pointer hover:bg-slate-50 transition-colors border-b border-slate-50 ${selectedEmail?.id === email.id ? 'bg-emerald-50/50 border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-baseline mb-2">
                  <h4 className="text-sm font-bold text-on-surface truncate pr-4">{email.contact_name || email.contact_email || 'Unknown Contact'}</h4>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest shrink-0">{formatDate(email.sent_at)}</span>
                </div>
                <h5 className="text-xs font-bold text-on-surface-variant mb-1 truncate">{email.subject}</h5>
                <p className="text-xs text-slate-400 truncate leading-snug">
                  {email.body}
                </p>
              </div>
            ))
          )}
          {!loading && emails.length === 0 && (
             <div className="p-12 text-center text-slate-300">
                <span className="material-symbols-outlined text-4xl mb-2">mail</span>
                <p className="text-[10px] font-black uppercase tracking-widest">Inbox Zero</p>
             </div>
          )}
        </div>
      </div>

      {/* 2. Reading Pane */}
      <div className="flex-1 flex flex-col bg-slate-50/20">
        {selectedEmail ? (
           <div className="flex-1 overflow-y-auto p-12 scrollbar-thin">
              <div className="max-w-3xl mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-slate-100">
                 <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                       <Avatar name={selectedEmail.contact_name || selectedEmail.contact_email || 'Unknown'} size="lg" />
                       <div>
                          <h3 className="text-lg font-bold text-on-surface leading-tight">{selectedEmail.contact_name || 'Unknown Contact'}</h3>
                          <p className="text-sm text-slate-500">{selectedEmail.contact_email}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className="text-xs font-bold text-slate-400 block mb-1">{formatDate(selectedEmail.sent_at)}</span>
                       <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-slate-100 text-slate-500">{selectedEmail.direction}</span>
                    </div>
                 </div>
                 <h2 className="text-2xl font-black text-on-surface mb-8">{selectedEmail.subject}</h2>
                 <div className="prose prose-sm max-w-none text-on-surface-variant leading-relaxed whitespace-pre-wrap">
                    {selectedEmail.body}
                 </div>
              </div>
           </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
             <span className="material-symbols-outlined text-9xl mb-4">drafts</span>
             <p className="text-xs font-black uppercase tracking-[0.2em]">Select an email to read</p>
          </div>
        )}
      </div>

      <Modal isOpen={showCompose} onClose={() => setShowCompose(false)} title="New Message" size="lg">
        <div className="space-y-6">
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Recipient *</label>
              <select 
                 value={formData.contact_id}
                 onChange={e => setFormData({...formData, contact_id: e.target.value})}
                 className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold shadow-sm outline-none border-none"
              >
                 <option value="">Select a contact...</option>
                 {contacts?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
              </select>
           </div>
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Subject *</label>
              <input 
                type="text" 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary outline-none transition-all" 
                placeholder="Message subject" 
              />
           </div>
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Body</label>
              <textarea 
                value={formData.body}
                onChange={e => setFormData({...formData, body: e.target.value})}
                className="w-full bg-slate-50 rounded-2xl py-4 px-5 min-h-[250px] text-sm outline-none border-none"
                placeholder="Type your message here..."
              />
           </div>
           <div className="flex justify-end gap-4 pt-4 border-t border-slate-50">
              <Button variant="secondary" onClick={() => setShowCompose(false)}>Cancel</Button>
              <Button variant="primary" size="lg" onClick={handleCompose} disabled={!formData.contact_id || !formData.subject}>
                <span className="material-symbols-outlined text-sm mr-2">send</span> Send Message
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmailInbox;
