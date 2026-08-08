import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        height: '4rem',
        background: 'rgba(5,5,5,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: '1.75rem', height: '1.75rem',
          borderRadius: '0.5rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#FAFAFA' }} />
        </div>
        <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#FAFAFA' }}>
          Event<span style={{ color: '#71717A' }}>Sphere</span>
        </span>
      </div>

      {/* User info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '2rem', height: '2rem',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User style={{ width: '0.875rem', height: '0.875rem', color: '#D4D4D8' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#FAFAFA', lineHeight: 1.2 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.6875rem', color: '#71717A', lineHeight: 1.2 }}>
              {user?.role?.replace('ROLE_', '')}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.625rem',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            color: '#71717A',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#FAFAFA'; e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#71717A'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        >
          <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
          Sign out
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
