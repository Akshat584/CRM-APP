import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';

export const useNotifications = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      // In a real app, this would be a dedicated endpoint
      // For now, we simulate by fetching upcoming tasks/deals
      const [tasksRes, dealsRes] = await Promise.all([
        apiClient.get('/tasks'),
        apiClient.get('/deals')
      ]);

      const tasks = tasksRes.data.data || [];
      const deals = dealsRes.data.data || [];

      const notifications = [
        ...tasks
          .filter(t => t.status !== 'Done')
          .map(t => ({
            id: t.id,
            title: 'Task Due',
            body: t.title,
            date: t.due_date,
            type: 'task',
            priority: t.priority
          })),
        ...deals
          .filter(d => d.stage !== 'Closed Won' && d.stage !== 'Closed Lost')
          .map(d => ({
            id: d.id,
            title: 'Deal Milestone',
            body: d.title,
            date: d.due_date,
            type: 'deal',
            priority: 'Medium'
          }))
      ].sort((a, b) => new Date(a.date) - new Date(b.date));

      setData(notifications);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { data, loading, refetch: fetchNotifications };
};
