import React from 'react';
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from '../hooks/useTasks';
import { useContacts } from '../hooks/useContacts';
import { useDeals } from '../hooks/useDeals';
import { useCRM } from '../context/CRMContext';
import { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { getPriorityColor, formatDate } from '../utils/format';

const Tasks = () => {
  const { refreshTrigger, setGlobalAction, refreshData } = useCRM();
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

  useEffect(() => { refetch(); }, [refreshTrigger]);
  const { updateTask } = useUpdateTask();

  const todoTasks = tasks?.filter(task => task.status === 'Todo') || [];
  const inProgressTasks = tasks?.filter(task => task.status === 'In Progress') || [];
  const doneTasks = tasks?.filter(task => task.status === 'Done') || [];

  const isOverdue = (dueDate, status) => {
    if (!dueDate || status === 'Done') return false;
    return new Date(dueDate) < new Date();
  };

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
    refreshData();
  };

  if (loading) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '24px'
      }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <div style={{
              height: '20px',
              background: 'var(--bg-surface2)',
              borderRadius: '8px',
              marginBottom: '16px',
              animation: 'pulse 2s ease-in-out infinite'
            }} />
          </div>
        ))}
      </div>
    );
  }

  const renderTaskColumn = (title, count, tasks) => (
    <div className="task-column">
      <div className="task-column-header">
        <span className="task-column-title">{title}</span>
        <span className="task-column-count">{count}</span>
      </div>
      <div className="task-cards">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="task-card"
            style={{
              borderLeftColor: isOverdue(task.due_date, task.status)
                ? '#f87171'
                : getPriorityColor(task.priority)
            }}
          >
            <div className="task-card-header">
              <h4 className="task-card-title">{task.title}</h4>
            </div>
            {task.contact_id && (
              <div className="task-card-contact">Linked to contact</div>
            )}
            <div className="task-card-footer">
              <span
                className="task-card-priority"
                style={{
                  backgroundColor: `${getPriorityColor(task.priority)}20`,
                  color: getPriorityColor(task.priority)
                }}
              >
                {task.priority}
              </span>
              <span
                className="task-card-due"
                style={{
                  color: isOverdue(task.due_date, task.status)
                    ? '#f87171'
                    : '#8b90a7'
                }}
              >
                {task.due_date ? formatDate(task.due_date) : 'No due date'}
              </span>
            </div>
            {task.status === 'Todo' && (
              <div className="task-card-actions">
                <button
                  className="task-action-button"
                  onClick={() => handleStatusChange(task.id, 'In Progress')}
                >
                  Start
                </button>
              </div>
            )}
            {task.status === 'In Progress' && (
              <div className="task-card-actions">
                <button
                  className="task-action-button task-action-button-secondary"
                  onClick={() => handleStatusChange(task.id, 'Todo')}
                >
                  Back
                </button>
                <button
                  className="task-action-button"
                  onClick={() => handleStatusChange(task.id, 'Done')}
                >
                  Complete
                </button>
              </div>
            )}
            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
              <button style={{ background: 'transparent', border: '1px solid var(--border-emphasis)', color: 'var(--text-primary)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }} onClick={() => { setSelectedTask(task); setFormData({ title: task.title, priority: task.priority, status: task.status, due_date: task.due_date ? task.due_date.substring(0,10) : '', contact_id: task.contact_id || '', deal_id: task.deal_id || '', notes: task.notes || '' }); setShowEditModal(true); }}>Edit</button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="empty-state">
            No {title.toLowerCase()} tasks
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="view-content">
      <div className="task-swimlanes">
        {renderTaskColumn('To Do', todoTasks.length, todoTasks)}
        {renderTaskColumn('In Progress', inProgressTasks.length, inProgressTasks)}
        {renderTaskColumn('Done', doneTasks.length, doneTasks)}
      </div>

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
};

export default Tasks;