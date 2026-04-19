import React, { useState } from 'react';
import { useActivities, useCreateActivity } from '../hooks/useActivities';
import { useContacts } from '../hooks/useContacts';
import { useDeals } from '../hooks/useDeals';
import { useCRM } from '../context/CRMContext';
import { useEffect } from 'react';
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
  const { data: deals } = useDeals({});
  const { createActivity, loading: creating } = useCreateActivity();
  
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
    <div className="view-content">
      <div className="activity-filters">
        {activityTypes.map((filter) => (
          <button
            key={filter}
            className={`filter-button ${typeFilter === filter ? 'active' : ''}`}
            onClick={() => setTypeFilter(filter)}
          >
            {filter === 'All' ? 'All' : filter + 's'}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: '16px',
                padding: '16px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                animation: 'pulse 2s ease-in-out infinite'
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'var(--bg-surface2)',
                  borderRadius: '8px'
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: '14px',
                    background: 'var(--bg-surface2)',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    width: '60%'
                  }}
                />
                <div
                  style={{
                    height: '13px',
                    background: 'var(--bg-surface2)',
                    borderRadius: '4px',
                    width: '90%'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="activity-feed">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-entry">
              <div className="activity-type-icon">
                {activity.type === 'call' && '📞'}
                {activity.type === 'email' && '✉️'}
                {activity.type === 'meeting' && '🗓'}
                {activity.type === 'note' && '📝'}
                {activity.type === 'task' && '✅'}
              </div>
              <div className="activity-entry-content">
                <div className="activity-entry-header">
                  <span className="activity-entry-contact">
                    {activity.subject || 'Activity'}
                  </span>
                  <span className="activity-entry-badge">
                    {activity.type}
                  </span>
                  <span className="activity-entry-time">
                    {getRelativeTime(activity.activity_date)}
                  </span>
                </div>
                <div className="activity-entry-note">
                  {activity.body}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
            <div className="empty-state">
              No activities found
            </div>
          )}
        </div>
      )}

      {/* Create Activity Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Log Activity"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                await createActivity(formData);
                setShowCreateModal(false);
                refreshData();
              }}
              disabled={creating || !formData.subject || !formData.body || !formData.contact_id}
            >
              {creating ? 'Saving...' : 'Log Activity'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Type</label>
            <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="call">Call</option>
              <option value="email">Email</option>
              <option value="meeting">Meeting</option>
              <option value="note">Note</option>
              <option value="task">Task</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Subject *</label>
            <input type="text" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Related Contact *</label>
            <select value={formData.contact_id} onChange={e => setFormData({...formData, contact_id: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="">Select contact...</option>
              {contacts?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Related Deal</label>
            <select value={formData.deal_id} onChange={e => setFormData({...formData, deal_id: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="">None</option>
              {deals?.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Notes/Body *</label>
            <textarea value={formData.body} onChange={e => setFormData({...formData, body: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white', minHeight: '100px' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ActivityLog;