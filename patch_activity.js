const fs = require('fs');
const path = require('path');

const activityFile = path.join(__dirname, 'client/src/pages/ActivityLog.jsx');
let content = fs.readFileSync(activityFile, 'utf8');

content = content.replace(
  "import { useActivities } from '../hooks/useActivities';\nimport { useCreateActivity } from '../hooks/useActivities';",
  "import { useActivities, useCreateActivity } from '../hooks/useActivities';\nimport { useContacts } from '../hooks/useContacts';\nimport { useDeals } from '../hooks/useDeals';\nimport { useCRM } from '../context/CRMContext';\nimport { useEffect } from 'react';\nimport Modal from '../components/Modal';\nimport Button from '../components/Button';"
);

content = content.replace(
  "const [typeFilter, setTypeFilter] = useState('All');\n  const { data: activities, loading } = useActivities({\n    type: typeFilter === 'All' ? undefined : typeFilter.toLowerCase()\n  });",
  `const [typeFilter, setTypeFilter] = useState('All');
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

  useEffect(() => { refetch(); }, [refreshTrigger]);`
);

content = content.replace(
  "{filter}s",
  "{filter === 'All' ? 'All' : filter + 's'}"
);

const modalCode = `
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
};`;

content = content.replace("    </div>\n  );\n};\n\nexport default ActivityLog;", modalCode + "\n\nexport default ActivityLog;");

fs.writeFileSync(activityFile, content);
console.log('Patched ActivityLog.jsx');
