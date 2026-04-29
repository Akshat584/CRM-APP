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
  fullWidth = false,
  ...props
}) => {
  const variants = {
    primary: 'bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20',
    secondary: 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest',
    tertiary: 'bg-transparent text-primary hover:bg-primary/5',
    danger: 'bg-error text-white hover:opacity-90 shadow-lg shadow-error/20',
    outline: 'border border-outline-variant text-on-surface hover:bg-surface-container-low'
  };

  const sizes = {
    sm: 'px-4 py-2 text-[10px]',
    md: 'px-6 py-3 text-xs',
    lg: 'px-10 py-4 text-sm'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-95
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
