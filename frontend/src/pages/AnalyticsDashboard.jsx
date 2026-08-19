import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, CheckSquare, Calendar,
  TrendingUp, RefreshCw, Layers, Activity, Shield,
  LogOut, Globe, Trash2, Key, Mail,
  UserCheck, AlertTriangle, Clock, ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedCounter from '../components/ui/AnimatedCounter.jsx';
import { adminApi, eventsApi } from '../services/api.js';
import { useTheme } from '../components/shared/Navbar.jsx';

// ── Film Grain ────────────────────────────────────────────────────────────────
const FilmGrain = () => (
  <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 997, opacity: 0.06, mixBlendMode: 'overlay' }}>
    <filter id="ad-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#ad-grain)" />
  </svg>
);

// ── Sidebar Nav Item ──────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, active, onClick, id }) => (
  <button
    id={id}
    className="grit-nav-item"
    onClick={onClick}
    style={{
      width: '100%',
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '0.75rem 1rem',
      border: 'none', borderLeft: `2px solid ${active ? 'var(--pop)' : 'transparent'}`,
      background: active ? 'var(--dim-bg)' : 'transparent',
      color: active ? 'var(--structure)' : 'var(--structure-40)',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
      cursor: 'pointer', textAlign: 'left',
    }}
  >
    <Icon size={13} />
    {label}
  </button>
);

// ── Bento Stat Block ──────────────────────────────────────────────────────────
// 60/30/10 RULE:
//   accent=true  => --anchor bg, --pop border + text (pop = border/text only, <=10%)
//   accent=false => --anchor bg, --structure border + text
const BentoStat = ({ icon: Icon, label, value, suffix = '', decimals = 0, accent = false }) => (
  <div style={{
    background: 'var(--anchor)',
    border: `2px solid ${accent ? 'var(--pop)' : 'var(--structure)'}`,
    boxShadow: 'var(--shadow)',
    padding: '1.75rem',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    gap: '1.25rem',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent ? 'var(--pop)' : 'var(--structure)', opacity: accent ? 0.85 : 0.5 }}>
        {label}
      </p>
      <Icon size={12} color={accent ? 'var(--pop)' : 'var(--structure)'} style={{ opacity: 0.5 }} />
    </div>
    <div style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2.5rem, 3vw, 3.25rem)', lineHeight: 1, textTransform: 'uppercase', color: accent ? 'var(--pop)' : 'var(--structure)' }}>
      <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
    </div>
  </div>
);

// ── Table Row ─────────────────────────────────────────────────────────────────
const TableRow = ({ stat }) => {
  const fill = Math.min(100, Math.round(stat.fillRate));
  const status = fill >= 90 ? 'FULL' : fill >= 60 ? 'BUSY' : 'OPEN';
  const statusColor = fill >= 90 ? 'var(--pop)' : fill >= 60 ? 'var(--structure)' : 'var(--structure-40)';

  return (
    <div className="grit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto auto 64px', alignItems: 'center', gap: '1.5rem', padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--dim-border)' }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', fontWeight: 700, color: 'var(--structure)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.title}</p>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.4, marginTop: '0.2rem' }}>{stat.date}</p>
      </div>
      <div style={{ width: '80px' }}>
        <div style={{ width: '100%', height: '3px', background: 'var(--dim-border)' }}>
          <div style={{ width: `${fill}%`, height: '100%', background: fill >= 90 ? 'var(--pop)' : 'var(--structure)', opacity: fill >= 90 ? 1 : 0.6 }} />
        </div>
      </div>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem', color: 'var(--structure)', opacity: 0.7, whiteSpace: 'nowrap' }}>
        {stat.registered.toLocaleString()}&thinsp;/&thinsp;{stat.capacity.toLocaleString()}
      </span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, color: 'var(--structure)', letterSpacing: '0.12em', padding: '0.2rem 0.5rem', border: '1px solid var(--dim-border)', whiteSpace: 'nowrap' }}>
        {stat.eventCode ?? '—'}
      </span>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', color: statusColor, border: `1px solid ${statusColor}`, padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}>
        {status}
      </span>
    </div>
  );
};

// ── Ring Chart ────────────────────────────────────────────────────────────────
const RingChart = ({ value, max, label }) => {
  const pct  = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const r    = 32;
  const circ = 2 * Math.PI * r;
  return (
    <figure style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={r} fill="none" stroke="var(--dim-border)" strokeWidth="4" />
          <motion.circle
            cx="40" cy="40" r={r}
            fill="none" stroke="var(--pop)" strokeWidth="4" strokeLinecap="square"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 1.2, ease: 'linear', delay: 0.3 }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: "'VT323', monospace", fontSize: '1.25rem', color: 'var(--structure)' }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <figcaption style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5 }}>
        {label}
      </figcaption>
    </figure>
  );
};

// ── Role Badge ────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    ROLE_ADMIN:     { label: 'ADMIN',     color: 'var(--pop)' },
    ROLE_ORGANIZER: { label: 'ORGANIZER', color: 'var(--structure)' },
    ROLE_ATTENDEE:  { label: 'ATTENDEE',  color: 'var(--structure-40)' },
  };
  const cfg = map[role] ?? { label: role, color: 'var(--dim-border)' };
  return (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', color: cfg.color, border: `1px solid ${cfg.color}`, padding: '0.2rem 0.5rem' }}>
      {cfg.label}
    </span>
  );
};

// ── Drilldown Accordion Card ──────────────────────────────────────────────────
const DrilldownCard = ({ title, icon: Icon, items, type }) => {
  const [expanded, setExpanded] = useState(null);
  return (
    <div style={{ background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--dim-border)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Icon size={16} color="var(--pop)" />
        <div>
          <h3 style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1 }}>{title}</h3>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.4, marginTop: '0.375rem' }}>
            {items.length} REGISTERED
          </p>
        </div>
      </div>
      <div>
        {items.map((item) => {
          const isOpen = expanded === item.id;
          return (
            <div key={item.id} style={{ borderBottom: '1px solid var(--dim-border)' }}>
              <button
                onClick={() => setExpanded(isOpen ? null : item.id)}
                className="grit-nav-item"
                style={{ width: '100%', padding: '1rem 1.5rem', border: 'none', borderLeft: 'none', background: isOpen ? 'var(--dim-bg)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', textAlign: 'left', color: 'var(--structure)' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--structure)' }}>{item.name}</span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.4, letterSpacing: '0.04em' }}>{item.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5, border: '1px solid var(--dim-border)', padding: '0.2rem 0.5rem' }}>
                    {type === 'organizer' ? `${item.eventTitles.length} EVENTS` : `${item.registeredEvents.length} REG`}
                  </span>
                  <span style={{ fontFamily: "'VT323', monospace", fontSize: '1.25rem', color: 'var(--structure)', display: 'inline-block', lineHeight: 1, transition: 'transform 0.1s steps(2, end)', transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                    {isOpen ? '−' : '+'}
                  </span>
                </div>
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.1, ease: 'linear' }} style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '0.75rem 1.5rem 1.25rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {type === 'organizer' && item.eventTitles.map((title, i) => (
                        <div key={i} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.625rem', color: 'var(--structure)', opacity: 0.65, display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <span style={{ color: 'var(--pop)', fontWeight: 700 }}>—</span>{title}
                        </div>
                      ))}
                      {type === 'organizer' && item.eventTitles.length === 0 && (
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.35, letterSpacing: '0.08em', textTransform: 'uppercase' }}>NO EVENTS YET</span>
                      )}
                      {type === 'attendee' && item.registeredEvents.map((evt, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.625rem', color: 'var(--structure)', opacity: 0.65 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                            <span style={{ color: evt.status === 'CHECKED_IN' ? 'var(--pop)' : 'var(--structure)', fontWeight: 700 }}>—</span>
                            {evt.title}
                          </div>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', color: evt.status === 'CHECKED_IN' ? 'var(--pop)' : 'var(--structure)', border: `1px solid ${evt.status === 'CHECKED_IN' ? 'var(--pop)' : 'var(--dim-border)'}`, padding: '0.15rem 0.4rem' }}>
                            {evt.status}
                          </span>
                        </div>
                      ))}
                      {type === 'attendee' && item.registeredEvents.length === 0 && (
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.35, letterSpacing: '0.08em', textTransform: 'uppercase' }}>NO REGISTRATIONS</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {items.length === 0 && (
          <div style={{ padding: '2rem 1.5rem', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3 }}>
            NONE FOUND
          </div>
        )}
      </div>
    </div>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.aside role="alert" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.1, ease: 'linear' }}
    style={{ position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 999, display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '1rem 1.5rem', background: 'var(--anchor)', border: `2px solid ${type === 'success' ? 'var(--pop)' : 'var(--structure)'}`, boxShadow: 'var(--shadow)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)' }}>
    {message}
  </motion.aside>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = ({ label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '4rem 0' }}>
    <span className="spin-grit" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid var(--dim-border)', borderTopColor: 'var(--structure)', borderRadius: '50%' }} />
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.4 }}>{label}</span>
  </div>
);

const TAB_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1, ease: 'linear' } },
  exit:    { opacity: 0, transition: { duration: 0.08, ease: 'linear' } },
};

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const navigate   = useNavigate();
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();

  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeNav, setActiveNav]   = useState('overview');

  const [allEvents, setAllEvents]         = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsLoaded, setEventsLoaded]   = useState(false);
  const [deletingId, setDeletingId]       = useState(null);

  const [allUsers, setAllUsers]         = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded]   = useState(false);

  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const { data: metrics } = await adminApi.analytics();
      setData(metrics);
    } catch (err) {
      setError(err?.response?.data?.message || 'FAILED TO LOAD ANALYTICS.');
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fetchAllEvents = useCallback(async () => {
    if (eventsLoaded) return;
    setEventsLoading(true);
    try {
      const { data: events } = await adminApi.getEvents();
      setAllEvents(events); setEventsLoaded(true);
    } catch { showToast('FAILED TO LOAD EVENTS.', 'error'); }
    finally { setEventsLoading(false); }
  }, [eventsLoaded]);

  const fetchAllUsers = useCallback(async () => {
    if (usersLoaded) return;
    setUsersLoading(true);
    try {
      const { data: users } = await adminApi.getUsers();
      setAllUsers(users); setUsersLoaded(true);
    } catch { showToast('FAILED TO LOAD USERS.', 'error'); }
    finally { setUsersLoading(false); }
  }, [usersLoaded]);

  const handleNavClick = (tab) => {
    setActiveNav(tab);
    if (tab === 'events') fetchAllEvents();
    if (tab === 'users')  fetchAllUsers();
  };

  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`MASTER OVERRIDE: Permanently delete "${title}"?\n\nAll registrations for this event will be removed.`)) return;
    setDeletingId(eventId);
    try {
      await eventsApi.delete(eventId);
      setAllEvents(prev => prev.filter(e => e.id !== eventId));
      showToast('EVENT FORCEFULLY DELETED.', 'success');
      setData(null); fetchData(true);
    } catch (err) {
      showToast(err?.response?.data?.message || 'DELETE FAILED.', 'error');
    } finally { setDeletingId(null); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const headerMap = {
    overview:  { title: 'SYSTEM OVERVIEW',    sub: 'GLOBAL METRICS // ALL EVENTS // ALL ORGANIZERS' },
    events:    { title: 'ALL EVENTS',          sub: 'MASTER VIEW — EVERY EVENT ACROSS ALL ORGANIZERS' },
    users:     { title: 'USER DIRECTORY',      sub: 'ALL REGISTERED ACCOUNTS ACROSS EVERY ROLE' },
    analytics: { title: 'PLATFORM ANALYTICS',  sub: 'FUNNEL BREAKDOWN // FILL RATES // CHECK-IN DATA' },
  };
  const hdr = headerMap[activeNav] ?? headerMap.overview;

  const SectionDivider = ({ title }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', marginTop: '2.5rem' }}>
      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pop)', flexShrink: 0 }}>{title}</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--dim-border)' }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--anchor)', color: 'var(--structure)', display: 'flex' }}>
      <FilmGrain />

      {/* ── FIXED SIDEBAR ───────────────────────────────────────────────────── */}
      <aside style={{
        width: '200px', flexShrink: 0,
        borderRight: '2px solid var(--structure)',
        background: 'var(--anchor)',
        display: 'flex', flexDirection: 'column',
        padding: '2rem 0',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '0 1.25rem 2rem', borderBottom: '1px solid var(--dim-border)' }}>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.25rem', textTransform: 'uppercase', color: 'var(--structure)', letterSpacing: '0.05em', lineHeight: 1 }}>
            EVENTSPHERE
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pop)', marginTop: '0.375rem' }}>
            ADMIN CONSOLE
          </p>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: '1rem 0' }}>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3, padding: '0 1.25rem', marginBottom: '0.5rem' }}>
            SYSTEM
          </p>
          <NavItem id="nav-overview"  icon={Activity}  label="OVERVIEW"   active={activeNav === 'overview'}  onClick={() => handleNavClick('overview')} />
          <NavItem id="nav-events"    icon={Globe}     label="ALL EVENTS" active={activeNav === 'events'}    onClick={() => handleNavClick('events')} />
          <NavItem id="nav-users"     icon={Users}     label="DIRECTORY"  active={activeNav === 'users'}     onClick={() => handleNavClick('users')} />
          <NavItem id="nav-analytics" icon={BarChart3} label="ANALYTICS"  active={activeNav === 'analytics'} onClick={() => handleNavClick('analytics')} />
        </nav>

        {/* Bottom actions */}
        <div style={{ borderTop: '1px solid var(--dim-border)', padding: '1rem 0 0' }}>
          {/* Theme toggle */}
          <button
            className="grit-nav-item"
            onClick={toggle}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1.25rem', border: 'none', borderLeft: '2px solid transparent', background: 'transparent', color: 'var(--structure-40)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left' }}
          >
            <span style={{ fontSize: '1rem' }}>{theme === 'dark' ? '☀' : '☾'}</span>
            {theme === 'dark' ? 'LIGHT' : 'DARK'}
          </button>
          <button
            id="sidebar-refresh-btn"
            className="grit-btn grit-nav-item"
            onClick={() => fetchData(true)}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1.25rem', border: 'none', borderLeft: '2px solid transparent', background: 'transparent', color: 'var(--structure-40)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left' }}
          >
            <RefreshCw size={13} style={{ animation: refreshing ? 'spin-grit 0.8s linear infinite' : 'none' }} />
            REFRESH
          </button>
          <button
            id="sidebar-logout-btn"
            className="grit-btn grit-nav-item"
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.75rem 1.25rem', border: 'none', borderLeft: '2px solid transparent', background: 'transparent', color: 'var(--structure-40)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', cursor: 'pointer', textAlign: 'left' }}
          >
            <LogOut size={13} /> SIGN OUT
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0, display: 'flex', flexDirection: 'column' }}>

        {/* Page Header */}
        <div style={{ position: 'sticky', top: 0, zIndex: 50, padding: '1.75rem 3rem', background: 'var(--anchor)', borderBottom: '2px solid var(--structure)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '0.5rem' }}>
                {hdr.sub}
              </p>
              <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2.5rem, 3vw, 3.5rem)', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1 }}>
                {hdr.title}
              </h1>
            </motion.div>
          </AnimatePresence>

          {/* System status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', padding: '0.5rem 1rem', border: '1px solid var(--pop)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: '6px', height: '6px', background: 'var(--pop)' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pop)' }}>
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '3rem', flex: 1 }}>
          <AnimatePresence mode="wait">

            {/* OVERVIEW */}
            {activeNav === 'overview' && (
              <motion.div key="overview" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
                {loading && <Spinner label="LOADING SYSTEM DATA..." />}
                {error && !loading && (
                  <div style={{ padding: '1.5rem', border: '1px solid var(--structure)', color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem', letterSpacing: '0.06em' }}>
                    !! {error} — <button onClick={() => fetchData()} style={{ background: 'none', border: 'none', color: 'var(--pop)', textDecoration: 'underline', cursor: 'pointer', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem' }}>RETRY</button>
                  </div>
                )}
                {!loading && !error && data && (
                  <>
                    <section aria-label="System statistics" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                      <BentoStat icon={Layers}      label="Active Events"  value={data.activeEventsCount} />
                      <BentoStat icon={Calendar}    label="Completed"      value={data.completedEventsCount} />
                      <BentoStat icon={Users}       label="Registrations"  value={data.totalRegistrations} />
                      <BentoStat icon={CheckSquare} label="Checked In"     value={data.totalCheckIns} accent />
                    </section>
                    <SectionDivider title="USER BREAKDOWN" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <DrilldownCard title="ORGANIZERS" icon={Shield} items={data.organizers || []} type="organizer" />
                      <DrilldownCard title="ATTENDEES"  icon={Users}  items={data.attendees  || []} type="attendee" />
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ANALYTICS */}
            {activeNav === 'analytics' && (
              <motion.div key="analytics" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
                {loading && <Spinner label="LOADING ANALYTICS..." />}
                {error && !loading && <div style={{ padding: '1.5rem', border: '1px solid var(--structure)', color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem' }}>!! {error}</div>}
                {!loading && !error && data && (
                  <>
                    <section aria-label="Attendee funnel" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                      {/* Funnel bars */}
                      <div style={{ background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', padding: '2rem' }}>
                        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5, marginBottom: '2rem' }}>ATTENDEE FUNNEL</p>
                        {[
                          { label: 'TOTAL CAPACITY', value: data.totalCapacity,      max: data.totalCapacity },
                          { label: 'REGISTERED',      value: data.totalRegistrations, max: data.totalCapacity },
                          { label: 'CHECKED IN',      value: data.totalCheckIns,      max: data.totalCapacity },
                        ].map(({ label, value, max }, i) => {
                          const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
                          return (
                            <div key={label} style={{ marginBottom: i < 2 ? '1.75rem' : 0 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.625rem' }}>
                                <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.55 }}>{label}</span>
                                <span style={{ fontFamily: "'VT323', monospace", fontSize: '1.75rem', color: i === 2 ? 'var(--pop)' : 'var(--structure)', lineHeight: 1 }}>{value.toLocaleString()}</span>
                              </div>
                              <div style={{ width: '100%', height: '3px', background: 'var(--dim-border)' }}>
                                <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.2, ease: 'linear', delay: 0.15 + i * 0.1 }} style={{ height: '100%', background: i === 2 ? 'var(--pop)' : 'var(--structure)', opacity: i === 2 ? 1 : 0.5 + i * 0.25 }} />
                              </div>
                            </div>
                          );
                        })}
                        <div style={{ display: 'flex', gap: '2.5rem', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--dim-border)' }}>
                          <RingChart value={data.totalRegistrations} max={data.totalCapacity}      label="FILL RATE" />
                          <RingChart value={data.totalCheckIns}      max={data.totalRegistrations} label="ATTENDANCE" />
                        </div>
                      </div>

                      {/* Platform totals */}
                      <div style={{ background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', gap: '1.5rem' }}>
                        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.45 }}>TOTAL PLATFORM CAPACITY</p>
                        <p style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(3rem, 5vw, 5.5rem)', lineHeight: 1, color: 'var(--structure)' }}>
                          <AnimatedCounter value={data.totalCapacity} />
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <TrendingUp size={14} color="var(--pop)" />
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.55 }}>
                            {data.totalEvents} EVENT{data.totalEvents !== 1 ? 'S' : ''} TRACKED
                          </span>
                        </div>
                      </div>
                    </section>

                    {data.eventBreakdown?.length > 0 && (
                      <>
                        <SectionDivider title="EVENT BREAKDOWN" />
                        <div style={{ border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px auto auto 64px', gap: '1.5rem', padding: '0.875rem 1.5rem', borderBottom: '2px solid var(--structure)', background: 'var(--dim-bg)' }}>
                            {['EVENT', 'FILL', 'REG / CAP', 'CODE', 'STATUS'].map(h => (
                              <span key={h} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5 }}>{h}</span>
                            ))}
                          </div>
                          {data.eventBreakdown.map((stat, i) => <TableRow key={stat.id} stat={stat} index={i} />)}
                        </div>
                      </>
                    )}
                    {(!data.eventBreakdown || data.eventBreakdown.length === 0) && (
                      <div style={{ textAlign: 'center', padding: '4rem', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3 }}>NO EVENT DATA YET</div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ALL EVENTS */}
            {activeNav === 'events' && (
              <motion.div key="events" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
                {eventsLoading && <Spinner label="LOADING ALL EVENTS..." />}
                {!eventsLoading && (
                  <div style={{ border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <div style={{ padding: '0.875rem 1.5rem', borderBottom: '1px solid var(--structure)', background: 'var(--dim-bg)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <AlertTriangle size={13} color="var(--pop)" />
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--pop)' }}>
                        GOD-MODE VIEW — INCLUDES INVITE CODES. ADMIN EYES ONLY.
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr auto auto auto 2rem', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '2px solid var(--structure)', background: 'var(--dim-bg)' }}>
                      {['EVENT', 'ORGANIZER', 'CODE', 'SEATS', 'STATUS', ''].map(h => (
                        <span key={h + 'ev'} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5 }}>{h}</span>
                      ))}
                    </div>
                    {allEvents.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3 }}>NO EVENTS ON THE PLATFORM YET</div>}
                    {allEvents.map((event) => {
                      const fill = event.capacity > 0 ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100)) : 0;
                      const status = fill >= 90 ? 'FULL' : fill >= 60 ? 'BUSY' : 'OPEN';
                      const statusColor = fill >= 90 ? 'var(--pop)' : fill >= 60 ? 'var(--structure)' : 'var(--structure-40)';
                      const isDeleting = deletingId === event.id;
                      return (
                        <div key={event.id} className="grit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr auto auto auto 2rem', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--dim-border)', opacity: isDeleting ? 0.4 : 1, transition: 'opacity 0.1s linear' }}>
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', fontWeight: 700, color: 'var(--structure)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--structure)', opacity: 0.4, marginTop: '0.2rem' }}>
                              {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </p>
                          </div>
                          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.625rem', color: 'var(--structure)', opacity: 0.6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>{event.organizerName}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                            <Key size={10} color="var(--structure)" style={{ opacity: 0.4 }} />
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--structure)', letterSpacing: '0.12em', padding: '0.2rem 0.5rem', border: '1px solid var(--dim-border)' }}>{event.eventCode ?? '—'}</span>
                          </div>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem', color: 'var(--structure)', opacity: 0.65, whiteSpace: 'nowrap' }}>{event.registeredCount ?? 0}&thinsp;/&thinsp;{event.capacity}</span>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', color: statusColor, border: `1px solid ${statusColor}`, padding: '0.25rem 0.5rem', whiteSpace: 'nowrap' }}>{status}</span>
                          <button id={`admin-delete-event-${event.id}`} className="grit-btn" disabled={isDeleting} onClick={() => handleDeleteEvent(event.id, event.title)} title="Master Override: Delete event"
                            style={{ width: '2rem', height: '2rem', background: 'transparent', border: '1px solid var(--structure)', color: 'var(--structure)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: isDeleting ? 'not-allowed' : 'pointer' }}>
                            {isDeleting ? <span className="spin-grit" style={{ display: 'inline-block', width: '0.625rem', height: '0.625rem', border: '1.5px solid var(--structure)', borderTopColor: 'transparent', borderRadius: '50%' }} /> : <Trash2 size={11} />}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* USER DIRECTORY */}
            {activeNav === 'users' && (
              <motion.div key="users" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
                {usersLoading && <Spinner label="LOADING USER DIRECTORY..." />}
                {!usersLoading && (
                  <div style={{ border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '2px solid var(--structure)', background: 'var(--dim-bg)' }}>
                      {['NAME / EMAIL', 'JOINED', 'ROLE', 'ACTIVITY'].map(h => (
                        <span key={h + 'us'} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5 }}>{h}</span>
                      ))}
                    </div>
                    {allUsers.length === 0 && <div style={{ padding: '4rem', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3 }}>NO USERS FOUND</div>}
                    {allUsers.map((user) => (
                      <div key={user.id} className="grit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--dim-border)' }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', fontWeight: 700, color: 'var(--structure)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name || user.username || '—'}</p>
                          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--structure)', opacity: 0.4, marginTop: '0.2rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                        </div>
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.5 }}>
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                        <RoleBadge role={user.role} />
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.45, border: '1px solid var(--dim-border)', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}>
                          {user.role === 'ROLE_ORGANIZER' ? `${(user.eventTitles || []).length} EVENTS` : `${(user.registeredEvents || []).length} REG`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsDashboard;
