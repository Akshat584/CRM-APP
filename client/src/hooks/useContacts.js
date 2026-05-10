import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { contactsAPI } from '../api/contacts';

export const useContacts = (params = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meta, setMeta] = useState({ count: 0, totalPages: 1 });

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsAPI.getContacts(params);
      setData(response.data.data);
      setMeta({ count: response.data.count || 0, totalPages: response.data.totalPages || 1 });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [params.search, params.status, params.page, params.limit]);

  return { data, loading, error, refetch: fetchContacts, meta };
};

export const useContact = (id) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchContact = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await contactsAPI.getContact(id);
        setData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch contact');
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [id]);

  return { data, loading, error };
};

export const useCreateContact = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createContact = async (contactData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsAPI.createContact(contactData);
      addToast('Contact created successfully', 'success');
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to create contact';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createContact, loading, error };
};

export const useUpdateContact = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateContact = async (id, contactData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await contactsAPI.updateContact(id, contactData);
      addToast('Contact updated successfully', 'success');
      return { success: true, data: response.data.data };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update contact';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { updateContact, loading, error };
};

export const useDeleteContact = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteContact = async (id) => {
    try {
      setLoading(true);
      setError(null);
      await contactsAPI.deleteContact(id);
      addToast('Contact deleted successfully', 'success');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete contact';
      setError(errorMessage);
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { deleteContact, loading, error };
};

export const useExportContacts = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const exportContacts = async () => {
    try {
      setLoading(true);
      const response = await contactsAPI.exportContacts();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'contacts_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast('Contacts exported successfully', 'success');
    } catch (err) {
      addToast('Failed to export contacts', 'error');
    } finally {
      setLoading(false);
    }
  };

  return { exportContacts, loading };
};

export const useImportContacts = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const importContacts = async (file) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      const response = await contactsAPI.importContacts(formData);
      addToast(response.data.data.message || 'Contacts imported successfully', 'success');
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to import contacts';
      addToast(errorMessage, 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { importContacts, loading };
};