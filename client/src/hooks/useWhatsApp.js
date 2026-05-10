import { useState, useEffect, useCallback } from 'react';
import apiClient from '../api/apiClient';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';

export const useWhatsApp = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [team, setTeam] = useState([]);
  const socket = useSocket();
  const { addToast } = useToast();

  const fetchConversations = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await apiClient.get('/whatsapp/conversations', { params: filters });
      setConversations(res.data.data);
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await apiClient.get(`/whatsapp/conversations/${conversationId}/messages`);
      setMessages(res.data.data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const fetchTemplates = async () => {
    try {
      const res = await apiClient.get('/whatsapp/templates');
      setTemplates(res.data.data);
    } catch (err) {
      console.error('Failed to fetch templates', err);
    }
  };

  const fetchTeam = async () => {
    try {
      const res = await apiClient.get('/whatsapp/team');
      setTeam(res.data.data);
    } catch (err) {
      console.error('Failed to fetch team', err);
    }
  };

  const assignConversation = async (conversationId, userId) => {
    try {
      await apiClient.put(`/whatsapp/conversations/${conversationId}/assign`, { userId });
      addToast('Conversation assigned', 'success');
      // Update local state
      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, assigned_to: userId === 'unassigned' ? null : userId } : c
      ));
      if (activeConversation?.id === conversationId) {
        setActiveConversation(prev => ({ ...prev, assigned_to: userId === 'unassigned' ? null : userId }));
      }
    } catch (err) {
      addToast('Failed to assign conversation', 'error');
    }
  };

  const syncTemplates = async () => {
    try {
      setLoading(true);
      await apiClient.post('/whatsapp/templates/sync');
      await fetchTemplates();
      addToast('Templates synced from Meta', 'success');
    } catch (err) {
      addToast('Failed to sync templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchTemplates();
    fetchTeam();
  }, []);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation]);

  useEffect(() => {
    if (socket) {
      const handleNewMessage = (payload) => {
        // Update messages if this is the active conversation
        if (activeConversation && payload.conversationId === activeConversation.id) {
          setMessages(prev => [...prev, payload.message]);
        }
        
        // Update conversations list (move to top, update last message)
        setConversations(prev => {
          const idx = prev.findIndex(c => c.id === payload.conversationId);
          if (idx > -1) {
            const updated = [...prev];
            updated[idx] = { 
              ...updated[idx], 
              last_message: payload.message.content,
              last_message_at: payload.message.created_at
            };
            return [updated[idx], ...updated.filter((_, i) => i !== idx)];
          } else {
            // If it's a new conversation, we might need to refetch or manually add it
            fetchConversations();
            return prev;
          }
        });

        if (!activeConversation || payload.conversationId !== activeConversation.id) {
          addToast(`New WhatsApp message from ${payload.phone}`, 'info');
        }
      };

      const handleStatusUpdate = (payload) => {
        if (activeConversation && payload.conversationId === activeConversation.id) {
          setMessages(prev => prev.map(m => 
            m.id === payload.messageId ? { ...m, status: payload.status } : m
          ));
        }
      };

      socket.on('whatsapp:message', handleNewMessage);
      socket.on('whatsapp:status', handleStatusUpdate);
      return () => {
        socket.off('whatsapp:message', handleNewMessage);
        socket.off('whatsapp:status', handleStatusUpdate);
      };
    }
  }, [socket, activeConversation]);

  const sendMessage = async (phone, content, type = 'text', templateData = {}) => {
    try {
      const res = await apiClient.post('/whatsapp/messages', {
        phone,
        content,
        type,
        ...templateData,
        contact_id: activeConversation?.contact_id
      });
      
      const newMessage = res.data.data;
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversations list
      setConversations(prev => {
        const idx = prev.findIndex(c => c.id === newMessage.conversation_id);
        if (idx > -1) {
          const updated = [...prev];
          updated[idx] = { 
            ...updated[idx], 
            last_message: newMessage.content,
            last_message_at: newMessage.created_at
          };
          return [updated[idx], ...updated.filter((_, i) => i !== idx)];
        }
        return prev;
      });

      return { success: true };
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to send message';
      addToast(msg, 'error');
      return { success: false, error: msg };
    }
  };

  const uploadMedia = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/whatsapp/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return { success: true, data: res.data.data };
    } catch (err) {
      addToast('Failed to upload media', 'error');
      return { success: false };
    }
  };

  const getAISummary = async (conversationId) => {
    try {
      const res = await apiClient.get(`/ai/summarize/${conversationId}`);
      return { success: true, data: res.data.data };
    } catch (err) {
      addToast('AI Intelligence failed to load', 'error');
      return { success: false };
    }
  };

  return {
    conversations,
    messages,
    activeConversation,
    setActiveConversation,
    loading,
    templates,
    team,
    assignConversation,
    syncTemplates,
    sendMessage,
    uploadMedia,
    getAISummary,
    refetchConversations: fetchConversations
  };
};
