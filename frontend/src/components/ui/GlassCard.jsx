import React from 'react';
import { motion } from 'framer-motion';

const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

const glassStyle = {
  background: 'rgba(var(--glass-rgb),0.04)',
  backdropFilter: 'blur(32px)',
  WebkitBackdropFilter: 'blur(32px)',
  border: '1px solid rgba(var(--glass-rgb),0.08)',
  boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 0 0 rgba(var(--glass-rgb),0.10)',
};

const GlassCard = ({ children, hoverable = false, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      whileHover={hoverable ? { scale: 1.01 } : undefined}
      whileTap={onClick ? { scale: 0.99 } : undefined}
      transition={SPRING}
      style={{
        position: 'relative',
        borderRadius: '1rem',
        overflow: 'hidden',
        cursor: hoverable ? 'pointer' : 'default',
        ...glassStyle,
      }}
    >
      {/* Top-edge specular highlight */}
      <div style={{
        position: 'absolute',
        inset: '0 0 auto 0',
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(var(--glass-rgb),0.20), transparent)',
      }} />
      {children}
    </motion.div>
  );
};

export default GlassCard;
