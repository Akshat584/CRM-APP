import React, { useState } from 'react';
import { useDeals, useUpdateDeal, useCreateDeal, useDeleteDeal } from '../hooks/useDeals';
import { useContacts } from '../hooks/useContacts';
import { useCRM } from '../context/CRMContext';
import { useEffect } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { formatCurrency, getStageColor } from '../utils/format';

const Pipeline = () => {
  const { refreshTrigger, setGlobalAction, refreshData } = useCRM();
  const { data: deals, loading, refetch } = useDeals({ trigger: refreshTrigger });
  const { data: contacts } = useContacts({ limit: 100 });
  const { createDeal, loading: creating } = useCreateDeal();
  const { deleteDeal, loading: deleting } = useDeleteDeal();
  
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
  const { updateDeal } = useUpdateDeal();
  const [draggedDeal, setDraggedDeal] = useState(null);

  const stages = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won'];

  const groupedDeals = stages.reduce((acc, stage) => {
    acc[stage] = deals?.filter(deal => deal.stage === stage) || [];
    return acc;
  }, {});

  const handleDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (stage) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      await updateDeal(draggedDeal.id, { stage });
      refreshData();
    }
    setDraggedDeal(null);
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '16px'
      }}>
        {stages.map((stage) => (
          <div key={stage} style={{
            minWidth: '280px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '12px'
          }}>
            <div style={{
              padding: '12px',
              background: 'var(--bg-surface2)',
              borderRadius: '8px',
              marginBottom: '12px'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '700',
                color: getStageColor(stage)
              }}>
                {stage}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="view-content">
      <div className="kanban-board">
        {stages.map((stage) => {
          const stageDeals = groupedDeals[stage] || [];
          const stageValue = stageDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);

          return (
            <div
              key={stage}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(stage)}
              style={{
                borderColor: draggedDeal && draggedDeal.stage !== stage ? '#4f8ef7' : '#232736',
                backgroundColor: draggedDeal && draggedDeal.stage !== stage ? 'rgba(79, 142, 247, 0.05)' : '#111318'
              }}
            >
              <div
                className="kanban-column-header"
                style={{ borderColor: getStageColor(stage) }}
              >
                <span
                  className="kanban-column-title"
                  style={{ color: getStageColor(stage) }}
                >
                  {stage}
                </span>
                <span className="kanban-column-count">{stageDeals.length}</span>
                <span className="kanban-column-value">{formatCurrency(stageValue)}</span>
              </div>

              <div className="kanban-cards">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="deal-card"
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    onClick={() => { setSelectedDeal(deal); setFormData({ title: deal.title, company: deal.company, value: deal.value, stage: deal.stage, probability: deal.probability, contact_id: deal.contact_id }); setShowEditModal(true); }}
                  >
                    <div className="deal-card-title">{deal.title}</div>
                    <div className="deal-card-contact">
                      {deal.company}
                    </div>
                    <div className="deal-card-value">
                      {formatCurrency(deal.value)}
                    </div>
                    {deal.probability && (
                      <div className="deal-card-probability">
                        {deal.probability}% chance
                      </div>
                    )}
                    <div className="deal-card-progress">
                      <div
                        className="deal-card-progress-bar"
                        style={{
                          width: `${deal.probability || 0}%`,
                          backgroundColor: getStageColor(deal.stage)
                        }}
                      />
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && (
                  <div className="empty-state">No deals</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Deal Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Add New Deal"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                await createDeal(formData);
                setShowCreateModal(false);
                refreshData();
              }}
              disabled={creating || !formData.title || !formData.contact_id}
            >
              {creating ? 'Saving...' : 'Save Deal'}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Title *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Contact *</label>
            <select value={formData.contact_id} onChange={e => setFormData({...formData, contact_id: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="">Select a contact...</option>
              {contacts?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Company</label>
            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Value ($)</label>
            <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Stage</label>
            <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Probability (%)</label>
            <input type="number" value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
        </div>
      </Modal>

      {/* Edit Deal Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Deal"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="danger" onClick={async () => {
              if (window.confirm('Delete this deal?')) {
                await deleteDeal(selectedDeal.id);
                setShowEditModal(false);
                refreshData();
              }
            }} disabled={deleting}>{deleting ? '...' : 'Delete'}</Button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={async () => {
                  await updateDeal(selectedDeal.id, formData);
                  setShowEditModal(false);
                  refreshData();
                }}
                disabled={!formData.title}
              >
                Save Changes
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Title *</label>
            <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Contact *</label>
            <select value={formData.contact_id} onChange={e => setFormData({...formData, contact_id: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              {contacts?.map(c => <option key={c.id} value={c.id}>{c.name} ({c.company})</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Company</label>
            <input type="text" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Value ($)</label>
            <input type="number" value={formData.value} onChange={e => setFormData({...formData, value: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Stage</label>
            <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              {stages.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Probability (%)</label>
            <input type="number" value={formData.probability} onChange={e => setFormData({...formData, probability: Number(e.target.value)})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Pipeline;