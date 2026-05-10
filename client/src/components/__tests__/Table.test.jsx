import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Table from '../Table';

describe('Table Component', () => {
  const columns = [
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' }
  ];

  const data = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Doe', email: 'jane@example.com' }
  ];

  it('should render loading state', () => {
    render(<Table columns={columns} data={[]} loading={true} />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<Table columns={columns} data={[]} loading={false} />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('should render headers and data rows', () => {
    render(<Table columns={columns} data={data} />);
    
    // Check headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();

    // Check row content
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('should handle row click events', () => {
    const onRowClick = vi.fn();
    render(<Table columns={columns} data={data} onRowClick={onRowClick} />);

    fireEvent.click(screen.getByText('John Doe'));
    expect(onRowClick).toHaveBeenCalledWith(data[0]);
  });

  it('should use custom render functions if provided', () => {
    const customColumns = [
      { 
        header: 'Profile', 
        render: (row) => <span data-testid="custom-render">{row.name} - {row.email}</span> 
      }
    ];

    render(<Table columns={customColumns} data={[data[0]]} />);
    const customCell = screen.getByTestId('custom-render');
    expect(customCell).toHaveTextContent('John Doe - john@example.com');
  });
});