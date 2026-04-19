import React from 'react';

const Badge = ({ children, color, variant = 'filled', style = {} }) => {
  const getColorStyle = (color) => {
    const colorMap = {
      blue: '#4f8ef7',
      purple: '#a78bfa',
      green: '#10b981',
      amber: '#f59e0b',
      red: '#f87171',
      orange: '#f97316'
    };
    return colorMap[color] || colorMap.blue;
  };

  const badgeColor = typeof color === 'string' && !color.startsWith('#') ? getColorStyle(color) : color;

  const baseStyle = {
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '500',
    display: 'inline-block'
  };

  const variantStyle = variant === 'filled'
    ? {
        backgroundColor: badgeColor + '20',
        color: badgeColor
      }
    : {
        backgroundColor: 'transparent',
        color: badgeColor,
        border: `1px solid ${badgeColor}`
      };

  return (
    <span style={{ ...baseStyle, ...variantStyle, ...style }}>
      {children}
    </span>
  );
};

export default Badge;