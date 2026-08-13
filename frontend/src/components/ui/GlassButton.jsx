import React from 'react';
import { motion } from 'framer-motion';

const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

const GlassButton = ({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  style,
  ...props
}) => {
  const primaryStyle = {
    background: 'var(--color-text-primary)',
    color: 'var(--color-bg-primary)',
  };

  const ghostStyle = {
    background: 'rgba(var(--glass-rgb),0.05)',
    border: '1px solid rgba(var(--glass-rgb),0.08)',
    color: 'var(--color-text-primary)',
  };

  const baseStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    height: '3rem',
    padding: '0 1.5rem',
    borderRadius: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.025em',
    fontSize: '0.875rem',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    transition: 'background 0.2s, opacity 0.2s',
    border: 'none',
    outline: 'none',
    ...(variant === 'primary' ? primaryStyle : ghostStyle),
    ...style,
  };

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.01 } : undefined}
      whileTap={!disabled ? { scale: 0.97 } : undefined}
      transition={SPRING}
      disabled={disabled || loading}
      style={baseStyle}
      className={className}
      {...props}
    >
      {loading && (
        <span style={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{
            width: '1rem', height: '1rem',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </span>
      )}
      <span style={{ opacity: loading ? 0 : 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {children}
      </span>
    </motion.button>
  );
};

export default GlassButton;
