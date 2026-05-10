import React, { useState, useRef, useEffect } from 'react';
import { useWhatsApp } from '../hooks/useWhatsApp';
import { useContact } from '../hooks/useContacts';
import { useAuth } from '../context/AuthContext';
import { formatDate, getRelativeTime } from '../utils/format';
import Button from '../components/Button';
import Avatar from '../components/Avatar';
import Badge from '../components/Badge';

const MessageContent = ({ msg }) => {
  if (msg.message_type === 'image') {
    return (
      <div className="space-y-2">
        <img src={msg.meta?.media_url || msg.content} alt="WA Attachment" className="rounded-lg max-w-full hover:opacity-90 cursor-pointer" onClick={() => window.open(msg.meta?.media_url || msg.content, '_blank')} />
        {msg.meta?.caption && <p className="text-xs opacity-80">{msg.meta.caption}</p>}
      </div>
    );
  }
  if (msg.message_type === 'video') {
    return <video src={msg.meta?.media_url || msg.content} controls className="rounded-lg max-w-full" />;
  }
  if (msg.message_type === 'audio') {
    return <audio src={msg.meta?.media_url || msg.content} controls className="w-full" />;
  }
  if (msg.message_type === 'document') {
    return (
      <a href={msg.meta?.media_url || msg.content} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-black/5 p-3 rounded-xl hover:bg-black/10 transition-colors">
        <span className="material-symbols-outlined">description</span>
        <span className="truncate max-w-[150px] font-bold text-xs">{msg.meta?.filename || 'Document.pdf'}</span>
      </a>
    );
  }
  return <span>{msg.content}</span>;
};

const WhatsAppInbox = () => {
  const { user: currentUser } = useAuth();
  const { 
    conversations, 
    messages, 
    activeConversation, 
    setActiveConversation, 
    loading, 
    templates, 
    team,
    assignConversation,
    sendMessage,
    uploadMedia,
    refetchConversations
  } = useWhatsApp();

  const [inputMessage, setInputMessage] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [filter, setFilter] = useState('all'); // all, mine, unassigned
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const filteredConversations = conversations.filter(c => {
    if (filter === 'mine') return c.assigned_to === currentUser.id;
    if (filter === 'unassigned') return !c.assigned_to;
    return true;
  });

  const isWindowOpen = () => {
    if (!activeConversation?.last_inbound_at) return false;
    const lastInbound = new Date(activeConversation.last_inbound_at);
    const now = new Date();
    return (now - lastInbound) < 24 * 60 * 60 * 1000;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputMessage.trim() || !activeConversation) return;
    const ok = await sendMessage(activeConversation.phone, inputMessage);
    if (ok.success) setInputMessage('');
  };

  const handleSendTemplate = async (template) => {
    await sendMessage(activeConversation.phone, `[Template: ${template.name}]`, 'template', {
      templateName: template.name,
      languageCode: template.language
    });
    setShowTemplates(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeConversation) return;

    setUploading(true);
    const res = await uploadMedia(file);
    setUploading(false);

    if (res.success) {
      const type = file.type.split('/')[0];
      const msgType = ['image', 'video', 'audio'].includes(type) ? type : 'document';
      await sendMessage(activeConversation.phone, `[${msgType}: ${file.name}]`, msgType, {
        mediaIdOrUrl: res.data.mediaId,
        caption: `Attached ${file.name}`
      });
    }
  };

  const windowOpen = isWindowOpen();

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100">
      {/* 1. Chat List */}
      <div className="w-80 border-r border-slate-50 flex flex-col">
        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
          <h2 className="text-xl font-black tracking-tight text-on-surface mb-4">Inbox.</h2>
          <div className="flex gap-2 mb-4">
             {['all', 'mine', 'unassigned'].map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-primary text-white' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                >
                  {f === 'mine' ? 'My Chats' : f}
                </button>
             ))}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 py-2 bg-white rounded-xl text-xs font-bold border border-slate-100 outline-none focus:ring-2 focus:ring-primary/10"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {filteredConversations.map(conv => (
            <div 
              key={conv.id} 
              onClick={() => setActiveConversation(conv)}
              className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${activeConversation?.id === conv.id ? 'bg-emerald-50/50 border-r-4 border-primary' : ''}`}
            >
              <Avatar initials={conv.avatar_initials || 'WA'} name={conv.contact_name || conv.phone} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <h4 className="text-sm font-bold text-on-surface truncate">{conv.contact_name || conv.phone}</h4>
                  <span className="text-[10px] text-slate-300 font-bold uppercase">{getRelativeTime(conv.last_message_at)}</span>
                </div>
                <p className="text-xs text-slate-400 truncate leading-snug">
                  {conv.last_message || 'Start conversation...'}
                </p>
                {conv.assignee_name && (
                   <span className="text-[8px] font-black text-primary uppercase mt-1 block">Assigned to: {conv.assignee_name}</span>
                )}
              </div>
            </div>
          ))}
          {filteredConversations.length === 0 && !loading && (
             <div className="p-12 text-center text-slate-300">
                <span className="material-symbols-outlined text-4xl mb-2">forum</span>
                <p className="text-[10px] font-black uppercase tracking-widest">No active threads</p>
             </div>
          )}
        </div>
      </div>

      {/* 2. Chat Window */}
      <div className="flex-1 flex flex-col bg-slate-50/20">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center px-8">
               <div className="flex items-center gap-4">
                  <Avatar initials={activeConversation.avatar_initials || 'WA'} name={activeConversation.contact_name || activeConversation.phone} size="sm" />
                  <div>
                     <h3 className="text-sm font-black text-on-surface">{activeConversation.contact_name || activeConversation.phone}</h3>
                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Online</span>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">
                    <span className="material-symbols-outlined text-xl">call</span>
                  </button>
                  <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">
                    <span className="material-symbols-outlined text-xl">videocam</span>
                  </button>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin">
               {messages.map((msg, idx) => {
                  const isOutbound = msg.direction === 'outbound';
                  return (
                    <div key={msg.id || idx} className={`flex ${isOutbound ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[70%] p-4 rounded-2xl text-sm font-medium shadow-sm ${isOutbound ? 'bg-primary text-white rounded-br-none' : 'bg-white text-on-surface rounded-bl-none border border-slate-50'}`}>
                          <MessageContent msg={msg} />
                          <div className={`text-[9px] mt-1 font-bold uppercase tracking-tighter flex items-center gap-1 ${isOutbound ? 'text-white/60' : 'text-slate-300'}`}>
                             {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             {isOutbound && (
                                <span className="material-symbols-outlined text-[12px]">
                                   {msg.status === 'read' ? 'done_all' : msg.status === 'delivered' ? 'done_all' : 'done'}
                                </span>
                             )}
                          </div>
                       </div>
                    </div>
                  );
               })}
               <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-6 bg-white border-t border-slate-100">
               {!windowOpen && (
                 <div className="mb-4 p-3 bg-amber-50 rounded-xl flex items-center gap-3 border border-amber-100">
                    <span className="material-symbols-outlined text-amber-500">info</span>
                    <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                      The 24-hour window has expired. You must use a Template to re-engage this contact.
                    </p>
                 </div>
               )}
               <div className={`flex items-center gap-4 bg-slate-50 rounded-2xl p-2 pl-4 transition-opacity ${!windowOpen ? 'opacity-60' : ''}`}>
                  <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-primary"
                    >
                      <span className="material-symbols-outlined text-xl">dashboard_customize</span>
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!windowOpen || uploading}
                      className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-xl">{uploading ? 'sync' : 'attach_file'}</span>
                    </button>
                  </div>
                  
                  {showTemplates && (
                    <div className="relative">
                      <div className="absolute bottom-12 left-0 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 p-2 z-50">
                         <div className="text-[10px] font-black uppercase tracking-widest p-2 text-slate-400">Select Template</div>
                         <div className="max-h-64 overflow-y-auto scrollbar-thin">
                            {templates.map(t => (
                              <div key={t.id} onClick={() => handleSendTemplate(t)} className="p-3 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors border-b border-slate-50 last:border-0">
                                 <div className="text-xs font-bold text-on-surface mb-1">{t.name}</div>
                                 <div className="text-[9px] text-slate-400 uppercase">{t.language} • {t.category}</div>
                              </div>
                            ))}
                         </div>
                      </div>
                    </div>
                  )}

                  <input 
                    type="text" 
                    value={inputMessage}
                    onChange={e => setInputMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && windowOpen && handleSend()}
                    placeholder={windowOpen ? "Type a message..." : "Window expired. Use template."}
                    disabled={!windowOpen}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium disabled:cursor-not-allowed"
                  />
                  <Button variant="primary" size="sm" className="rounded-xl px-5" onClick={handleSend} disabled={!windowOpen || !inputMessage.trim()}>
                    <span className="material-symbols-outlined">send</span>
                  </Button>
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-200">
             <span className="material-symbols-outlined text-9xl mb-4">chat</span>
             <p className="text-xs font-black uppercase tracking-[0.2em]">Select a conversation to start syncing</p>
          </div>
        )}
      </div>

      {/* 3. CRM Context Panel */}
      <CRMContextPanel 
        activeConversation={activeConversation} 
        team={team} 
        onAssign={(userId) => assignConversation(activeConversation.id, userId)} 
      />
    </div>
  );
};

const CRMContextPanel = ({ activeConversation, team, onAssign }) => {
  const { data: contact, loading } = useContact(activeConversation?.contact_id);

  if (!activeConversation) return <div className="w-72 bg-white border-l border-slate-50 flex flex-col items-center justify-center p-8 opacity-20"><span className="material-symbols-outlined text-6xl">analytics</span></div>;
  if (loading) return <div className="w-72 bg-white border-l border-slate-50 p-8 animate-pulse" />;
  if (!contact) return null;

  return (
    <div className="w-72 bg-white border-l border-slate-50 p-8 overflow-y-auto scrollbar-thin">
       <div className="text-center mb-8">
          <Avatar initials={contact.avatar_initials} name={contact.name} size="lg" className="mx-auto mb-4" />
          <h3 className="text-base font-black text-on-surface leading-tight">{contact.name}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{contact.company || 'Private Record'}</p>
          <div className="mt-4">
             <Badge variant={contact.status}>{contact.status}</Badge>
          </div>
       </div>

       <div className="space-y-8">
          <section>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Owner Assignment</h4>
             <select 
               value={activeConversation.assigned_to || 'unassigned'}
               onChange={(e) => onAssign(e.target.value)}
               className="w-full bg-slate-50 rounded-xl py-3 px-4 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-primary/10"
             >
                <option value="unassigned">Unassigned</option>
                {team.map(member => (
                   <option key={member.id} value={member.id}>{member.name}</option>
                ))}
             </select>
          </section>

          <section>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Financial Value</h4>
             <div className="text-2xl font-black text-primary tracking-tighter">${parseFloat(contact.lifetime_value).toLocaleString()}</div>
          </section>

          <section>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Active Pipeline</h4>
             <div className="space-y-3">
                {contact.deals?.map(deal => (
                   <div key={deal.id} className="p-3 bg-slate-50 rounded-xl">
                      <div className="text-[10px] font-bold text-on-surface mb-0.5">{deal.title}</div>
                      <div className="text-[9px] font-black text-primary uppercase tracking-tighter">{deal.stage} • ${parseFloat(deal.value).toLocaleString()}</div>
                   </div>
                ))}
                {contact.deals?.length === 0 && <p className="text-[10px] font-bold text-slate-300 italic">No active deals found.</p>}
             </div>
          </section>

          <section>
             <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Quick Protocols</h4>
             <div className="grid grid-cols-2 gap-2">
                <button className="p-3 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">New Task</button>
                <button className="p-3 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">Add Note</button>
                <button className="p-3 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all col-span-2">Advance Stage</button>
             </div>
          </section>
       </div>
    </div>
  );
};

export default WhatsAppInbox;
