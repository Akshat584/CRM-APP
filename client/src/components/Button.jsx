import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseStyles = {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: "'DM Sans', sans-serif"
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' }
  };

  const variantStyles = {
    primary: {
      background: 'var(--accent-blue)',
      color: 'white',
      opacity: disabled || loading ? 0.6 : 1
    },
    secondary: {
      background: 'transparent',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-default)',
      opacity: disabled || loading ? 0.6 : 1
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      opacity: disabled || loading ? 0.6 : 1
    },
    danger: {
      background: 'var(--color-danger)',
      color: 'white',
      opacity: disabled || loading ? 0.6 : 1
    }
  };

  const hoverStyles = {
    primary: { background: '#3a7ae0' },
    secondary: { background: 'var(--bg-surface2)' },
    ghost: { color: 'var(--text-primary)' },
    danger: { background: '#ef4444' }
  };

  const style = {
    ...baseStyles,
    ...sizeStyles[size],
    ...variantStyles[variant]
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      style={style}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          if (variantStyles[variant]) {
            Object.assign(e.currentTarget.style, hoverStyles[variant]);
          }
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        if (!disabled && !loading) {
          Object.assign(e.currentTarget.style, variantStyles[variant]);
        }
      }}
      {...props}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite'
        }} />
      )}
      {children}
    </button>
  );
};

export default Button;