import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Contacts from '../Contacts';
import { useContacts, useCreateContact, useExportContacts, useImportContacts } from '../../hooks/useContacts';
import { useCRM } from '../../context/CRMContext';

import { vi } from 'vitest';

// Mock the hooks
vi.mock('../../hooks/useContacts');
vi.mock('../../context/CRMContext');

describe('Contacts Component', () => {
  const mockSetGlobalAction = vi.fn();
  const mockRefreshData = vi.fn();
  const mockCreateContact = vi.fn();
  const mockExportContacts = vi.fn();
  const mockImportContacts = vi.fn();

  beforeEach(() => {
    useCRM.mockReturnValue({
      setGlobalAction: mockSetGlobalAction,
      refreshTrigger: 0,
      refreshData: mockRefreshData
    });

    useCreateContact.mockReturnValue({
      createContact: mockCreateContact
    });

    useExportContacts.mockReturnValue({
      exportContacts: mockExportContacts,
      loading: false
    });

    useImportContacts.mockReturnValue({
      importContacts: mockImportContacts,
      loading: false
    });

    useContacts.mockReturnValue({
      data: [
        { id: '1', name: 'John Doe', email: 'john@example.com', status: 'Lead', company: 'Acme Corp' }
      ],
      loading: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders contact list', () => {
    render(<Contacts />);
    expect(screen.getByText('Contacts')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('opens create modal when Add Contact is clicked', () => {
    render(<Contacts />);
    const addButton = screen.getByText('Add Contact');
    fireEvent.click(addButton);
    expect(screen.getByText('Initialize Record')).toBeInTheDocument(); // Button in modal
  });

  it('filters contacts by status when clicking status pills', () => {
    render(<Contacts />);
    const customerFilter = screen.getByText('Customer');
    fireEvent.click(customerFilter);
    expect(useContacts).toHaveBeenCalledWith(expect.objectContaining({
      status: 'Customer'
    }));
  });
});
