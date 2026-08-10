import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, Lock, ScanLine, Users, Calendar, ArrowRight,
  Zap, ShieldCheck, BarChart3, Globe
} from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 300, damping: 30 };

// ── Ambient particle orbs ───────────────────────────────────────────────────
const AmbientBackground = () => (
  <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }} aria-hidden>
    <div style={{ position: 'absolute', top: '-15%', left: '-8%', width: 700, height: 700, borderRadius: '50%', background: 'rgba(255,255,255,0.018)', filter: 'blur(120px)' }} />
    <div style={{ position: 'absolute', top: '30%',  right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.012)', filter: 'blur(80px)' }} />
    <div style={{ position: 'absolute', bottom: '-5%', left: '30%', width: 600, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.010)', filter: 'blur(100px)' }} />
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.018 }}>
      <defs>
        <pattern id="landing-grid" width="72" height="72" patternUnits="userSpaceOnUse">
          <path d="M 72 0 L 0 0 0 72" fill="none" stroke="white" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#landing-grid)" />
    </svg>
  </div>
);

// ── Feature card ────────────────────────────────────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
    whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ ...SPRING, delay }}
    style={{
      padding: '1.75rem',
      borderRadius: '1.5rem',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.07)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', gap: '1rem',
      position: 'relative', overflow: 'hidden',
    }}
  >
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }} />
    <div style={{
      width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem',
      background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Icon style={{ width: '1.125rem', height: '1.125rem', color: '#D4D4D8' }} />
    </div>
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.015em', marginBottom: '0.375rem' }}>
        {title}
      </h3>
      <p style={{ fontSize: '0.8125rem', color: '#71717A', lineHeight: 1.65 }}>
        {description}
      </p>
    </div>
  </motion.div>
);

// ── Stat pill ───────────────────────────────────────────────────────────────
const StatPill = ({ value, label, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.92 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ ...SPRING, delay }}
    style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
      padding: '1.25rem 2rem',
      borderRadius: '1.25rem',
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.07)',
    }}
  >
    <span style={{ fontSize: '2rem', fontWeight: 300, color: '#FAFAFA', letterSpacing: '-0.03em', lineHeight: 1 }}>
      {value}
    </span>
    <span style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {label}
    </span>
  </motion.div>
);

// ── Role badge ──────────────────────────────────────────────────────────────
const RoleBadge = ({ icon: Icon, label, color }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.375rem 0.875rem', borderRadius: '999px',
    background: `${color}10`, border: `1px solid ${color}22`,
    fontSize: '0.75rem', fontWeight: 600, color,
  }}>
    <Icon style={{ width: '0.75rem', height: '0.75rem' }} />
    {label}
  </div>
);

// ── Floating glass Navbar ───────────────────────────────────────────────────
const TopNav = () => {
  const navigate = useNavigate();
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, ...SPRING }}
      style={{
        position: 'fixed',
        top: '1.25rem',
        /* left:0 + right:0 + margin:auto is the browser-native
           way to centre a fixed element — no transform math,
           no interaction with Framer Motion's own transforms. */
        left: 0,
        right: 0,
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 100,
        width: 'min(760px, calc(100vw - 2rem))',
        boxSizing: 'border-box',
        /* CSS Grid 1fr | auto | 1fr keeps badges at dead-centre */
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.625rem 1.25rem',
        borderRadius: '2rem',
        background: 'rgba(8,8,8,0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
      }}
    >
      {/* Col 1 — Logo (left-aligned) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
        <Sparkles style={{ width: '1rem', height: '1rem', color: '#71717A', flexShrink: 0 }} />
        <span style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
          Event<span style={{ color: '#52525b' }}>Sphere</span>
        </span>
      </div>

      {/* Col 2 — Role badges (always at geometric centre) */}
      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
        <RoleBadge icon={ShieldCheck} label="Admin"     color="#a78bfa" />
        <RoleBadge icon={Calendar}   label="Organizer" color="#60a5fa" />
        <RoleBadge icon={Users}      label="Attendee"  color="#34d399" />
      </div>

      {/* Col 3 — Sign In (right-aligned) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <motion.button
          id="landing-signin-btn"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING}
          onClick={() => navigate('/login')}
          style={{
            height: '2.125rem', padding: '0 1.125rem',
            borderRadius: '999px', border: 'none',
            background: '#FAFAFA', color: '#050505',
            fontSize: '0.875rem', fontWeight: 600,
            cursor: 'pointer', whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Sign In
        </motion.button>
      </div>
    </motion.nav>
  );
};

// ── Main LandingPage ────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate    = useNavigate();
  const heroRef     = useRef(null);
  const { scrollY } = useScroll();
  const heroY       = useSpring(useTransform(scrollY, [0, 400], [0, -60]), { stiffness: 80, damping: 20 });
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);

  const features = [
    { icon: Lock,       title: 'Invite-Only Access',     description: 'Every event generates a unique alphanumeric code. Attendees must enter the correct code to register — no leaks, no gatecrashers.',         delay: 0 },
    { icon: ScanLine,   title: 'QR Ticket Wallet',       description: 'Registration instantly mints a secure QR ticket. Organizers scan it at the door in real time to mark attendance and prevent duplicates.',    delay: 0.06 },
    { icon: BarChart3,  title: 'Live Analytics',         description: 'Monitor fill rates, check-in velocity, and capacity pressure from your organizer dashboard — updated live as guests arrive.',                 delay: 0.12 },
    { icon: Zap,        title: 'Registration Windows',   description: 'Define exact open and close datetimes for registration. Attempts outside the window are blocked server-side — no client-side workarounds.',  delay: 0.18 },
    { icon: ShieldCheck,title: 'JWT-Secured Routing',    description: 'Every API call extracts identity from the verified JWT token. Usernames appear in browser URLs for UX — never for authorization.',           delay: 0.24 },
    { icon: Globe,      title: 'Role-Scoped Dashboards', description: 'Admins, Organizers, and Attendees each get their own URL namespace and API surface — fully isolated, cleanly separated by Spring Security.',  delay: 0.30 },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#FAFAFA', fontFamily: 'Inter, system-ui, sans-serif', overflowX: 'hidden' }}>
      <AmbientBackground />
      <TopNav />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative', zIndex: 1,
          minHeight: '100vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
          padding: '8rem 1.5rem 4rem',
        }}
      >
        <motion.div style={{ y: heroY, opacity: heroOpacity }}>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, ...SPRING }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.375rem 1rem', borderRadius: '999px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.75rem', fontWeight: 600, color: '#71717A',
              letterSpacing: '0.05em', textTransform: 'uppercase',
              marginBottom: '2rem',
            }}
          >
            <Sparkles style={{ width: '0.75rem', height: '0.75rem' }} />
            Enterprise Event Management Platform
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              fontWeight: 300,
              letterSpacing: '-0.04em',
              lineHeight: 1.08,
              color: '#FAFAFA',
              maxWidth: '800px',
              margin: '0 auto 1.5rem',
            }}
          >
            Events that run on
            <br />
            <span style={{ fontWeight: 700 }}>intelligence.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, ...SPRING }}
            style={{
              fontSize: 'clamp(1rem, 2vw, 1.1875rem)',
              color: '#52525b',
              maxWidth: '560px',
              margin: '0 auto 3rem',
              lineHeight: 1.7,
            }}
          >
            Invite-only registration with QR tickets, real-time analytics,
            and role-scoped workspaces — built for organisers who mean business.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, ...SPRING }}
            style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}
          >
            <motion.button
              id="landing-get-started"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRING}
              onClick={() => navigate('/login')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                height: '3rem', padding: '0 1.75rem',
                borderRadius: '999px', border: 'none',
                background: '#FAFAFA', color: '#050505',
                fontSize: '0.9375rem', fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 0 32px rgba(255,255,255,0.12)',
              }}
            >
              Get Started Free
              <ArrowRight style={{ width: '1rem', height: '1rem' }} />
            </motion.button>

           
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{ position: 'absolute', bottom: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            style={{ width: '1px', height: '2rem', background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ── Stats ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '4rem 1.5rem', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <StatPill value="3"      label="User Roles"         delay={0} />
          <StatPill value="6-char" label="Invite Codes"       delay={0.07} />
          <StatPill value="Live"   label="QR Check-In"        delay={0.14} />
          <StatPill value="JWT"    label="Secured Routing"    delay={0.21} />
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '6rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
          style={{ textAlign: 'center', marginBottom: '4rem' }}
        >
          <p style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#3f3f46', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Platform Capabilities
          </p>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', fontWeight: 300, letterSpacing: '-0.03em', color: '#FAFAFA', lineHeight: 1.15 }}>
            Everything you need,<br /><strong>nothing you don't.</strong>
          </h2>
        </motion.div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {features.map(f => <FeatureCard key={f.title} {...f} />)}
        </div>
      </section>

      {/* ── Role architecture diagram ──────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '6rem 1.5rem', maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={SPRING}
          style={{ marginBottom: '3rem' }}
        >
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 300, letterSpacing: '-0.03em', color: '#FAFAFA', lineHeight: 1.2 }}>
            One platform,<br /><strong>three workspaces.</strong>
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1rem' }}>
          {[
            {
              role: 'Admin', color: '#a78bfa', icon: ShieldCheck,
              path: '/admin/dashboard',
              perks: ['Global analytics', 'All event codes', 'Full user directory'],
            },
            {
              role: 'Organizer', color: '#60a5fa', icon: Calendar,
              path: '/organizer/:username/dashboard',
              perks: ['Create & manage events', 'Set registration windows', 'QR scanner & guest list'],
            },
            {
              role: 'Attendee', color: '#34d399', icon: Users,
              path: '/attendee/:username/dashboard',
              perks: ['Browse available events', 'Enter invite codes', 'QR ticket wallet'],
            },
          ].map(({ role, color, icon: Icon, path, perks }, i) => (
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
              whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              viewport={{ once: true }}
              transition={{ ...SPRING, delay: i * 0.08 }}
              style={{
                padding: '1.75rem', borderRadius: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${color}18`,
                boxShadow: `inset 0 1px 0 ${color}10`,
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1.25rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: '0.625rem', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon style={{ width: '0.875rem', height: '0.875rem', color }} />
                </div>
                <span style={{ fontWeight: 600, color: '#FAFAFA', fontSize: '0.9375rem' }}>{role}</span>
              </div>
              <code style={{
                display: 'block', fontSize: '0.6875rem', color: '#3f3f46',
                fontFamily: '"SF Mono", "Fira Code", monospace',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                borderRadius: '0.375rem', padding: '0.375rem 0.625rem',
                marginBottom: '1.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {path}
              </code>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                {perks.map(p => (
                  <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: '#71717A' }}>
                    <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                    {p}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.04)',
        padding: '2rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
        maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#3f3f46' }} />
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#3f3f46', letterSpacing: '-0.01em' }}>EventSphere</span>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#27272a' }}>
          © 2026 EventSphere · Enterprise Event Platform
        </p>
        
      </footer>
    </div>
  );
};

export default LandingPage;
