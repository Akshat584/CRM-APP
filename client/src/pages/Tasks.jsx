import React, { useState, useEffect } from 'react';
import { useTasks, useUpdateTask, useCreateTask, useDeleteTask } from '../hooks/useTasks';
import { useCRM } from '../context/CRMContext';
import Modal from '../components/Modal';
import Button from '../components/Button';
import { formatDate } from '../utils/format';

const Tasks = () => {
  const { refreshTrigger, setGlobalAction, refreshData } = useCRM();
  const { data: tasks, loading, refetch } = useTasks({ trigger: refreshTrigger });
  const { createTask } = useCreateTask();
  const { updateTask } = useUpdateTask();
  const { deleteTask } = useDeleteTask();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', priority: 'Medium', status: 'Todo', due_date: '', notes: '' });

  useEffect(() => {
    setGlobalAction(() => () => {
      setFormData({ title: '', priority: 'Medium', status: 'Todo', due_date: '', notes: '' });
      setShowCreateModal(true);
    });
    return () => setGlobalAction(null);
  }, [setGlobalAction]);

  useEffect(() => { refetch(); }, [refreshTrigger]);

  const todoTasks = tasks?.filter(task => task.status === 'Todo') || [];
  const inProgressTasks = tasks?.filter(task => task.status === 'In Progress') || [];
  const doneTasks = tasks?.filter(task => task.status === 'Done') || [];

  const handleStatusChange = async (taskId, newStatus) => {
    await updateTask(taskId, { status: newStatus });
    refreshData();
  };

  const renderTaskColumn = (title, columnTasks) => (
    <div className="flex-1 min-w-[350px] bg-slate-50 rounded-3xl p-6">
      <div className="flex justify-between items-center mb-8 px-2">
        <span className="text-[10px] font-black uppercase tracking-widest text-primary opacity-60">{title}</span>
        <span className="text-[10px] font-bold text-slate-300">{columnTasks.length}</span>
      </div>
      <div className="flex flex-col gap-4">
        {columnTasks.map((task) => (
          <div key={task.id} className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-4">
               <h4 className="text-sm font-bold text-on-surface line-clamp-2">{task.title}</h4>
               <span className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter ${
                 task.priority === 'High' ? 'bg-error-container text-error' : 'bg-slate-100 text-slate-400'
               }`}>
                 {task.priority}
               </span>
            </div>
            
            {task.notes && (
              <p className="text-[11px] text-on-surface-variant mb-6 line-clamp-3 opacity-70 italic">"{task.notes}"</p>
            )}

            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                {task.due_date ? formatDate(task.due_date) : 'Open Schedule'}
              </span>
              <div className="flex gap-4">
                {task.status !== 'Done' && (
                   <button 
                    onClick={() => handleStatusChange(task.id, task.status === 'Todo' ? 'In Progress' : 'Done')}
                    className="text-primary hover:scale-110 transition-transform"
                   >
                     <span className="material-symbols-outlined text-lg">check_circle</span>
                   </button>
                )}
                <button 
                  onClick={() => { 
                    setSelectedTask(task); 
                    setFormData({ title: task.title, priority: task.priority, status: task.status, due_date: task.due_date ? task.due_date.substring(0,10) : '', notes: task.notes || '' }); 
                    setShowEditModal(true); 
                  }}
                  className="text-slate-300 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">edit_note</span>
                </button>
              </div>
            </div>
          </div>
        ))}
        {columnTasks.length === 0 && (
          <div className="py-12 text-center text-slate-200 text-[10px] font-black uppercase tracking-widest border-2 border-dashed border-slate-100 rounded-2xl">Sequence Clear</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="view-content animate-slideIn">
      <section className="mb-12">
        <p className="text-primary font-bold tracking-[0.3em] text-[10px] uppercase mb-2">Operational Workflow</p>
        <div className="flex items-end justify-between">
          <h2 className="text-6xl font-extrabold text-on-surface tracking-tighter">Queue.</h2>
          <div className="flex gap-4">
             <Button variant="primary" onClick={() => setShowCreateModal(true)}>Add Assignment</Button>
          </div>
        </div>
      </section>

      <div className="flex gap-6 overflow-x-auto pb-12">
        {renderTaskColumn('Pending', todoTasks)}
        {renderTaskColumn('In Progress', inProgressTasks)}
        {renderTaskColumn('Completed', doneTasks)}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Assignment">
        <div className="space-y-12">
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Operational Description</label>
              <input 
                type="text" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary outline-none transition-all" 
                placeholder="What needs to be accomplished?" 
              />
           </div>
           <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Target Date</label>
                <input type="date" value={formData.due_date} onChange={e => setFormData({...formData, due_date: e.target.value})} className="w-full bg-slate-50 rounded-xl py-4 px-5 text-sm font-bold shadow-sm" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Priority Level</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 rounded-xl py-4 px-5 text-sm font-bold shadow-sm">
                  <option value="High">Strategic (High)</option>
                  <option value="Medium">Standard (Medium)</option>
                  <option value="Low">Auxiliary (Low)</option>
                </select>
              </div>
           </div>
           <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Contextual Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full bg-slate-50 rounded-2xl py-4 px-5 min-h-[120px] text-sm outline-none" />
           </div>
           <Button variant="primary" fullWidth size="lg" onClick={async () => {
              await createTask(formData);
              setShowCreateModal(false);
              refreshData();
           }}>Initialize Assignment</Button>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Update Assignment">
        <div className="space-y-12">
           <div className="group">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 group-focus-within:text-primary">Operational Description</label>
              <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full text-xl font-semibold py-3 border-b-2 border-slate-100 focus:border-primary outline-none transition-all" />
           </div>
           <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Priority Level</label>
                <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full bg-slate-50 rounded-xl py-4 px-5 text-sm font-bold shadow-sm">
                  <option value="High">Strategic (High)</option>
                  <option value="Medium">Standard (Medium)</option>
                  <option value="Low">Auxiliary (Low)</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Workflow Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 rounded-xl py-4 px-5 text-sm font-bold shadow-sm">
                  <option value="Todo">Pending</option>
                  <option value="In Progress">Active</option>
                  <option value="Done">Completed</option>
                </select>
              </div>
           </div>
           <div className="flex gap-4 pt-8 border-t border-slate-100">
              <Button variant="primary" fullWidth size="lg" onClick={async () => {
                 await updateTask(selectedTask.id, formData);
                 setShowEditModal(false);
                 refreshData();
              }}>Commit Changes</Button>
              <Button variant="danger" size="lg" onClick={async () => {
                if (window.confirm('Erase this assignment record?')) {
                  await deleteTask(selectedTask.id);
                  setShowEditModal(false);
                  refreshData();
                }
              }}>Remove</Button>
           </div>
        </div>
      </Modal>
    </div>
  );
};

export default Tasks;
