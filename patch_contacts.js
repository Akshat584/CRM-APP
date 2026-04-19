const fs = require('fs');
const path = require('path');

const contactsFile = path.join(__dirname, 'client/src/pages/Contacts.jsx');
let content = fs.readFileSync(contactsFile, 'utf8');

// 1. Add missing imports
content = content.replace(
  "import { useCreateContact } from '../hooks/useContacts';",
  "import { useCreateContact, useUpdateContact, useDeleteContact } from '../hooks/useContacts';\nimport { useCRM } from '../context/CRMContext';"
);

// 2. Add states and hooks
content = content.replace(
  "const [showModal, setShowModal] = useState(false);",
  `const [showCreateModal, setShowCreateModal] = useState(false);
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
  }, [setGlobalAction]);`
);

// 3. Add effect dependency for refreshTrigger
content = content.replace(
  "limit: 20\n  });",
  "limit: 20,\n    trigger: refreshTrigger\n  });"
);

// 4. Update table click to just select contact for detail panel, or maybe we don't change that.
// 5. Add Modal rendering at the end of the return statement
const modalCode = `
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
};`;

content = content.replace("    </>\n  );\n};", modalCode);

// 6. Add Edit and Delete buttons to the detail panel
const editDeleteButtons = `
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
`;

content = content.replace(
  "              </div>\n            )}\n          </div>\n        </div>\n      )}",
  "              </div>\n            )}\n" + editDeleteButtons
);

fs.writeFileSync(contactsFile, content);
console.log('Patched Contacts.jsx');
