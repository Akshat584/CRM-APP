import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

export const useProperties = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/properties');
      setData(res.data.data);
    } catch (err) {
      console.error('Fetch properties error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createProperty = async (formData) => {
    try {
      const res = await apiClient.post('/properties', formData);
      setData(prev => [res.data.data, ...prev]);
      addToast('Property listing created', 'success');
      return { success: true };
    } catch (err) {
      addToast('Failed to create property', 'error');
      return { success: false };
    }
  };

  const updateProperty = async (id, formData) => {
    try {
      const res = await apiClient.put(`/properties/${id}`, formData);
      setData(prev => prev.map(p => p.id === id ? res.data.data : p));
      addToast('Property updated', 'success');
      return { success: true };
    } catch (err) {
      addToast('Failed to update property', 'error');
      return { success: false };
    }
  };

  const deleteProperty = async (id) => {
    try {
      await apiClient.delete(`/properties/${id}`);
      setData(prev => prev.filter(p => p.id !== id));
      addToast('Property removed', 'success');
      return { success: true };
    } catch (err) {
      addToast('Failed to remove property', 'error');
      return { success: false };
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return { data, loading, createProperty, updateProperty, deleteProperty, refetch: fetchProperties };
};
