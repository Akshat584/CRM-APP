import React from 'react';

const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: '14px',
          width: '90%',
          maxWidth: '460px',
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3
            style={{
              fontFamily: 'Syne, sans-serif',
              fontWeight: '700',
              fontSize: '18px',
              color: 'var(--text-primary)',
              margin: 0
            }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-surface2)',
              border: 'none',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {children}
        </div>
        {footer && (
          <div
            style={{
              padding: '20px 24px',
              borderTop: '1px solid var(--border-default)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px'
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;