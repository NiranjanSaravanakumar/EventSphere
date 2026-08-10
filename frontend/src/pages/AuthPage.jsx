import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowRight, ArrowLeft,
  Sparkles, Ticket, Mic2, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { emailToSlug } from '../context/AuthContext.jsx';
import GlassInput from '../components/ui/GlassInput.jsx';
import GlassButton from '../components/ui/GlassButton.jsx';

// â”€â”€ Animation configs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

const slideLeft = {
  initial: { opacity: 0, x: -28, filter: 'blur(8px)' },
  animate: { opacity: 1, x: 0,   filter: 'blur(0px)', transition: SPRING },
  exit:    { opacity: 0, x: -28, filter: 'blur(8px)', transition: { duration: 0.18 } },
};

const slideRight = {
  initial: { opacity: 0, x: 28,  filter: 'blur(8px)' },
  animate: { opacity: 1, x: 0,   filter: 'blur(0px)', transition: SPRING },
  exit:    { opacity: 0, x: 28,  filter: 'blur(8px)', transition: { duration: 0.18 } },
};

// â”€â”€ Portal card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PortalCard = ({ id, icon: Icon, title, description, accent, onClick }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <motion.button
      id={id}
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={SPRING}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        padding: '1.5rem',
        borderRadius: '1.125rem',
        border: hovered ? `1px solid ${accent}44` : '1px solid rgba(255,255,255,0.07)',
        background: hovered ? `${accent}09` : 'rgba(255,255,255,0.025)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '1.125rem',
        textAlign: 'left',
        transition: 'border 0.25s, background 0.25s',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <div style={{
        flexShrink: 0,
        width: '3rem', height: '3rem',
        borderRadius: '0.875rem',
        background: hovered ? `${accent}18` : 'rgba(255,255,255,0.06)',
        border: `1px solid ${hovered ? accent + '33' : 'rgba(255,255,255,0.08)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 0.25s, border 0.25s',
      }}>
        <Icon style={{ width: '1.25rem', height: '1.25rem', color: hovered ? accent : '#A1A1AA' }} />
      </div>

      <div>
        <p style={{ fontSize: '1rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.015em' }}>
          {title}
        </p>
        <p style={{ fontSize: '0.8125rem', color: '#71717A', marginTop: '0.25rem', lineHeight: 1.55 }}>
          {description}
        </p>
      </div>

      <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
        <ArrowRight style={{ width: '1rem', height: '1rem', color: hovered ? accent : '#3f3f46', transition: 'color 0.2s' }} />
      </div>
    </motion.button>
  );
};

// â”€â”€ Ambient background â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Background = ({ role }) => {
  const tint = role === 'ROLE_ORGANIZER'
    ? 'rgba(139,92,246,0.06)'
    : role === 'ROLE_ATTENDEE'
    ? 'rgba(52,211,153,0.06)'
    : 'rgba(255,255,255,0.022)';

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
      <motion.div
        animate={{ background: tint }}
        transition={{ duration: 0.8 }}
        style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: 640, height: 640, borderRadius: '50%',
          filter: 'blur(110px)',
        }}
      />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-5%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'rgba(255,255,255,0.015)', filter: 'blur(80px)',
      }} />
      <div style={{
        position: 'absolute', top: '40%', right: '18%',
        width: 280, height: 280, borderRadius: '50%',
        background: 'rgba(255,255,255,0.01)', filter: 'blur(60px)',
      }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.022 }}>
        <defs>
          <pattern id="auth-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#auth-grid)" />
      </svg>
    </div>
  );
};

// â”€â”€ Main AuthPage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]       = useState('selection'); // 'selection' | 'login' | 'register'
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: '', email: '', password: '' });

  const portals = {
    ROLE_ATTENDEE: {
      icon: Ticket,
      label: 'Attendee Portal',
      accent: '#34d399',
      loginTitle: 'Welcome back',
      loginSub: 'Sign in to your Attendee Portal.',
      registerTitle: 'Join EventSphere',
      registerSub: 'Create your attendee account and start discovering events.',
    },
    ROLE_ORGANIZER: {
      icon: Mic2,
      label: 'Creator Studio',
      accent: '#a78bfa',
      loginTitle: 'Welcome back',
      loginSub: 'Sign in to your Creator Studio workspace.',
      registerTitle: 'Launch your Studio',
      registerSub: 'Create an organizer account to host and manage events.',
    },
  };

  const portal  = role ? portals[role] : null;
  const isLogin = step === 'login';

  const selectPortal = (selectedRole) => {
    setRole(selectedRole);
    setStep('login');
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  const goBack = () => {
    setStep('selection');
    setRole(null);
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  const toggleMode = () => {
    setStep(isLogin ? 'register' : 'login');
    setError('');
    setForm({ name: '', email: '', password: '' });
  };

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const navigateAfterAuth = (authUser) => {
    const slug = emailToSlug(authUser.email);
    if (authUser.role === 'ROLE_ADMIN')     return navigate('/admin/dashboard', { replace: true });
    if (authUser.role === 'ROLE_ORGANIZER') return navigate(`/organizer/${slug}/dashboard`, { replace: true });
    return navigate(`/attendee/${slug}/dashboard`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const authUser = await login(form.email, form.password);
        navigateAfterAuth(authUser);
      } else {
        await register(form.name, form.email, form.password, role);
        const slug = emailToSlug(form.email);
        if (role === 'ROLE_ORGANIZER') navigate(`/organizer/${slug}/dashboard`, { replace: true });
        else                           navigate(`/attendee/${slug}/dashboard`,  { replace: true });
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
      <Background role={role} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, ...SPRING }}
        style={{
          position: 'relative', zIndex: 10,
          display: 'flex', alignItems: 'center', gap: '0.625rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{
          width: '2.25rem', height: '2.25rem',
          borderRadius: '0.625rem',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.11)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(255,255,255,0.05)',
        }}>
          <Sparkles style={{ width: '1.1rem', height: '1.1rem', color: '#FAFAFA' }} />
        </div>
        <span style={{ fontSize: '1.375rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
          Event<span style={{ color: '#52525b' }}>Sphere</span>
        </span>
      </motion.div>

      {/* Glass card */}
      <motion.div
        layout
        transition={SPRING}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '440px',
          margin: '0 1rem',
          borderRadius: '1.75rem',
          overflow: 'hidden',
          background: 'rgba(255,255,255,0.038)',
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Specular highlight */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
        }} />

        <div style={{ padding: '2rem' }}>
          <AnimatePresence mode="wait">

            {/* â”€â”€ STEP 1: Portal selection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step === 'selection' && (
              <motion.div
                key="selection"
                variants={slideLeft}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                <div>
                  <h1 style={{
                    fontSize: '1.5rem', fontWeight: 600,
                    letterSpacing: '-0.025em', color: '#FAFAFA',
                    marginBottom: '0.375rem',
                  }}>
                    Choose your portal
                  </h1>
                  <p style={{ fontSize: '0.875rem', color: '#71717A', lineHeight: 1.6 }}>
                    Select how you'd like to use EventSphere.
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <PortalCard
                    id="portal-attendee"
                    icon={Ticket}
                    title="Attendee Portal"
                    description="Discover events, register with invite codes, and manage your QR passes."
                    accent="#34d399"
                    onClick={() => selectPortal('ROLE_ATTENDEE')}
                  />
                  <PortalCard
                    id="portal-organizer"
                    icon={Mic2}
                    title="Creator Studio"
                    description="Host events, manage capacity, track check-ins, and scan tickets."
                    accent="#a78bfa"
                    onClick={() => selectPortal('ROLE_ORGANIZER')}
                  />
                </div>

                {/* Admin link */}
                <div style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    id="admin-portal-link"
                    onClick={() => navigate('/adminlogin')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      fontSize: '0.75rem', color: '#3f3f46',
                      background: 'none', border: 'none', cursor: 'pointer',
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#71717A')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#3f3f46')}
                  >
                    <ShieldCheck style={{ width: '0.75rem', height: '0.75rem' }} />
                    Admin portal
                  </button>
                </div>
              </motion.div>
            )}

            {/* â”€â”€ STEP 2: Login / Register form â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            {step !== 'selection' && (
              <motion.div
                key={`form-${step}`}
                variants={slideRight}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ display: 'flex', flexDirection: 'column' }}
              >
                {/* Back + portal badge */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                  <motion.button
                    id="back-to-selection"
                    type="button"
                    onClick={goBack}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.93 }}
                    transition={SPRING}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: '2rem', height: '2rem',
                      borderRadius: '0.5rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer', color: '#71717A',
                      flexShrink: 0,
                    }}
                  >
                    <ArrowLeft style={{ width: '0.875rem', height: '0.875rem' }} />
                  </motion.button>

                  {portal && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
                      padding: '0.3rem 0.75rem',
                      borderRadius: '999px',
                      background: `${portal.accent}12`,
                      border: `1px solid ${portal.accent}28`,
                      fontSize: '0.75rem', fontWeight: 600,
                      color: portal.accent,
                    }}>
                      <portal.icon style={{ width: '0.75rem', height: '0.75rem' }} />
                      {portal.label}
                    </div>
                  )}
                </div>

                {/* Heading */}
                <motion.div layout style={{ marginBottom: '1.75rem' }}>
                  <motion.h1 layout style={{ fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em', color: '#FAFAFA' }}>
                    {isLogin ? portal?.loginTitle : portal?.registerTitle}
                  </motion.h1>
                  <motion.p layout style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.375rem', lineHeight: 1.6 }}>
                    {isLogin ? portal?.loginSub : portal?.registerSub}
                  </motion.p>
                </motion.div>

                {/* Form */}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.form
                    key={step}
                    id={isLogin ? 'login-form' : 'register-form'}
                    initial={{ opacity: 0, filter: 'blur(10px)', y: 16 }}
                    animate={{ opacity: 1, filter: 'blur(0px)',  y: 0,   transition: SPRING }}
                    exit={{    opacity: 0, filter: 'blur(10px)', y: -12, transition: { duration: 0.16 } }}
                    onSubmit={handleSubmit}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                  >
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
                        {isLogin ? 'Sign in' : 'Create account'}
                        <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                      </GlassButton>
                    </div>
                  </motion.form>
                </AnimatePresence>

                {/* Toggle */}
                <motion.div layout style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                  <button
                    type="button"
                    id="auth-toggle"
                    onClick={toggleMode}
                    style={{
                      fontSize: '0.875rem', color: '#71717A',
                      background: 'none', border: 'none', cursor: 'pointer',
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
              </motion.div>
            )}

          </AnimatePresence>
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
        &copy; 2026 EventSphere &middot; Enterprise Event Platform
      </motion.p>
    </div>
  );
};

export default AuthPage;

