import React from 'react';
import styles from './EnhancedUI.module.css';

const Button3D = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false, 
  className = '',
  ...props 
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary':
        return styles.btn3dSecondary;
      case 'success':
        return styles.btn3dSuccess;
      default:
        return styles.btn3dPrimary;
    }
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.btn3d} ${getVariantClass()} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button3D;