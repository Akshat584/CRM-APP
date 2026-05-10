import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

export const useEmails = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/emails', { params });
      setData(res.data.data);
    } catch (err) {
      console.error('Fetch emails error:', err);
    } finally {
      setLoading(false);
    }
  };

  const sendEmail = async (formData) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/emails/send', formData);
      setData(prev => [res.data.data, ...prev]);
      addToast('Email dispatched successfully', 'success');
      return { success: true };
    } catch (err) {
      addToast('Failed to dispatch email', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return { data, loading, sendEmail, refetch: fetchEmails };
};
