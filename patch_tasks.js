const fs = require('fs');
const path = require('path');

const tasksFile = path.join(__dirname, 'client/src/pages/Tasks.jsx');
let content = fs.readFileSync(tasksFile, 'utf8');

content = content.replace(
  "import { useTasks, useUpdateTask } from '../hooks/useTasks';",
  "import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from '../hooks/useTasks';\nimport { useContacts } from '../hooks/useContacts';\nimport { useDeals } from '../hooks/useDeals';\nimport { useCRM } from '../context/CRMContext';\nimport { useState, useEffect } from 'react';\nimport Modal from '../components/Modal';\nimport Button from '../components/Button';"
);

content = content.replace(
  "const { data: tasks, loading } = useTasks({});",
  `const { refreshTrigger, setGlobalAction, refreshData } = useCRM();
  const { data: tasks, loading, refetch } = useTasks({ trigger: refreshTrigger });
  const { data: contacts } = useContacts({ limit: 100 });
  const { data: deals } = useDeals({});
  const { createTask, loading: creating } = useCreateTask();
  const { deleteTask, loading: deleting } = useDeleteTask();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', priority: 'Medium', status: 'Todo', due_date: '', contact_id: '', deal_id: '', notes: '' });

  useEffect(() => {
    setGlobalAction(() => () => {
      setFormData({ title: '', priority: 'Medium', status: 'Todo', due_date: '', contact_id: '', deal_id: '', notes: '' });
      setShowCreateModal(true);
    });
    return () => setGlobalAction(null);
  }, [setGlobalAction]);

  useEffect(() => { refetch(); }, [refreshTrigger]);`
);

content = content.replace(
  "const handleStatusChange = async (taskId, newStatus) => {\n    await updateTask(taskId, { status: newStatus });\n  };",
  "const handleStatusChange = async (taskId, newStatus) => {\n    await updateTask(taskId, { status: newStatus });\n    refreshData();\n  };"
);

content = content.replace(
  `onClick={() => handleStatusChange(task.id, 'Done')}\n                >\n                  Complete\n                </button>\n              </div>\n            )}`,
  `onClick={() => handleStatusChange(task.id, 'Done')}\n                >\n                  Complete\n                </button>\n              </div>\n            )}\n            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button style={{ background: 'transparent', border: '1px solid var(--border-emphasis)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} onClick={() => { setSelectedTask(task); setFormData({ title: task.title, priority: task.priority, status: task.status, due_date: task.due_date ? task.due_date.substring(0,10) : '', contact_id: task.contact_id || '', deal_id: task.deal_id || '', notes: task.notes || '' }); setShowEditModal(true); }}>Edit</button>
            </div>`
);

const modalCode = `
      {/* Create Task Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        title="Add New Task"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={async () => {
                await createTask(formData);
                setShowCreateModal(false);
                refreshData();
              }}
              disabled={creating || !formData.title}
            >
              {creating ? 'Saving...' : 'Save Task'}
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Due Date</label>
            <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Priority</label>
            <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Related Contact</label>
            <select value={formData.contact_id} onChange={e => setFormData({...formData, contact_id: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="">None</option>
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white', minHeight: '80px' }} />
          </div>
        </div>
      </Modal>

      {/* Edit Task Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Task"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
            <Button variant="danger" onClick={async () => {
              if (window.confirm('Delete this task?')) {
                await deleteTask(selectedTask.id);
                setShowEditModal(false);
                refreshData();
              }
            }} disabled={deleting}>{deleting ? '...' : 'Delete'}</Button>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={async () => {
                  await updateTask(selectedTask.id, formData);
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Due Date</label>
            <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Priority</label>
            <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Related Contact</label>
            <select value={formData.contact_id} onChange={e => setFormData({...formData, contact_id: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white' }}>
              <option value="">None</option>
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
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-secondary)' }}>Notes</label>
            <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '10px', background: 'var(--bg-surface2)', border: '1px solid var(--border-default)', borderRadius: '6px', color: 'white', minHeight: '80px' }} />
          </div>
        </div>
      </Modal>
    </div>
  );
};`;

content = content.replace("    </div>\n  );\n};\n\nexport default Tasks;", modalCode + "\n\nexport default Tasks;");

fs.writeFileSync(tasksFile, content);
console.log('Patched Tasks.jsx');
