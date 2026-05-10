import React from 'react';
import { getInitials, getAvatarColor } from '../utils/format';

const Avatar = ({ name, initials: initialsProp, size = 'md', style = {} }) => {
  const sizeMap = {
    sm: { width: '24px', height: '24px', fontSize: '10px' },
    md: { width: '36px', height: '36px', fontSize: '13px' },
    lg: { width: '48px', height: '48px', fontSize: '16px' },
    xl: { width: '80px', height: '80px', fontSize: '32px' }
  };

  const initials = initialsProp || getInitials(name);
  const backgroundColor = getAvatarColor(name);

  return (
    <div
      style={{
        width: sizeMap[size].width,
        height: sizeMap[size].height,
        borderRadius: '50%',
        backgroundColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: '700',
        color: 'white',
        fontSize: sizeMap[size].fontSize,
        ...style
      }}
    >
      {initials}
    </div>
  );
};

export default Avatar;