import React from 'react';

const Table = ({ columns, data, onRowClick, loading }) => {
  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{
          animation: 'pulse 2s ease-in-out infinite',
          color: 'var(--text-secondary)'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        No data available
      </div>
    );
  }

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-default)',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
        gap: columns.map(() => '16px').join(' '),
        padding: '16px',
        background: 'var(--bg-surface2)',
        borderBottom: '1px solid var(--border-default)',
        fontSize: '12px',
        color: 'var(--text-muted)',
        fontWeight: '500'
      }}>
        {columns.map((column, index) => (
          <div key={index}>{column.header}</div>
        ))}
      </div>
      {data.map((row, rowIndex) => (
        <div
          key={rowIndex}
          onClick={() => onRowClick && onRowClick(row)}
          style={{
            display: 'grid',
            gridTemplateColumns: columns.map(col => col.width || '1fr').join(' '),
            gap: columns.map(() => '16px').join(' '),
            padding: '16px',
            borderBottom: '1px solid var(--border-default)',
            cursor: onRowClick ? 'pointer' : 'default',
            transition: 'background 0.15s ease'
          }}
          onMouseEnter={(e) => {
            if (onRowClick) {
              e.currentTarget.style.background = 'var(--bg-surface2)';
            }
          }}
          onMouseLeave={(e) => {
            if (onRowClick) {
              e.currentTarget.style.background = 'transparent';
            }
          }}
        >
          {columns.map((column, colIndex) => (
            <div key={colIndex}>
              {column.render ? column.render(row) : row[column.key]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Table;