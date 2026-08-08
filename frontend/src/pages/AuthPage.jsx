import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import GlassInput from '../components/ui/GlassInput.jsx';
import GlassButton from '../components/ui/GlassButton.jsx';

// ── Spring config ────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

const FORM_VARIANTS = {
  initial: { opacity: 0, filter: 'blur(12px)', y: 24 },
  animate: { opacity: 1, filter: 'blur(0px)',  y: 0,   transition: SPRING },
  exit:    { opacity: 0, filter: 'blur(12px)', y: -16, transition: { duration: 0.2 } },
};

// ── Role pill ────────────────────────────────────────────────────────────────
const RolePill = ({ label, selected, onClick }) => (
  <motion.button
    type="button"
    onClick={onClick}
    whileTap={{ scale: 0.96 }}
    transition={SPRING}
    style={{
      flex: 1,
      height: '2.25rem',
      borderRadius: '0.5rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      cursor: 'pointer',
      border: selected ? 'none' : '1px solid rgba(255,255,255,0.08)',
      background: selected ? '#FAFAFA' : 'rgba(255,255,255,0.05)',
      color: selected ? '#050505' : '#D4D4D8',
      transition: 'all 0.2s',
    }}
  >
    {label}
  </motion.button>
);

// ── Ambient background ───────────────────────────────────────────────────────
const Background = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
    {/* Large diffuse orbs */}
    <div style={{
      position: 'absolute', top: '-20%', left: '-10%',
      width: 600, height: 600, borderRadius: '50%',
      background: 'rgba(255,255,255,0.025)', filter: 'blur(100px)',
    }} />
    <div style={{
      position: 'absolute', bottom: '-10%', right: '-5%',
      width: 500, height: 500, borderRadius: '50%',
      background: 'rgba(255,255,255,0.018)', filter: 'blur(80px)',
    }} />
    <div style={{
      position: 'absolute', top: '35%', right: '20%',
      width: 300, height: 300, borderRadius: '50%',
      background: 'rgba(255,255,255,0.012)', filter: 'blur(60px)',
    }} />
    {/* Subtle grid */}
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025 }}>
      <defs>
        <pattern id="eventsphere-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#eventsphere-grid)" />
    </svg>
  </div>
);

// ── Main AuthPage ─────────────────────────────────────────────────────────────
const AuthPage = () => {
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [role, setRole]       = useState('ROLE_ATTENDEE');
  const [form, setForm]       = useState({ name: '', email: '', password: '' });

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.name, form.email, form.password, role);
      }
    } catch (err) {
      const msg = err?.response?.data?.message
        || err?.response?.data
        || err?.message
        || 'Something went wrong. Please try again.';
      setError(typeof msg === 'string' ? msg : 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(p => !p);
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  return (
    <div
      id="auth-page"
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#050505',
        overflow: 'hidden',
      }}
    >
      <Background />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, ...SPRING }}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '2.5rem',
        }}
      >
        <div style={{
          width: '2.5rem', height: '2.5rem',
          borderRadius: '0.75rem',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(255,255,255,0.06)',
        }}>
          <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: '#FAFAFA' }} />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
          Event<span style={{ color: '#71717A' }}>Sphere</span>
        </span>
      </motion.div>

      {/* Glass card */}
      <motion.div
        layout
        transition={SPRING}
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '420px',
          margin: '0 1rem',
          borderRadius: '1.5rem',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(32px)',
          WebkitBackdropFilter: 'blur(32px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7), inset 0 1px 0 0 rgba(255,255,255,0.12)',
        }}
      >
        {/* Specular highlight */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
        }} />

        <div style={{ padding: '2rem' }}>

          {/* Header */}
          <motion.div layout style={{ marginBottom: '2rem' }}>
            <motion.h1 layout style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
              {isLogin ? 'Welcome back' : 'Create account'}
            </motion.h1>
            <motion.p layout style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.375rem', lineHeight: 1.6 }}>
              {isLogin
                ? 'Sign in to manage and attend events.'
                : 'Join EventSphere and start discovering events.'}
            </motion.p>
          </motion.div>

          {/* Form */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.form
              key={isLogin ? 'login-form' : 'register-form'}
              id={isLogin ? 'login-form' : 'register-form'}
              variants={FORM_VARIANTS}
              initial="initial"
              animate="animate"
              exit="exit"
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Name field */}
              {!isLogin && (
                <motion.div layout>
                  <GlassInput
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Full name"
                    autoComplete="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    icon={User}
                  />
                </motion.div>
              )}

              <GlassInput
                id="email"
                name="email"
                type="email"
                placeholder="Email address"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                icon={Mail}
              />

              <GlassInput
                id="password"
                name="password"
                type="password"
                placeholder="Password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={form.password}
                onChange={handleChange}
                icon={Lock}
              />

              {/* Role selector */}
              {!isLogin && (
                <motion.div layout>
                  <p style={{
                    fontSize: '0.75rem', fontWeight: 500, color: '#71717A',
                    textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem',
                  }}>
                    I am joining as
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <RolePill label="Attendee"  selected={role === 'ROLE_ATTENDEE'}  onClick={() => setRole('ROLE_ATTENDEE')} />
                    <RolePill label="Organizer" selected={role === 'ROLE_ORGANIZER'} onClick={() => setRole('ROLE_ORGANIZER')} />
                  </div>
                </motion.div>
              )}

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
                  id={isLogin ? 'login-submit' : 'register-submit'}
                  style={{ width: '100%' }}
                >
                  {isLogin ? 'Sign in' : 'Continue'}
                  <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                </GlassButton>
              </div>
            </motion.form>
          </AnimatePresence>

          {/* Toggle */}
          <motion.div layout style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <button
              type="button"
              id="auth-toggle"
              onClick={toggleMode}
              style={{
                fontSize: '0.875rem',
                color: '#71717A',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#FAFAFA')}
              onMouseLeave={e => (e.currentTarget.style.color = '#71717A')}
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : 'Already have an account? Sign in'}
            </button>
          </motion.div>
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

export default AuthPage;
