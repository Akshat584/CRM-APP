import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContacts } from '../hooks/useContacts';
import { useContact } from '../hooks/useContacts';
import { useCreateContact, useUpdateContact, useDeleteContact } from '../hooks/useContacts';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, getStatusColor } from '../utils/format';
import Table from '../components/Table';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Avatar from '../components/Avatar';

const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '', status: 'Lead', lifetime_value: 0, tags: '' });
  
  const { setGlobalAction, refreshTrigger, refreshData } = useCRM();
  const { createContact, loading: creating } = useCreateContact();
  const { updateContact, loading: updating } = useUpdateContact();
  const { deleteContact, loading: deleting } = useDeleteContact();

  useEffect(() => {
    setGlobalAction(() => () => {
      setFormData({ name: '', email: '', phone: '', company: '', status: 'Lead', lifetime_value: 0, tags: '' });
      setShowCreateModal(true);
    });
    return () => setGlobalAction(null);
  }, [setGlobalAction]);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();

  const { data: contacts, loading } = useContacts({
    search: debouncedSearch,
    status: statusFilter,
    limit: 20,
    trigger: refreshTrigger
  });

  const { data: contactDetails } = useContact(selectedContact?.id);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const columns = [
    {
      header: 'Contact',
      key: 'name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar name={row.name} />
          <div>
            <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '2px' }}>
              {row.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      header: 'Company',
      key: 'company',
      render: (row) => row.company || '-'
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span style={{
          padding: '4px 8px',
          backgroundColor: `${getStatusColor(row.status)}20`,
          color: getStatusColor(row.status),
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Lifetime Value',
      key: 'lifetime_value',
      render: (row) => formatCurrency(row.lifetime_value || 0)
    },
    {
      header: 'Tags',
      key: 'tags',
      render: (row) => (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {row.tags?.map((tag, i) => (
            <span key={i} style={{
              padding: '2px 6px',
              background: 'var(--bg-surface2)',
              border: '1px solid var(--border-emphasis)',
              borderRadius: '4px',
              fontSize: '10px',
              color: 'var(--text-secondary)'
            }}>
              {tag}
            </span>
          ))}
        </div>
      )
    },
    {
      header: 'Phone',
      key: 'phone',
      render: (row) => row.phone || '-'
    }
  ];

  const handleRowClick = (contact) => {
    setSelectedContact(contact);
  };

  const getActionButtonLabel = () => '+ Add Contact';

  return (
    <>
      <div className="view-content">
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search contacts by name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
              marginBottom: '16px'
            }}
          />

          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '10px 12px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: '6px',
                color: 'var(--text-primary)',
                fontSize: '14px'
              }}
            >
              <option value="">All Statuses</option>
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
              <option value="Churned">Churned</option>
            </select>
          </div>
        </div>

        <Table
          columns={columns}
          data={contacts}
          loading={loading}
          onRowClick={handleRowClick}
        />
      </div>

      {selectedContact && contactDetails && (
        <div className="detail-panel">
          <div className="detail-header">
            <div className="detail-close" onClick={() => setSelectedContact(null)}>✕</div>
          </div>
          <div className="detail-content">
            <Avatar name={selectedContact.name} size="xl" />
            <h2 className="detail-name">{selectedContact.name}</h2>
            <div className="detail-info-grid">
              <div className="detail-info-item">
                <div className="detail-info-label">Email</div>
                <div className="detail-info-value">{selectedContact.email || '-'}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Phone</div>
                <div className="detail-info-value">{selectedContact.phone || '-'}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Company</div>
                <div className="detail-info-value">{selectedContact.company || '-'}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Status</div>
                <span style={{
                  padding: '4px 8px',
                  backgroundColor: `${getStatusColor(selectedContact.status)}20`,
                  color: getStatusColor(selectedContact.status),
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '500'
                }}>
                  {selectedContact.status}
                </span>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Lifetime Value</div>
                <div className="detail-info-value">{formatCurrency(selectedContact.lifetime_value || 0)}</div>
              </div>
              <div className="detail-info-item">
                <div className="detail-info-label">Tags</div>
                <div className="detail-info-value">
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {selectedContact.tags?.map((tag, i) => (
                      <span key={i} style={{
                        padding: '2px 6px',
                        background: 'var(--bg-surface2)',
                        border: '1px solid var(--border-emphasis)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: 'var(--text-secondary)'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {contactDetails.deals && contactDetails.deals.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Related Deals</div>
                <div className="related-list">
                  {contactDetails.deals.map((deal) => (
                    <div key={deal.id} className="related-item">
                      <div className="related-item-info">
                        <div className="related-item-title">{deal.title}</div>
                        <div className="related-item-subtitle">{deal.company}</div>
                      </div>
                      <div className="related-item-right">
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#4f8ef720',
                          color: '#4f8ef7',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {deal.stage}
                        </span>
                        <div className="related-item-value">{formatCurrency(deal.value)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contactDetails.recent_activities && contactDetails.recent_activities.length > 0 && (
              <div className="detail-section">
                <div className="detail-section-title">Activity History</div>
                <div className="activity-list">
                  {contactDetails.recent_activities.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'call' && '📞'}
                        {activity.type === 'email' && '✉️'}
                        {activity.type === 'meeting' && '🗓'}
                        {activity.type === 'note' && '📝'}
                        {activity.type === 'task' && '✅'}
                      </div>
                      <div className="activity-content">
                        <div className="activity-note">{activity.body}</div>
                        <div className="activity-time">
                          {new Date(activity.activity_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <Button variant="secondary" onClick={() => {
                setFormData({
                  name: selectedContact.name || '',
                  email: selectedContact.email || '',
                  phone: selectedContact.phone || '',
                  company: selectedContact.company || '',
                  status: selectedContact.status || 'Lead',
                  lifetime_value: selectedContact.lifetime_value || 0,
                  tags: (selectedContact.tags || []).join(', ')
                });
                setShowEditModal(true);
              }}>Edit Contact</Button>
              <Button variant="danger" onClick={async () => {
                if (window.confirm('Are you sure you want to delete this contact?')) {
                  await deleteContact(selectedContact.id);
                  setSelectedContact(null);
                  refreshData();
                }
              }} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Create Contact Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Add New Contact"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                await createContact({ ...formData, tags: tagsArray });
                setShowCreateModal(false);
                refreshData();
              }}
              disabled={creating || !formData.name || !formData.email}
            >
              {creating ? 'Saving...' : 'Save Contact'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email *</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Phone</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Company</label>
            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
              <option value="Churned">Churned</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
            <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Enterprise, Tech" style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
        </div>
      </Modal>

      {/* Edit Contact Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Contact"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
                await updateContact(selectedContact.id, { ...formData, tags: tagsArray });
                setShowEditModal(false);
                setSelectedContact({...selectedContact, ...formData, tags: tagsArray});
                refreshData();
              }}
              disabled={updating || !formData.name || !formData.email}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Email *</label>
            <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Phone</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Company</label>
            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="Lead">Lead</option>
              <option value="Prospect">Prospect</option>
              <option value="Customer">Customer</option>
              <option value="Churned">Churned</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Lifetime Value</label>
            <input type="number" value={formData.lifetime_value} onChange={e => setFormData({...formData, lifetime_value: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Tags (comma separated)</label>
            <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="e.g. Enterprise, Tech" style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Contacts;