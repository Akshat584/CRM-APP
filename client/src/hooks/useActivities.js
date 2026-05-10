import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { activitiesAPI } from '../api/activities';

export const useActivities = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await activitiesAPI.getActivities(params);
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [params.type, params.page, params.limit]);

  return { data, loading, error, refetch: fetchActivities };
};

export const useCreateActivity = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createActivity = async (activityData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await activitiesAPI.createActivity(activityData);
      addToast('Activity created successfully', 'success');
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create activity';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createActivity, loading, error };
};

export const useDeleteActivity = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteActivity = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await activitiesAPI.deleteActivity(id);
      addToast('Activity deleted successfully', 'success');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete activity';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { deleteActivity, loading, error };
};