import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, LogOut, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

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
        background: 'rgba(var(--glass-rgb), 0.05)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(var(--glass-rgb),0.07)',
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
        <div style={{
          width: '1.75rem', height: '1.75rem',
          borderRadius: '0.5rem',
          background: 'rgba(var(--glass-rgb),0.08)',
          border: '1px solid rgba(var(--glass-rgb),0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-text-primary)' }} />
        </div>
        <span style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
          Event<span style={{ color: 'var(--color-text-subtle)' }}>Sphere</span>
        </span>
      </div>

      {/* User info + logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
          <div style={{
            width: '2rem', height: '2rem',
            borderRadius: '50%',
            background: 'rgba(var(--glass-rgb),0.08)',
            border: '1px solid rgba(var(--glass-rgb),0.10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <User style={{ width: '0.875rem', height: '0.875rem', color: 'var(--color-text-primary)' }} />
          </div>
          <div>
            <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--color-text-primary)', lineHeight: 1.2 }}>
              {user?.name}
            </p>
            <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-subtle)', lineHeight: 1.2 }}>
              {user?.role?.replace('ROLE_', '')}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: '2rem', height: '2rem',
            borderRadius: '0.625rem',
            background: 'rgba(var(--glass-rgb),0.05)',
            border: '1px solid rgba(var(--glass-rgb),0.08)',
            color: 'var(--color-text-subtle)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = 'rgba(var(--glass-rgb),0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-subtle)'; e.currentTarget.style.background = 'rgba(var(--glass-rgb),0.05)'; }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun style={{ width: '0.875rem', height: '0.875rem' }} /> : <Moon style={{ width: '0.875rem', height: '0.875rem' }} />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.375rem',
            padding: '0.375rem 0.75rem',
            borderRadius: '0.625rem',
            background: 'rgba(var(--glass-rgb),0.05)',
            border: '1px solid rgba(var(--glass-rgb),0.08)',
            color: 'var(--color-text-subtle)',
            fontSize: '0.8125rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-text-primary)'; e.currentTarget.style.background = 'rgba(var(--glass-rgb),0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-subtle)'; e.currentTarget.style.background = 'rgba(var(--glass-rgb),0.05)'; }}
        >
          <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
          Sign out
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default Navbar;
