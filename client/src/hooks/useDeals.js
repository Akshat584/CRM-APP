import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { dealsAPI } from '../api/deals';

export const useDeals = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dealsAPI.getDeals(params);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, [params.stage, params.page, params.limit]);

  return { data, loading, error, refetch: fetchDeals };
};

export const useCreateDeal = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createDeal = async (dealData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dealsAPI.createDeal(dealData);
      addToast('Deal created successfully', 'success');
      addToast('Deal updated successfully', 'success');
      addToast('Deal deleted successfully', 'success');
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create deal';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createDeal, loading, error };
};

export const useUpdateDeal = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDeal = async (id, dealData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await dealsAPI.updateDeal(id, dealData);
      addToast('Deal created successfully', 'success');
      addToast('Deal updated successfully', 'success');
      addToast('Deal deleted successfully', 'success');
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update deal';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateDeal, loading, error };
};

export const useDeleteDeal = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteDeal = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await dealsAPI.deleteDeal(id);
      addToast('Deal created successfully', 'success');
      addToast('Deal updated successfully', 'success');
      addToast('Deal deleted successfully', 'success');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete deal';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { deleteDeal, loading, error };
};