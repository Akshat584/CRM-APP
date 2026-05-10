import { useState, useEffect } from 'react';
import apiClient from '../api/apiClient';
import { useToast } from '../context/ToastContext';

export const useTeam = () => {
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/team');
      setMembers(res.data.data.members);
      setInvitations(res.data.data.invitations);
    } catch (err) {
      console.error('Fetch team error:', err);
    } finally {
      setLoading(false);
    }
  };

  const inviteMember = async (formData) => {
    try {
      await apiClient.post('/team/invite', formData);
      addToast('Invitation dispatched', 'success');
      fetchTeam();
      return { success: true };
    } catch (err) {
      addToast(err.response?.data?.error || 'Dispatch failed', 'error');
      return { success: false };
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  return { members, invitations, loading, inviteMember, refetch: fetchTeam };
};
