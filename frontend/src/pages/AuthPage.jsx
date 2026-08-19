import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, User, ArrowRight, ArrowLeft,
  Ticket, Mic2, ShieldCheck,
} from 'lucide-react';
import { useAuth, emailToSlug } from '../context/AuthContext.jsx';

// ── Film Grain ────────────────────────────────────────────────────────────────
const FilmGrain = () => (
  <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 997, opacity: 0.06, mixBlendMode: 'overlay' }}>
    <filter id="auth-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter="url(#auth-grain)" />
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

// ── Form field ────────────────────────────────────────────────────────────────
const Field = ({ label, type = 'text', name, value, onChange, placeholder, icon: Icon, required, autoComplete }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)' }}>
      {label}
    </label>
    <div style={{ position: 'relative' }}>
      {Icon && <Icon size={13} color="var(--structure)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }} />}
      <input
        type={type} name={name} value={value} onChange={onChange}
        placeholder={placeholder} required={required} autoComplete={autoComplete}
        className="grit-input"
        style={{
          width: '100%', height: '3rem',
          paddingLeft: Icon ? '2.75rem' : '1rem', paddingRight: '1rem',
          fontSize: '0.8125rem',
        }}
      />
    </div>
  </div>
);

// ── Portal card ───────────────────────────────────────────────────────────────
const PortalCard = ({ id, icon: Icon, title, description, onClick }) => (
  <button
    id={id} type="button" onClick={onClick}
    className="grit-btn grit-portal-card"
    style={{
      width: '100%', padding: '1.5rem',
      border: '2px solid var(--dim-border)',
      background: 'var(--dim-bg)',
      display: 'flex', alignItems: 'center', gap: '1.25rem', textAlign: 'left',
      boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
    }}
  >
    <div style={{ flexShrink: 0, width: '3rem', height: '3rem', border: '1px solid var(--pop)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={16} color="var(--pop)" />
    </div>
    <div style={{ flex: 1 }}>
      <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1, marginBottom: '0.375rem' }}>
        {title}
      </p>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.55, lineHeight: 1.7, letterSpacing: '0.04em' }}>
        {description}
      </p>
    </div>
    <ArrowRight size={14} color="var(--structure)" style={{ flexShrink: 0, opacity: 0.4 }} />
  </button>
);

// ── Terminal Log Panel (right side) ──────────────────────────────────────────
const TerminalPanel = ({ role }) => {
  const logs = role === 'ROLE_ORGANIZER' ? [
    '> ORGANIZER STUDIO INITIALIZED',
    '> LOADING EVENT SCHEMA... OK',
    '> QR GENERATION ENGINE: ONLINE',
    '> CAPACITY MONITOR: ARMED',
    '> REGISTRATION WINDOWS: CONFIGURABLE',
    '> JWT AUTH: VERIFIED',
    '> SPRING SECURITY: ACTIVE',
    '─────────────────────────────',
    '> STUDIO READY. WELCOME BACK.',
  ] : [
    '> ATTENDEE PORTAL INITIALIZED',
    '> LOADING INVITE CODE ENGINE... OK',
    '> QR WALLET: ARMED',
    '> EVENT REGISTRY: QUERYING...',
    '> 3 EVENTS AVAILABLE',
    '> JWT AUTH: VERIFIED',
    '> SPRING SECURITY: ACTIVE',
    '─────────────────────────────',
    '> PORTAL READY. WELCOME BACK.',
  ];

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'var(--anchor)',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '3rem',
      borderLeft: '2px solid var(--structure)',
    }}>
      {/* Grid texture */}
      <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
        <defs><pattern id="auth-r-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
        <rect width="100%" height="100%" fill="url(#auth-r-grid)" style={{ color: 'var(--structure)' }} />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '1.5rem' }}>
          SYS::EVENTSPHERE — AUTH TERMINAL v2.6
        </p>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem', lineHeight: 2.0, color: 'var(--structure)', opacity: 0.7 }}>
          {logs.map((line, i) => (
            <p key={i} style={{ letterSpacing: '0.04em' }}>{line}</p>
          ))}
          <span className="cursor-blink" style={{ display: 'inline-block', width: '0.5rem', height: '1rem', background: 'var(--pop)', verticalAlign: 'middle' }} />
        </div>
        <p style={{ marginTop: '3rem', fontFamily: "'VT323', monospace", fontSize: '5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1, opacity: 0.08 }}>
          EVENTSPHERE
        </p>
      </div>
    </div>
  );
};

// ── Main AuthPage ─────────────────────────────────────────────────────────────
const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();

  const [step, setStep]       = useState('selection');
  const [role, setRole]       = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [form, setForm]       = useState({ name: '', email: '', password: '' });

  const portals = {
    ROLE_ATTENDEE:  { icon: Ticket, label: 'Attendee Portal', loginTitle: 'IDENTITY CHECK', loginSub: 'SIGN IN TO YOUR ATTENDEE PORTAL.', registerTitle: 'JOIN THE PLATFORM', registerSub: 'CREATE YOUR ATTENDEE ACCOUNT.' },
    ROLE_ORGANIZER: { icon: Mic2,   label: 'Creator Studio',  loginTitle: 'STUDIO ACCESS',   loginSub: 'SIGN IN TO YOUR CREATOR STUDIO.', registerTitle: 'LAUNCH YOUR STUDIO', registerSub: 'CREATE AN ORGANIZER ACCOUNT.' },
  };

  const portal  = role ? portals[role] : null;
  const isLogin = step === 'login';

  const selectPortal = (r) => { setRole(r); setStep('login'); setError(''); setForm({ name: '', email: '', password: '' }); };
  const goBack       = () => { setStep('selection'); setRole(null); setError(''); setForm({ name: '', email: '', password: '' }); };
  const toggleMode   = () => { setStep(isLogin ? 'register' : 'login'); setError(''); setForm({ name: '', email: '', password: '' }); };
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const navigateAfterAuth = (authUser) => {
    const slug = emailToSlug(authUser.email);
    if (authUser.role === 'ROLE_ADMIN')     return navigate('/admin/dashboard', { replace: true });
    if (authUser.role === 'ROLE_ORGANIZER') return navigate(`/organizer/${slug}/dashboard`, { replace: true });
    return navigate(`/attendee/${slug}/dashboard`, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
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
      const msg = err?.response?.data?.message || err?.response?.data || err?.message || 'AUTHENTICATION FAILED.';
      setError(typeof msg === 'string' ? msg.toUpperCase() : 'AUTHENTICATION FAILED.');
    } finally { setLoading(false); }
  };

  const fadeVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.1, ease: 'linear' } },
    exit:    { opacity: 0, transition: { duration: 0.08, ease: 'linear' } },
  };

  return (
    <div id="auth-page" style={{ minHeight: '100vh', width: '100%', display: 'flex', background: 'var(--anchor)', overflow: 'hidden' }}>
      <FilmGrain />

      {/* Theme toggle — top right corner */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 200 }}>
        <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>
      </div>

      {/* ── LEFT PANEL — Form ───────────────────────────────────────────── */}
      <div
        className="auth-left-panel"
        style={{
          flex: step === 'selection' ? '0 0 100%' : '0 0 50%',
          transition: 'flex 0.1s linear',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '3rem 2rem', position: 'relative',
          borderRight: step !== 'selection' ? '2px solid var(--structure)' : 'none',
        }}
      >
        {/* Grid texture */}
        <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.025, pointerEvents: 'none' }}>
          <defs><pattern id="auth-l-grid" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#auth-l-grid)" style={{ color: 'var(--structure)' }} />
        </svg>

        {/* Brand */}
        <div style={{ position: 'relative', zIndex: 10, marginBottom: '2.5rem', textAlign: 'center' }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.75rem', textTransform: 'uppercase', color: 'var(--structure)', letterSpacing: '0.05em', lineHeight: 1 }}>EVENTSPHERE</p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', color: 'var(--pop)', letterSpacing: '0.18em', textTransform: 'uppercase', marginTop: '0.375rem' }}>IDENTITY GATEWAY</p>
        </div>

        {/* Card */}
        <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: '440px', background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: '12px 12px 0px var(--ink)' }}>

          {/* Card header bar */}
          <div style={{ borderBottom: '1px solid var(--dim-border)', padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pop)' }}>
              {step === 'selection' ? '// CHOOSE PORTAL' : isLogin ? '// SIGN IN' : '// REGISTER'}
            </p>
            {step !== 'selection' && (
              <button id="back-to-selection" className="grit-btn" type="button" onClick={goBack}
                style={{ width: '2rem', height: '2rem', background: 'transparent', border: '1px solid var(--dim-border)', color: 'var(--structure)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
                <ArrowLeft size={12} />
              </button>
            )}
          </div>

          {/* Card body */}
          <div style={{ padding: '2rem' }}>
            <AnimatePresence mode="wait">

              {/* Selection */}
              {step === 'selection' && (
                <motion.div key="selection" variants={fadeVariants} initial="initial" animate="animate" exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontFamily: "'VT323', monospace", fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1.0, marginBottom: '0.625rem' }}>
                      SELECT YOUR PORTAL
                    </h1>
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.5, letterSpacing: '0.06em', lineHeight: 1.7 }}>
                      CHOOSE HOW YOU WANT TO USE EVENTSPHERE.
                    </p>
                  </div>
                  <PortalCard id="portal-attendee" icon={Ticket} title="ATTENDEE PORTAL"
                    description="Discover events, register with invite codes, and collect your QR passes."
                    onClick={() => selectPortal('ROLE_ATTENDEE')} />
                  <PortalCard id="portal-organizer" icon={Mic2} title="CREATOR STUDIO"
                    description="Host events, manage capacity, track check-ins, and scan tickets."
                    onClick={() => selectPortal('ROLE_ORGANIZER')} />
                  <div style={{ textAlign: 'center', paddingTop: '0.5rem' }}>
                    <button type="button" id="admin-portal-link" onClick={() => navigate('/adminlogin')}
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.3'}
                    >
                      <ShieldCheck size={11} /> ADMIN PORTAL →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Login / Register */}
              {step !== 'selection' && (
                <motion.div key={`form-${step}`} variants={fadeVariants} initial="initial" animate="animate" exit="exit"
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {portal && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', border: '1px solid var(--dim-border)', padding: '0.3rem 0.75rem', width: 'fit-content' }}>
                      <portal.icon size={12} color="var(--pop)" />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)' }}>{portal.label}</span>
                    </div>
                  )}
                  <div>
                    <h1 style={{ fontFamily: "'VT323', monospace", fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1.0, marginBottom: '0.5rem' }}>
                      {isLogin ? portal?.loginTitle : portal?.registerTitle}
                    </h1>
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.5, letterSpacing: '0.06em', lineHeight: 1.7 }}>
                      {isLogin ? portal?.loginSub : portal?.registerSub}
                    </p>
                  </div>

                  <form id={isLogin ? 'login-form' : 'register-form'} onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!isLogin && (
                      <Field label="FULL NAME" name="name" value={form.name} onChange={handleChange} placeholder="Jane Smith" autoComplete="name" required icon={User} />
                    )}
                    <Field label="EMAIL ADDRESS" type="email" name="email" value={form.email} onChange={handleChange} placeholder="jane@company.com" autoComplete="email" required icon={Mail} />
                    <Field label="PASSWORD" type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" autoComplete={isLogin ? 'current-password' : 'new-password'} required icon={Lock} />

                    {error && (
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', border: '1px solid var(--structure)', padding: '0.75rem 1rem', letterSpacing: '0.04em', opacity: 0.8 }}>
                        !! {error}
                      </p>
                    )}

                    <button
                      id={isLogin ? 'login-submit' : 'register-submit'}
                      type="submit" className="grit-btn" disabled={loading}
                      style={{
                        width: '100%', height: '3rem',
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
                        <>{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'} <ArrowRight size={12} /></>
                      )}
                    </button>
                  </form>

                  <div style={{ textAlign: 'center', paddingTop: '0.25rem' }}>
                    <button id="auth-toggle" type="button" onClick={toggleMode}
                      style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.4, background: 'none', border: 'none', cursor: 'pointer' }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
                    >
                      {isLogin ? 'NO ACCOUNT? REGISTER →' : 'ALREADY REGISTERED? SIGN IN →'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <p style={{ position: 'relative', zIndex: 10, marginTop: '2rem', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.2 }}>
          © 2026 EVENTSPHERE · ENTERPRISE EVENT PLATFORM
        </p>
      </div>

      {/* ── RIGHT PANEL — Terminal log ──────────────────────────────────── */}
      <AnimatePresence>
        {step !== 'selection' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            className="auth-right-panel"
            style={{ flex: '0 0 50%', position: 'relative', overflow: 'hidden', minHeight: '100vh' }}
          >
            <TerminalPanel role={role} />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .auth-right-panel { display: none !important; }
          .auth-left-panel  { flex: 0 0 100% !important; border-right: none !important; }
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
