import React, { useState } from 'react';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Avatar from '../components/Avatar';

const TeamSettings = () => {
  const { user } = useAuth();
  const { members, invitations, loading, inviteMember } = useTeam();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [formData, setFormData] = useState({ email: '', role: 'member' });

  const handleInvite = async () => {
    const ok = await inviteMember(formData);
    if (ok) {
      setShowInviteModal(false);
      setFormData({ email: '', role: 'member' });
    }
  };

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Workspace Governance</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Team.</h2>
          {user?.role === 'admin' && (
            <Button variant="primary" onClick={() => setShowInviteModal(true)}>Invite Associate</Button>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Members List */}
        <div className="lg:col-span-2 space-y-8">
           <h3 className="text-xs font-black tracking-widest uppercase opacity-40">Active Roster</h3>
           <div className="bg-surface-container-lowest rounded-[40px] border border-slate-50 overflow-hidden editorial-shadow">
              {loading ? (
                 <div className="p-12 animate-pulse space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-50 rounded-2xl" />)}
                 </div>
              ) : (
                 <div className="divide-y divide-slate-50">
                    {members.map(member => (
                       <div key={member.id} className="p-8 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                          <div className="flex items-center gap-6">
                             <Avatar name={member.name} size="md" />
                             <div>
                                <h4 className="text-lg font-bold text-on-surface leading-none mb-1">{member.name} {member.id === user.id && '(You)'}</h4>
                                <p className="text-xs text-on-surface-variant font-medium opacity-60">{member.email}</p>
                             </div>
                          </div>
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${member.role === 'admin' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>
                             {member.role}
                          </span>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        </div>

        {/* Pending Invites */}
        <div className="space-y-8">
           <h3 className="text-xs font-black tracking-widest uppercase opacity-40">Pending Dispatches</h3>
           <div className="space-y-4">
              {invitations.map(invite => (
                 <div key={invite.id} className="bg-white p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="min-w-0">
                       <p className="text-sm font-bold text-on-surface truncate">{invite.email}</p>
                       <p className="text-[9px] font-black text-primary uppercase tracking-tighter mt-1">{invite.role} Access</p>
                    </div>
                    <span className="text-[9px] font-bold text-slate-300 uppercase">Pending</span>
                 </div>
              ))}
              {invitations.length === 0 && (
                 <div className="py-12 text-center bg-slate-50 rounded-[32px] border-2 border-dashed border-slate-100">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">No active invites</p>
                 </div>
              )}
           </div>

           {/* Security Banner */}
           <div className="bg-primary/5 p-8 rounded-[32px] border border-primary/10">
              <span className="material-symbols-outlined text-primary mb-4">verified_user</span>
              <h4 className="text-sm font-bold text-primary mb-2">Access Hardening</h4>
              <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">
                 Invitations automatically expire after 7 days. Only administrators can dispatch new access credentials.
              </p>
           </div>
        </div>
      </div>

      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Dispatch Invitation">
        <div className="space-y-8">
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Associate Email *</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary outline-none transition-all" 
                placeholder="name@aurelius.estate" 
              />
           </div>
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Permission Tier</label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="w-full bg-slate-50 rounded-xl py-3 px-4 text-sm font-bold shadow-sm outline-none border-none"
              >
                 <option value="member">Associate (Member)</option>
                 <option value="admin">Partner (Admin)</option>
              </select>
           </div>
           <div className="flex justify-end gap-4 pt-4">
              <Button variant="secondary" onClick={() => setShowInviteModal(false)}>Cancel</Button>
              <Button variant="primary" size="lg" onClick={handleInvite} disabled={!formData.email}>
                Dispatch Signal
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default TeamSettings;
