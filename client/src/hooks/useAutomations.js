import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

export const useAutomations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchAutomations = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/automations');
      setData(res.data.data);
    } catch (err) {
      console.error('Fetch automations error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createAutomation = async (formData) => {
    try {
      const res = await apiClient.post('/automations', formData);
      setData(prev => [res.data.data, ...prev]);
      addToast('Automation protocol initialized', 'success');
      return { success: true };
    } catch (err) {
      addToast('Failed to initialize automation', 'error');
      return { success: false };
    }
  };

  const toggleAutomation = async (id, is_active) => {
    try {
      await apiClient.patch(`/automations/${id}/toggle`, { is_active });
      setData(prev => prev.map(a => a.id === id ? { ...a, is_active } : a));
      addToast(`Protocol ${is_active ? 'Activated' : 'Suspended'}`, 'success');
    } catch (err) {
      addToast('Toggle failed', 'error');
    }
  };

  const deleteAutomation = async (id) => {
    try {
      await apiClient.delete(`/automations/${id}`);
      setData(prev => prev.filter(a => a.id !== id));
      addToast('Protocol terminated', 'success');
    } catch (err) {
      addToast('Termination failed', 'error');
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  return { data, loading, createAutomation, toggleAutomation, deleteAutomation, refetch: fetchAutomations };
};
