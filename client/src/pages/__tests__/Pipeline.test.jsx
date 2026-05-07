import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pipeline from '../Pipeline';
import { useDeals, useCreateDeal, useUpdateDeal, useDeleteDeal } from '../../hooks/useDeals';
import { useContacts } from '../../hooks/useContacts';
import { useCRM } from '../../context/CRMContext';

import { vi } from 'vitest';

vi.mock('../../hooks/useDeals');
vi.mock('../../hooks/useContacts');
vi.mock('../../context/CRMContext');

describe('Pipeline Component', () => {
  const mockSetGlobalAction = vi.fn();
  const mockRefreshData = vi.fn();
  const mockCreateDeal = vi.fn();
  const mockUpdateDeal = vi.fn();
  const mockDeleteDeal = vi.fn();

  beforeEach(() => {
    useCRM.mockReturnValue({
      setGlobalAction: mockSetGlobalAction,
      refreshTrigger: 0,
      refreshData: mockRefreshData
    });

    useCreateDeal.mockReturnValue({ createDeal: mockCreateDeal });
    useUpdateDeal.mockReturnValue({ updateDeal: mockUpdateDeal });
    useDeleteDeal.mockReturnValue({ deleteDeal: mockDeleteDeal });

    useContacts.mockReturnValue({
      data: [{ id: 'c1', name: 'John Doe', company: 'Acme Corp' }]
    });

    useDeals.mockReturnValue({
      data: [
        { id: '1', title: 'Deal 1', company: 'Acme', value: 1000, stage: 'New', probability: 50 },
        { id: '2', title: 'Deal 2', company: 'Globex', value: 2000, stage: 'Negotiation', probability: 80 }
      ],
      loading: false,
      refetch: vi.fn()
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders pipeline stages and deals', () => {
    render(<Pipeline />);
    expect(screen.getByText('Pipeline.')).toBeInTheDocument();
    expect(screen.getByText('Deal 1')).toBeInTheDocument();
    expect(screen.getByText('Deal 2')).toBeInTheDocument();
  });

  it('opens create modal when New Opportunity is clicked', () => {
    render(<Pipeline />);
    const addButton = screen.getByText('New Opportunity');
    fireEvent.click(addButton);
    expect(screen.getByText('Initialize Opportunity')).toBeInTheDocument();
  });

  it('opens edit modal when a deal is clicked', () => {
    render(<Pipeline />);
    const deal1 = screen.getByText('Deal 1');
    fireEvent.click(deal1);
    expect(screen.getByText('Update Opportunity')).toBeInTheDocument();
    expect(screen.getByText('Commit Changes')).toBeInTheDocument();
  });
});
