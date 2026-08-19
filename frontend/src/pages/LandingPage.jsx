import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock, ScanLine, BarChart3, Zap, ShieldCheck, Globe, ArrowRight,
} from 'lucide-react';

// ── Film Grain ────────────────────────────────────────────────────────────────
const FilmGrain = () => (
  <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 997, opacity: 0.06, mixBlendMode: 'overlay' }}>
    <filter id="lp-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#lp-grain)" />
  </svg>
);

// ── Hero grid texture ─────────────────────────────────────────────────────────
const GridTexture = () => (
  <svg aria-hidden style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.04, pointerEvents: 'none' }}>
    <defs>
      <pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hero-grid)" style={{ color: 'var(--structure)' }} />
  </svg>
);

// ── Theme toggle ──────────────────────────────────────────────────────────────
const useTheme = () => {
  const [theme, setTheme] = React.useState(() => localStorage.getItem('es-theme') || 'dark');
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

// ── Top Nav ───────────────────────────────────────────────────────────────────
const TopNav = ({ onSignIn }) => {
  const { theme, toggle } = useTheme();
  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 3rem', height: '64px',
      background: 'var(--anchor)', borderBottom: '2px solid var(--structure)',
    }}>
      <div>
        <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.625rem', color: 'var(--structure)', letterSpacing: '0.05em', lineHeight: 1, textTransform: 'uppercase' }}>
          EVENTSPHERE
        </p>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', color: 'var(--structure)', letterSpacing: '0.18em', opacity: 0.4, textTransform: 'uppercase' }}>
          ENTERPRISE EVENT PLATFORM
        </p>
      </div>
      <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {['ADMIN', 'ORGANIZER', 'ATTENDEE'].map(label => (
          <span key={label} style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.14em',
            color: 'var(--structure)', opacity: label === 'ADMIN' ? 1 : 0.4,
            border: `1px solid ${label === 'ADMIN' ? 'var(--pop)' : 'var(--dim-border)'}`,
            padding: '0.25rem 0.625rem',
          }}>
            {label}
          </span>
        ))}

        {/* Theme toggle */}
        <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
          {theme === 'dark' ? '☀' : '☾'}
        </button>

        <button
          id="landing-signin-btn"
          className="grit-btn"
          onClick={onSignIn}
          style={{
            height: '2.5rem', padding: '0 1.5rem',
            background: 'var(--pop)', border: '2px solid var(--pop)',
            color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            boxShadow: 'var(--shadow)', cursor: 'pointer',
          }}
        >
          SIGN IN
        </button>
      </nav>
    </header>
  );
};

// ── Feature tile ──────────────────────────────────────────────────────────────
const FeatureTile = ({ icon: Icon, title, body, spanTwo }) => (
  <article
    className="grit-feature-card"
    style={{
      background: 'var(--anchor)', border: '2px solid var(--structure)',
      boxShadow: 'var(--shadow)', padding: '2rem',
      display: 'flex', flexDirection: 'column', gap: '1rem',
      gridColumn: spanTwo ? 'span 2' : 'span 1',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
      <div style={{
        width: '2.5rem', height: '2.5rem',
        border: '1px solid var(--pop)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={16} color="var(--pop)" />
      </div>
      <h3 style={{
        fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase',
        color: 'var(--structure)', lineHeight: 1,
      }}>
        {title}
      </h3>
    </div>
    <p style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.625rem',
      lineHeight: 1.9, letterSpacing: '0.04em', color: 'var(--structure)', opacity: 0.65,
    }}>
      {body}
    </p>
  </article>
);

// ── Role card ─────────────────────────────────────────────────────────────────
const RoleCard = ({ role, path, perks, isAdmin }) => (
  <article
    className="grit-role-card"
    style={{
      background: 'var(--anchor)',
      border: `2px solid ${isAdmin ? 'var(--pop)' : 'var(--dim-border)'}`,
      boxShadow: 'var(--shadow)', padding: '2rem',
      display: 'flex', flexDirection: 'column', gap: '1.25rem',
    }}
  >
    <div>
      <p style={{
        fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700,
        letterSpacing: '0.16em', textTransform: 'uppercase',
        color: isAdmin ? 'var(--pop)' : 'var(--structure)', opacity: isAdmin ? 1 : 0.5, marginBottom: '0.5rem',
      }}>
        PORTAL
      </p>
      <h3 style={{ fontFamily: "'VT323', monospace", fontSize: '2.5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 0.95 }}>
        {role}
      </h3>
    </div>
    <code style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem',
      color: 'var(--structure)', opacity: 0.4, letterSpacing: '0.06em',
      border: '1px solid var(--dim-border)', padding: '0.375rem 0.625rem', display: 'block',
    }}>
      {path}
    </code>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {perks.map(p => (
        <li key={p} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.7, letterSpacing: '0.04em' }}>
          <span style={{ color: 'var(--pop)', fontWeight: 700, flexShrink: 0 }}>—</span>
          {p}
        </li>
      ))}
    </ul>
  </article>
);

// ── LandingPage ───────────────────────────────────────────────────────────────
const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Lock,        title: 'INVITE-ONLY ACCESS',     body: 'Every event generates a unique 6-char code. Enter the correct code to register — no leaks, no gate-crashers, no exceptions.', spanTwo: true },
    { icon: ScanLine,    title: 'QR TICKET WALLET',       body: 'Registration mints a secure QR pass instantly. Organizers scan it at the door to block duplicates and ghost registrations.' },
    { icon: BarChart3,   title: 'LIVE ANALYTICS',         body: 'Monitor fill rates, check-in velocity, and capacity pressure from your dashboard — updated live as guests arrive.' },
    { icon: Zap,         title: 'REGISTRATION WINDOWS',   body: 'Set exact open/close datetimes server-side. Attempts outside the window are rejected cold — no client-side workarounds.' },
    { icon: ShieldCheck, title: 'JWT-SECURED ROUTING',    body: 'Every API call extracts identity from a verified JWT. Usernames appear in the URL for UX — never for authorization.' },
    { icon: Globe,       title: 'ROLE-SCOPED WORKSPACES', body: 'Admin, Organizer, and Attendee each own their URL namespace and API surface — fully isolated by Spring Security.' },
  ];

  const roles = [
    { role: 'ADMIN',     path: '/admin/dashboard',               isAdmin: true,  perks: ['Global platform analytics', 'All event codes + audit log', 'Full user directory'] },
    { role: 'ORGANIZER', path: '/organizer/:username/dashboard', isAdmin: false, perks: ['Create & manage events', 'Set registration windows', 'QR scanner & guest list'] },
    { role: 'ATTENDEE',  path: '/attendee/:username/dashboard',  isAdmin: false, perks: ['Browse available events', 'Enter invite codes', 'QR ticket wallet'] },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--anchor)', color: 'var(--structure)', position: 'relative', overflowX: 'hidden' }}>
      <FilmGrain />
      <TopNav onSignIn={() => navigate('/login')} />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '100vh', paddingTop: '64px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '8rem 3rem 5rem',
        position: 'relative',
      }}>
        <GridTexture />

        {/* Eyebrow */}
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'var(--pop)', border: '1px solid var(--pop)', padding: '0.375rem 1rem',
          marginBottom: '2.5rem', display: 'inline-block',
        }}>
          SYS::EVENTSPHERE v2.6 — PLATFORM UPTIME: 99.97%
        </p>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'VT323', monospace", textTransform: 'uppercase',
          fontSize: 'clamp(4rem, 11vw, 9rem)',
          color: 'var(--structure)', letterSpacing: '0.04em', lineHeight: 1.0,
          marginBottom: '2.5rem', maxWidth: '900px',
        }}>
          EVENTS /<br />BUILT ON /<br /><span style={{ color: 'var(--pop)' }}>DISCIPLINE.</span>
        </h1>

        {/* Sub */}
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.8125rem',
          lineHeight: 1.9, letterSpacing: '0.06em',
          color: 'var(--structure)', opacity: 0.6,
          maxWidth: '560px', marginBottom: '3rem',
        }}>
          Invite-gated. QR-verified. JWT-locked.<br />
          No guest lists lost. No capacity blown. No excuses.
        </p>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button
            id="landing-get-started"
            className="grit-btn"
            onClick={() => navigate('/login')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              height: '3.25rem', padding: '0 2rem',
              background: 'var(--pop)', border: '2px solid var(--pop)',
              color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              boxShadow: 'var(--shadow)', cursor: 'pointer',
            }}
          >
            GET STARTED <ArrowRight size={13} />
          </button>
          <button
            id="landing-admin-btn"
            className="grit-btn"
            onClick={() => navigate('/adminlogin')}
            style={{
              height: '3.25rem', padding: '0 2rem',
              background: 'transparent', border: '2px solid var(--dim-border)',
              color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
              boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
            }}
          >
            ADMIN PORTAL
          </button>
        </div>

        {/* Scroll indicator */}
        <div style={{ position: 'absolute', bottom: '3rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: '1px', height: '3rem', background: 'var(--structure)', opacity: 0.2, animation: 'tick-line 2s steps(2, end) infinite' }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3 }}>SCROLL</span>
        </div>
      </section>

      {/* ── STATS ROW ─────────────────────────────────────────────────────── */}
      <section style={{ borderTop: '2px solid var(--structure)', borderBottom: '2px solid var(--structure)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { value: '3',      label: 'USER ROLES' },
            { value: '6-CHAR', label: 'INVITE CODES' },
            { value: 'LIVE',   label: 'QR CHECK-IN' },
            { value: 'JWT',    label: 'SECURED ROUTING' },
          ].map(({ value, label }, i) => (
            <div key={label} style={{
              padding: '2.5rem 2rem',
              borderRight: i < 3 ? '1px solid var(--dim-border)' : 'none',
              display: 'flex', flexDirection: 'column', gap: '0.5rem',
            }}>
              <p style={{ fontFamily: "'VT323', monospace", fontSize: '3rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1 }}>
                {value}
              </p>
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.4 }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES BENTO GRID ───────────────────────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 3rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: "'VT323', monospace", textTransform: 'uppercase',
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            color: 'var(--structure)', lineHeight: 1.0, whiteSpace: 'nowrap',
          }}>
            PLATFORM<br />CAPABILITIES
          </h2>
          <div style={{ flex: 1, height: '2px', background: 'var(--structure)', opacity: 0.15, marginBottom: '0.5rem' }} />
        </div>

        {/* Asymmetric bento: first tile spans 2 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {features.map((f, i) => (
            <FeatureTile key={f.title} {...f} spanTwo={i === 0} />
          ))}
        </div>
      </section>

      {/* ── ROLE ARCHITECTURE ─────────────────────────────────────────────── */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 3rem 6rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2rem', marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: "'VT323', monospace", textTransform: 'uppercase',
            fontSize: 'clamp(3rem, 6vw, 5.5rem)',
            color: 'var(--structure)', lineHeight: 1.0, whiteSpace: 'nowrap',
          }}>
            THREE<br />WORKSPACES
          </h2>
          <div style={{ flex: 1, height: '2px', background: 'var(--structure)', opacity: 0.15, marginBottom: '0.5rem' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {roles.map(r => <RoleCard key={r.role} {...r} />)}
        </div>
      </section>

      {/* -- CTA BANNER -- 60/30/10 FIX: was background: var(--pop) - VIOLATION */}
      {/* Now: --anchor bg (60%), --pop border + CTA button (10%) */}
      <section style={{
        margin: '0 auto 6rem', maxWidth: 'calc(1200px - 6rem)',
        background: 'var(--anchor)', border: '2px solid var(--pop)', boxShadow: 'var(--shadow)',
        padding: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2rem',
      }}>
        <div>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '0.75rem' }}>
            READY?
          </p>
          <h2 style={{ fontFamily: "'VT323', monospace", textTransform: 'uppercase', fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'var(--structure)', lineHeight: 1.0 }}>
            STOP MANAGING SPREADSHEETS.
          </h2>
        </div>
        <button
          className="grit-btn"
          onClick={() => navigate('/login')}
          style={{
            height: '3.25rem', padding: '0 2.5rem', flexShrink: 0,
            background: 'var(--pop)', border: '2px solid var(--pop)',
            color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
            boxShadow: 'var(--shadow)',
            display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer',
          }}
        >
          SUBMIT YOUR FIRST EVENT <ArrowRight size={13} />
        </button>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer style={{
        borderTop: '2px solid var(--structure)',
        padding: '2rem 3rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', letterSpacing: '0.05em' }}>
          EVENTSPHERE
        </p>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3 }}>
          © 2026 EVENTSPHERE · BUILD #a4f1c9 · 2026-08-19
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
