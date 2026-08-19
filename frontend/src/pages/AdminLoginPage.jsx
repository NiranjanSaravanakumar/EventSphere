import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

// ── Film Grain ────────────────────────────────────────────────────────────────
const FilmGrain = () => (
  <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 997, opacity: 0.06, mixBlendMode: 'overlay' }}>
    <filter id="adm-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter="url(#adm-grain)" />
  </svg>
);

// ── Theme toggle ──────────────────────────────────────────────────────────────
const useTheme = () => {
  const [theme, setTheme] = useState(() => localStorage.getItem('es-theme') || 'dark');
  const toggle = useCallback(() => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem('es-theme', next);
      if (next === 'light') document.documentElement.dataset.theme = 'light';
      else delete document.documentElement.dataset.theme;
      return next;
    });
  }, []);
  return { theme, toggle };
};

// ── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, type = 'text', id, name, value, onChange, placeholder, autoComplete, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label htmlFor={id} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)' }}>
      {label}
    </label>
    <input
      id={id} type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder} autoComplete={autoComplete} required={required}
      className="grit-input"
      style={{ width: '100%', height: '3rem', padding: '0 1rem', fontSize: '0.8125rem' }}
    />
  </div>
);

// ── Admin Login Page ──────────────────────────────────────────────────────────
const AdminLoginPage = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const { theme, toggle } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ email: '', password: '' });

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const user = await login(form.email, form.password);
      if (user?.role !== 'ROLE_ADMIN') {
        setError('ACCESS DENIED. ADMIN CREDENTIALS REQUIRED.');
        localStorage.removeItem('eventsphere_token');
        localStorage.removeItem('eventsphere_user');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'INVALID CREDENTIALS.';
      setError(typeof msg === 'string' ? msg.toUpperCase() : 'AUTHENTICATION FAILED.');
    } finally { setLoading(false); }
  };

  return (
    <div id="admin-login-page" style={{ minHeight: '100vh', width: '100%', display: 'flex', background: 'var(--anchor)', overflow: 'hidden' }}>
      <FilmGrain />

      {/* Theme toggle */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 200 }}>
        <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      {/* ── LEFT PANEL — 60/30/10 COMPLIANT ─────────────────────────────── */}
      {/* FIXED: was background: var(--pop) — 50% screen violation */}
      {/* Now: --anchor background (60%), --pop used ONLY for border, badge, and eyebrow text (10%) */}
      <div
        className="admin-left-panel"
        style={{ flex: '0 0 50%', position: 'relative', overflow: 'hidden', minHeight: '100vh', background: 'var(--anchor)', borderRight: '2px solid var(--pop)' }}
      >
        {/* Grid texture */}
        <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
          <defs><pattern id="admin-left-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#admin-left-grid)" style={{ color: 'var(--structure)' }} />
        </svg>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '2.5rem' }}>
          {/* Brand */}
          <div>
            <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', letterSpacing: '0.05em', lineHeight: 1 }}>EVENTSPHERE</p>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', color: 'var(--pop)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '0.375rem' }}>ADMIN CONSOLE</p>
          </div>

          {/* Center eyebrow */}
          <div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '1rem' }}>
              CLASSIFIED :: ADMIN SECTOR
            </p>
            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(4rem, 7vw, 6rem)', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1.0, letterSpacing: '0.04em' }}>
              CONTROL<br />PANEL<br />ACCESS
            </h1>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.55, letterSpacing: '0.06em', lineHeight: 1.8, marginTop: '1.5rem', maxWidth: '320px' }}>
              GLOBAL ANALYTICS · ALL EVENT CODES · FULL USER DIRECTORY · AUDIT LOG
            </p>
          </div>

          {/* Warning banner */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.875rem 1rem', border: '1px solid var(--pop)' }}>
            <Shield size={13} color="var(--pop)" />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pop)' }}>
              RESTRICTED ACCESS — ADMIN CREDENTIALS REQUIRED
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ───────────────────────────────────────────── */}
      <div
        className="admin-right-panel"
        style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 2rem', position: 'relative' }}
      >
        {/* Grid texture */}
        <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }}>
          <defs><pattern id="admin-right-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#admin-right-grid)" style={{ color: 'var(--structure)' }} />
        </svg>

        {/* Form container */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--pop)', padding: '0.35rem 0.875rem', marginBottom: '1.25rem' }}>
              <Shield size={11} color="var(--pop)" />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pop)' }}>
                RESTRICTED ACCESS
              </span>
            </div>
            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1.0, marginBottom: '0.75rem' }}>
              ADMINISTRATOR<br />LOGIN
            </h1>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.5, letterSpacing: '0.06em', lineHeight: 1.7 }}>
              SIGN IN WITH ADMIN CREDENTIALS TO ACCESS THE CONTROL PANEL.
            </p>
          </div>

          {/* Form card */}
          <div style={{ background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: '12px 12px 0px var(--ink)' }}>
            <div style={{ padding: '2rem' }}>
              <form id="admin-login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <Field label="ADMIN EMAIL" type="email" id="admin-email" name="email" value={form.email} onChange={handleChange} placeholder="admin@eventsphere.com" autoComplete="email" required />
                <Field label="PASSWORD" type="password" id="admin-password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete="current-password" required />

                {error && (
                  <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', border: '1px solid var(--structure)', padding: '0.75rem 1rem', letterSpacing: '0.04em', opacity: 0.8 }}>
                    !! {error}
                  </p>
                )}

                <button
                  id="admin-login-submit"
                  type="submit" className="grit-btn" disabled={loading}
                  style={{
                    width: '100%', height: '3rem', marginTop: '0.25rem',
                    background: 'var(--pop)', border: '2px solid var(--pop)',
                    color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                    boxShadow: 'var(--shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    opacity: loading ? 0.65 : 1, cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? (
                    <span className="spin-grit" style={{ display: 'inline-block', width: '0.875rem', height: '0.875rem', border: '2px solid var(--anchor)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  ) : (
                    <>SIGN IN AS ADMIN <ArrowRight size={12} /></>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Back link */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <button type="button" onClick={() => navigate('/login')}
              style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.35, background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity = '0.35'}
            >
              ← BACK TO REGULAR LOGIN
            </button>
          </div>

          <p style={{ marginTop: '2.5rem', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.2 }}>
            © 2026 EVENTSPHERE · ENTERPRISE EVENT PLATFORM
          </p>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-left-panel  { display: none !important; }
          .admin-right-panel { flex: 0 0 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default AdminLoginPage;
