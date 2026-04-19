const fs = require('fs');
const path = require('path');

const pipelineFile = path.join(__dirname, 'client/src/pages/Pipeline.jsx');
let content = fs.readFileSync(pipelineFile, 'utf8');

content = content.replace(
  "import { useDeals, useUpdateDeal } from '../hooks/useDeals';",
  "import { useDeals, useUpdateDeal, useCreateDeal, useDeleteDeal } from '../hooks/useDeals';\nimport { useContacts } from '../hooks/useContacts';\nimport { useCRM } from '../context/CRMContext';\nimport { useEffect } from 'react';\nimport Modal from '../components/Modal';\nimport Button from '../components/Button';"
);

content = content.replace(
  "const { data: deals, loading } = useDeals({});",
  `const { refreshTrigger, setGlobalAction, refreshData } = useCRM();
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

  useEffect(() => { refetch(); }, [refreshTrigger]);`
);

content = content.replace(
  "const handleDrop = async (stage) => {\n    if (draggedDeal && draggedDeal.stage !== stage) {\n      await updateDeal(draggedDeal.id, { stage });\n    }\n    setDraggedDeal(null);\n  };",
  `const handleDrop = async (stage) => {
    if (draggedDeal && draggedDeal.stage !== stage) {
      await updateDeal(draggedDeal.id, { stage });
      refreshData();
    }
    setDraggedDeal(null);
  };`
);

content = content.replace(
  "onDragStart={() => handleDragStart(deal)}",
  "onDragStart={() => handleDragStart(deal)}\n                    onClick={() => { setSelectedDeal(deal); setFormData({ title: deal.title, company: deal.company, value: deal.value, stage: deal.stage, probability: deal.probability, contact_id: deal.contact_id }); setShowEditModal(true); }}"
);

const modalCode = `
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
};`;

content = content.replace("    </div>\n  );\n};\n\nexport default Pipeline;", modalCode + "\n\nexport default Pipeline;");

fs.writeFileSync(pipelineFile, content);
console.log('Patched Pipeline.jsx');
