import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { tasksAPI } from '../api/tasks';

export const useTasks = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.getTasks(params);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [params.status, params.priority]);

  return { data, loading, error, refetch: fetchTasks };
};

export const useCreateTask = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createTask = async (taskData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.createTask(taskData);
      addToast('Task created successfully', 'success');
      addToast('Task updated successfully', 'success');
      addToast('Task deleted successfully', 'success');
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create task';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createTask, loading, error };
};

export const useUpdateTask = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateTask = async (id, taskData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await tasksAPI.updateTask(id, taskData);
      addToast('Task created successfully', 'success');
      addToast('Task updated successfully', 'success');
      addToast('Task deleted successfully', 'success');
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update task';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateTask, loading, error };
};

export const useDeleteTask = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteTask = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await tasksAPI.deleteTask(id);
      addToast('Task created successfully', 'success');
      addToast('Task updated successfully', 'success');
      addToast('Task deleted successfully', 'success');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete task';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { deleteTask, loading, error };
};