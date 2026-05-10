import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/campaigns');
      setCampaigns(res.data.data);
    } catch (err) {
      console.error('Failed to fetch campaigns', err);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (data) => {
    try {
      setLoading(true);
      const res = await apiClient.post('/campaigns', data);
      setCampaigns(prev => [res.data.data, ...prev]);
      addToast('Campaign draft created', 'success');
      return { success: true, data: res.data.data };
    } catch (err) {
      addToast('Failed to create campaign', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const startCampaign = async (id) => {
    try {
      setLoading(true);
      const res = await apiClient.post(`/campaigns/${id}/start`);
      addToast(res.data.data.message, 'success');
      await fetchCampaigns();
      return { success: true };
    } catch (err) {
      addToast('Failed to start campaign', 'error');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    createCampaign,
    startCampaign,
    refetch: fetchCampaigns
  };
};
