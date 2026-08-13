import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import GlassInput from '../components/ui/GlassInput.jsx';
import GlassButton from '../components/ui/GlassButton.jsx';
import ScrollBounceText from '../components/ui/ScrollBounceText.jsx';

const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

// ── Ambient background ───────────────────────────────────────────────────────
const Background = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
    <div style={{
      position: 'absolute', top: '-20%', left: '-10%',
      width: 700, height: 700, borderRadius: '50%',
      background: 'rgba(99,102,241,0.06)', filter: 'blur(120px)',
    }} />
    <div style={{
      position: 'absolute', bottom: '-15%', right: '-5%',
      width: 500, height: 500, borderRadius: '50%',
      background: 'rgba(139,92,246,0.05)', filter: 'blur(90px)',
    }} />
    <div style={{
      position: 'absolute', top: '40%', right: '25%',
      width: 300, height: 300, borderRadius: '50%',
      background: 'rgba(99,102,241,0.03)', filter: 'blur(60px)',
    }} />
    {/* Grid */}
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.02 }}>
      <defs>
        <pattern id="admin-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#admin-grid)" />
    </svg>
  </div>
);

// ── Admin Login Page ─────────────────────────────────────────────────────────
const AdminLoginPage = () => {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ email: '', password: '' });

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      // Verify the logged-in user is actually an admin
      if (user?.role !== 'ROLE_ADMIN') {
        setError('Access denied. This portal is for administrators only.');
        localStorage.removeItem('eventsphere_token');
        localStorage.removeItem('eventsphere_user');
        return;
      }
      navigate('/admin/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data
        || err?.message
        || 'Invalid credentials. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="admin-login-page"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-primary)',
        overflow: 'hidden',
      }}
    >
      <Background />

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ...SPRING }}
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          marginBottom: '2.5rem',
          padding: '0.375rem 1rem 0.375rem 0.625rem',
          borderRadius: '999px',
          background: 'rgba(99,102,241,0.08)',
          border: '1px solid rgba(99,102,241,0.2)',
        }}
      >
        <div style={{
          width: '2rem', height: '2rem', borderRadius: '50%',
          background: 'rgba(99,102,241,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Shield style={{ width: '1rem', height: '1rem', color: '#a5b4fc' }} />
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#a5b4fc', letterSpacing: '0.02em' }}>
          EventSphere · Admin Portal
        </span>
      </motion.div>

      {/* Glass card */}
      <motion.div
        layout
        transition={SPRING}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '420px',
          margin: '0 1rem',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          background: 'rgba(var(--glass-rgb),0.04)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(99,102,241,0.15)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(var(--glass-rgb),0.10)',
        }}
      >
        {/* Specular highlight */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(165,180,252,0.25), transparent)',
        }} />

        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em', color: 'var(--color-text-primary)' }}>
              <ScrollBounceText as="span" intensity={0.8} maxSkewDeg={2} maxTranslateY={3} stiffness={360} damping={36}>
                Administrator Login
              </ScrollBounceText>
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', marginTop: '0.375rem', lineHeight: 1.6 }}>
              Restricted access — System Administrators only.
            </p>
          </div>

          {/* Form */}
          <form id="admin-login-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <GlassInput
              id="admin-email"
              name="email"
              type="email"
              placeholder="Admin email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              icon={Mail}
            />
            <GlassInput
              id="admin-password"
              name="password"
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              icon={Lock}
            />

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  style={{
                    fontSize: '0.8125rem',
                    color: '#f87171',
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: '0.75rem',
                    padding: '0.75rem 1rem',
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <div style={{ paddingTop: '0.5rem' }}>
              <GlassButton
                type="submit"
                loading={loading}
                variant="primary"
                id="admin-login-submit"
                style={{ width: '100%' }}
              >
                Sign in as Admin
                <ArrowRight style={{ width: '1rem', height: '1rem' }} />
              </GlassButton>
            </div>
          </form>

          {/* Back link */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                fontSize: '0.875rem', color: 'var(--color-text-subtle)',
                background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-subtle)')}
            >
              ← Back to regular login
            </button>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'relative', zIndex: 10,
          marginTop: '2rem',
          fontSize: '0.75rem',
          color: '#3f3f46',
        }}
      >
        © 2026 EventSphere · Enterprise Event Platform
      </motion.p>
    </div>
  );
};

export default AdminLoginPage;
