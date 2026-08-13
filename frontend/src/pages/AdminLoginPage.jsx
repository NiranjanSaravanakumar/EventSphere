import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import GlassInput from '../components/ui/GlassInput.jsx';
import GlassButton from '../components/ui/GlassButton.jsx';
import ScrollBounceText from '../components/ui/ScrollBounceText.jsx';
import adminHero from '../assets/admin_login_hero.png';

const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

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
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        background: 'var(--color-bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* ── Left Panel — Hero Image ──────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="admin-left-panel"
        style={{
          flex: '0 0 50%',
          position: 'relative',
          overflow: 'hidden',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Background image */}
        <img
          src={adminHero}
          alt="EventSphere Admin Dashboard"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />

        {/* Dark gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(15,10,40,0.78) 100%)',
        }} />

        {/* Subtle grid */}
        <svg
          aria-hidden
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04 }}
        >
          <defs>
            <pattern id="admin-left-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#admin-left-grid)" />
        </svg>
        {/* Top — Logo Overlay */}
        <div style={{
          position: 'absolute',
          top: '2.5rem',
          left: '2.5rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem'
        }}>
          <div style={{
            width: '2.25rem', height: '2.25rem',
            borderRadius: '0.625rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(12px)',
          }}>
            <Sparkles style={{ width: '1.1rem', height: '1.1rem', color: '#fff' }} />
          </div>
          <span style={{
            fontSize: '1.25rem', fontWeight: 700,
            letterSpacing: '-0.025em', color: '#fff',
          }}>
            Event<span style={{ color: 'rgba(255,255,255,0.5)' }}>Sphere</span>
          </span>
        </div>

        {/* End of left panel content */}
      </motion.div>

      {/* ── Right Panel — Login Form ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="admin-right-panel"
        style={{
          flex: '0 0 50%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient blobs */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{
            position: 'absolute', top: '-15%', right: '-10%',
            width: 500, height: 500, borderRadius: '50%',
            background: 'rgba(var(--glass-rgb),0.025)', filter: 'blur(100px)',
          }} />
          <div style={{
            position: 'absolute', bottom: '-10%', left: '-5%',
            width: 350, height: 350, borderRadius: '50%',
            background: 'rgba(var(--glass-rgb),0.018)', filter: 'blur(80px)',
          }} />
          {/* Grid */}
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.018 }}>
            <defs>
              <pattern id="admin-right-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#admin-right-grid)" />
          </svg>
        </div>

        {/* Vertical divider */}
        <div style={{
          position: 'absolute', left: 0, top: '10%', bottom: '10%', width: '1px',
          background: 'linear-gradient(to bottom, transparent, rgba(var(--glass-rgb),0.12), transparent)',
        }} />

        {/* Inner form container */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '400px' }}>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, ...SPRING }}
            style={{ marginBottom: '2.25rem' }}
          >
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.875rem',
              borderRadius: '999px',
              background: 'rgba(var(--glass-rgb),0.08)',
              border: '1px solid rgba(var(--glass-rgb),0.2)',
              marginBottom: '1.25rem',
            }}>
              <Shield style={{ width: '0.8rem', height: '0.8rem', color: 'var(--color-text-primary)' }} />
              <span style={{
                fontSize: '0.75rem', fontWeight: 600,
                color: 'var(--color-text-primary)', letterSpacing: '0.04em',
              }}>
                RESTRICTED ACCESS
              </span>
            </div>

            <h1 style={{
              fontSize: '1.875rem', fontWeight: 700,
              letterSpacing: '-0.03em', color: 'var(--color-text-primary)',
              lineHeight: 1.2, marginBottom: '0.5rem',
            }}>
              <ScrollBounceText as="span" intensity={0.8} maxSkewDeg={2} maxTranslateY={3} stiffness={360} damping={36}>
                Administrator Login
              </ScrollBounceText>
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-subtle)', lineHeight: 1.6 }}>
              Sign in with your admin credentials to access the control panel.
            </p>
          </motion.div>

          {/* Glass card */}
          <motion.div
            layout
            transition={SPRING}
            style={{
              position: 'relative',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              background: 'rgba(var(--glass-rgb),0.04)',
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              border: '1px solid rgba(var(--glass-rgb),0.15)',
              boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(var(--glass-rgb),0.10)',
            }}
          >
            {/* Specular highlight */}
            <div style={{
              position: 'absolute', left: 0, right: 0, top: 0, height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(var(--glass-rgb),0.25), transparent)',
            }} />

            <div style={{ padding: '2rem' }}>
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
            </div>
          </motion.div>

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

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            style={{
              marginTop: '2.5rem',
              textAlign: 'center',
              fontSize: '0.75rem',
              color: '#3f3f46',
            }}
          >
            © 2026 EventSphere · Enterprise Event Platform
          </motion.p>
        </div>
      </motion.div>

      {/* ── Responsive: hide left panel on mobile ────────────────────────────── */}
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

