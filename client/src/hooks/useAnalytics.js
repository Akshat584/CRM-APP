import { useState, useEffect } from 'react';
import { analyticsAPI } from '../api/analytics';

export const useAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getDashboardAnalytics();
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { data, loading, error, refetch: fetchAnalytics };
};

export const usePipelineAnalytics = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPipelineAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsAPI.getPipelineAnalytics();
      setData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch pipeline analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineAnalytics();
  }, []);

  return { data, loading, error, refetch: fetchPipelineAnalytics };
};

export const useAdvancedFunnel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdvancedFunnel = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getAdvancedFunnel();
      setData(response.data.data);
    } catch (err) {
      console.error('Failed to fetch advanced funnel', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvancedFunnel();
  }, []);

  return { data, loading, refetch: fetchAdvancedFunnel };
};