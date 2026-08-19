import React, { useState, useCallback } from 'react';
import { LogOut, LayoutGrid } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Theme Toggle Hook ─────────────────────────────────────────────────────────
export const useTheme = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('es-theme') || 'dark';
  });

  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('es-theme', next);
      if (next === 'light') {
        document.documentElement.dataset.theme = 'light';
      } else {
        delete document.documentElement.dataset.theme;
      }
      return next;
    });
  }, []);

  return { theme, toggle };
};

// ── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 3rem', height: '64px',
      background: 'var(--anchor)',
      borderBottom: '2px solid var(--structure)',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
        <div style={{
          width: '2rem', height: '2rem',
          border: '1px solid var(--pop)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <LayoutGrid size={14} color="var(--pop)" />
        </div>
        <div>
          <p style={{
            fontFamily: "'VT323', monospace",
            fontSize: '1.5rem', color: 'var(--structure)',
            letterSpacing: '0.05em', lineHeight: 1,
            textTransform: 'uppercase',
          }}>
            EVENTSPHERE
          </p>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.4375rem', color: 'var(--structure)',
            letterSpacing: '0.16em', opacity: 0.45, textTransform: 'uppercase',
            marginTop: '0.125rem',
          }}>
            {user?.role?.replace('ROLE_', '') || 'PORTAL'}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* User identity */}
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.5625rem', fontWeight: 700,
          color: 'var(--structure)', letterSpacing: '0.08em', textTransform: 'uppercase',
          opacity: 0.6,
        }}>
          {user?.name || 'USER'}
        </p>

        {/* Theme toggle */}
        <button
          className="theme-toggle"
          onClick={toggle}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        {/* Sign out */}
        <button
          className="grit-btn"
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            height: '2.5rem', padding: '0 1.25rem',
            background: 'transparent', border: '2px solid var(--dim-border)',
            color: 'var(--structure)',
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
          }}
        >
          <LogOut size={11} />
          SIGN OUT
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
