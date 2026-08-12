import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, CheckSquare, Percent, Calendar,
  TrendingUp, RefreshCw, Layers, Activity, Shield,
  ChevronRight, LogOut, Globe, Trash2, Key, Mail,
  UserCheck, AlertTriangle, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedCounter from '../components/ui/AnimatedCounter.jsx';
import { adminApi, eventsApi } from '../services/api.js';

// ── Spring config ──────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

// ── Tab animation variants ─────────────────────────────────────────────────────
const TAB_VARIANTS = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)', transition: { ...SPRING, duration: 0.25 } },
  exit:    { opacity: 0, y: -8, filter: 'blur(4px)', transition: { duration: 0.15 } },
};

// ── Sidebar nav item ───────────────────────────────────────────────────────────
const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <motion.button
    onClick={onClick}
    whileHover={{ x: 3 }}
    transition={SPRING}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none',
      background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
      borderLeft: active ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
      color: active ? '#FAFAFA' : '#52525b',
      fontSize: '0.8125rem', fontWeight: active ? 600 : 400,
      cursor: 'pointer', textAlign: 'left', transition: 'color 0.15s',
    }}
  >
    <Icon style={{ width: '0.875rem', height: '0.875rem', flexShrink: 0 }} />
    {label}
  </motion.button>
);

// ── Bento stat block ───────────────────────────────────────────────────────────
const BentoStat = ({ icon: Icon, label, value, suffix = '', decimals = 0, style: extraStyle = {} }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={SPRING}
    style={{
      position: 'relative', padding: '1.5rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '0.875rem', overflow: 'hidden',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      ...extraStyle,
    }}
  >
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46' }}>
        {label}
      </p>
      <div style={{ width: '1.75rem', height: '1.75rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon style={{ width: '0.75rem', height: '0.75rem', color: '#71717A' }} />
      </div>
    </div>
    <div style={{ fontSize: '2.5rem', fontWeight: 300, color: '#FAFAFA', lineHeight: 1, letterSpacing: '-0.02em', marginTop: '1.5rem' }}>
      <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
    </div>
  </motion.div>
);

// ── Analytics breakdown table row ──────────────────────────────────────────────
const TableRow = ({ stat, index }) => {
  const fill = Math.min(100, Math.round(stat.fillRate));
  const status = fill >= 90 ? 'FULL' : fill >= 60 ? 'BUSY' : 'OPEN';
  const statusColor = fill >= 90 ? '#f87171' : fill >= 60 ? '#fbbf24' : '#34d399';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...SPRING, delay: index * 0.04 }}
      style={{
        display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
        alignItems: 'center', gap: '1.5rem',
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#D4D4D8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.title}</p>
        <p style={{ fontSize: '0.6875rem', color: '#3f3f46', marginTop: '0.125rem' }}>{stat.date}</p>
      </div>
      <div style={{ width: '80px' }}>
        <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${fill}%` }} transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 + index * 0.04 }} style={{ height: '100%', background: statusColor, borderRadius: '3px' }} />
        </div>
      </div>
      <span style={{ fontSize: '0.75rem', color: '#71717A', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {stat.registered.toLocaleString()} / {stat.capacity.toLocaleString()}
      </span>
      <span style={{ fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: '0.6875rem', fontWeight: 700, color: '#71717A', letterSpacing: '0.10em', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', whiteSpace: 'nowrap' }}>
        {stat.eventCode ?? '—'}
      </span>
      <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.3rem', background: `${statusColor}15`, border: `1px solid ${statusColor}30`, color: statusColor, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em' }}>
        {status}
      </span>
    </motion.div>
  );
};

// ── Ring chart ─────────────────────────────────────────────────────────────────
const RingChart = ({ value, max, label }) => {
  const pct    = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const radius = 32;
  const circ   = 2 * Math.PI * radius;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width: '80px', height: '80px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="5" />
          <motion.circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeLinecap="round" strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: circ - (pct / 100) * circ }} transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FAFAFA' }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <p style={{ fontSize: '0.6875rem', color: '#52525b', textAlign: 'center', letterSpacing: '0.04em' }}>{label}</p>
    </div>
  );
};

// ── Role badge ─────────────────────────────────────────────────────────────────
const RoleBadge = ({ role }) => {
  const map = {
    ROLE_ADMIN:     { label: 'Admin',     color: '#a78bfa' },
    ROLE_ORGANIZER: { label: 'Organizer', color: '#60a5fa' },
    ROLE_ATTENDEE:  { label: 'Attendee',  color: '#34d399' },
  };
  const cfg = map[role] ?? { label: role, color: '#71717A' };
  return (
    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.3rem', background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, color: cfg.color, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.05em' }}>
      {cfg.label}
    </span>
  );
};

// ── Drilldown Card (Accordion) ────────────────────────────────────────────────
const DrilldownCard = ({ title, icon: Icon, items, type }) => {
  const [expanded, setExpanded] = useState(null);

  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon style={{ width: '1rem', height: '1rem', color: '#a5b4fc' }} />
        </div>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FAFAFA' }}>{title}</h3>
          <p style={{ fontSize: '0.6875rem', color: '#71717A' }}>{items.length} total</p>
        </div>
      </div>
      <div style={{ padding: '0.5rem' }}>
        {items.map((item, idx) => {
          const isExpanded = expanded === item.id;
          return (
            <div key={item.id} style={{ marginBottom: idx === items.length - 1 ? 0 : '0.25rem' }}>
              <motion.button
                onClick={() => setExpanded(isExpanded ? null : item.id)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: 'none',
                  background: isExpanded ? 'rgba(255,255,255,0.04)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: isExpanded ? '#FAFAFA' : '#D4D4D8' }}>{item.name}</span>
                  <span style={{ fontSize: '0.6875rem', color: '#52525b' }}>{item.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '99px' }}>
                    {type === 'organizer' ? `${item.eventTitles.length} events` : `${item.registeredEvents.length} registrations`}
                  </span>
                  <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                    <ChevronRight style={{ width: '1rem', height: '1rem', color: '#71717A' }} />
                  </motion.div>
                </div>
              </motion.button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div style={{ padding: '0.5rem 1rem 1rem 2.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {type === 'organizer' && item.eventTitles.map((title, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#a5b4fc' }} />
                          {title}
                        </div>
                      ))}
                      {type === 'organizer' && item.eventTitles.length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#52525b' }}>No events created yet.</span>
                      )}
                      
                      {type === 'attendee' && item.registeredEvents.map((evt, i) => (
                        <div key={i} style={{ fontSize: '0.75rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: evt.status === 'CHECKED_IN' ? '#34d399' : '#60a5fa' }} />
                            {evt.title}
                          </div>
                          <span style={{ fontSize: '0.625rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', background: evt.status === 'CHECKED_IN' ? 'rgba(52,211,153,0.1)' : 'rgba(96,165,250,0.1)', color: evt.status === 'CHECKED_IN' ? '#34d399' : '#60a5fa' }}>
                            {evt.status}
                          </span>
                        </div>
                      ))}
                      {type === 'attendee' && item.registeredEvents.length === 0 && (
                        <span style={{ fontSize: '0.75rem', color: '#52525b' }}>No registrations.</span>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        {items.length === 0 && (
          <div style={{ padding: '1rem', textAlign: 'center', color: '#52525b', fontSize: '0.75rem' }}>None found.</div>
        )}
      </div>
    </div>
  );
};


// ── Toast ──────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 40, scale: 0.9 }}
    transition={SPRING}
    style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 200, display: 'flex', alignItems: 'center', gap: '0.625rem',
      padding: '0.75rem 1.5rem', borderRadius: '2rem',
      background: type === 'success' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.10)',
      border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.22)'}`,
      backdropFilter: 'blur(24px)',
      color: type === 'success' ? '#6ee7b7' : '#f87171',
      fontSize: '0.875rem', fontWeight: 500,
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    }}
  >
    {message}
  </motion.div>
);

// ── Main Admin Dashboard ───────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const navigate   = useNavigate();
  const { logout } = useAuth();

  // Overview analytics data
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Tab state
  const [activeNav, setActiveNav]   = useState('overview');

  // God-Mode events tab
  const [allEvents, setAllEvents]     = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsLoaded, setEventsLoaded]   = useState(false);
  const [deletingId, setDeletingId]       = useState(null);

  // User directory tab
  const [allUsers, setAllUsers]       = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersLoaded, setUsersLoaded]   = useState(false);

  // Toast
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Fetch: overview analytics ──────────────────────────────────────────────
  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const { data: metrics } = await adminApi.analytics();
      setData(metrics);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Fetch: all events (lazy — only when tab is opened) ────────────────────
  const fetchAllEvents = useCallback(async () => {
    if (eventsLoaded) return;
    setEventsLoading(true);
    try {
      const { data: events } = await adminApi.getEvents();
      setAllEvents(events);
      setEventsLoaded(true);
    } catch {
      showToast('Failed to load events.', 'error');
    } finally {
      setEventsLoading(false);
    }
  }, [eventsLoaded]);

  // ── Fetch: all users (lazy) ────────────────────────────────────────────────
  const fetchAllUsers = useCallback(async () => {
    if (usersLoaded) return;
    setUsersLoading(true);
    try {
      const { data: users } = await adminApi.getUsers();
      setAllUsers(users);
      setUsersLoaded(true);
    } catch {
      showToast('Failed to load users.', 'error');
    } finally {
      setUsersLoading(false);
    }
  }, [usersLoaded]);

  // ── Tab switch ─────────────────────────────────────────────────────────────
  const handleNavClick = (tab) => {
    setActiveNav(tab);
    if (tab === 'events') fetchAllEvents();
    if (tab === 'users')  fetchAllUsers();
  };

  // ── God-Mode delete ────────────────────────────────────────────────────────
  const handleDeleteEvent = async (eventId, title) => {
    if (!window.confirm(`Master Override: Permanently delete "${title}"?\n\nThis will remove all registrations for this event.`)) return;
    setDeletingId(eventId);
    try {
      await eventsApi.delete(eventId);
      setAllEvents(prev => prev.filter(e => e.id !== eventId));
      showToast('Event forcefully deleted.', 'success');
      // Invalidate overview so stats refresh on next visit
      setData(null);
      fetchData(true);
    } catch (err) {
      showToast(err?.response?.data?.message || 'Delete failed.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── Dynamic header config ──────────────────────────────────────────────────
  const headerConfig = {
    overview:  { title: 'System Overview',   sub: 'Global platform metrics · All events · All organizers' },
    events:    { title: 'Global Events',      sub: 'Master view — all events across all organizers, including secret invite codes' },
    users:     { title: 'User Directory',     sub: 'All registered accounts across every role' },
    analytics: { title: 'System Overview',   sub: 'Global platform metrics · All events · All organizers' },
  };
  const header = headerConfig[activeNav] ?? headerConfig.overview;

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#FAFAFA', fontFamily: 'Inter, system-ui, sans-serif', display: 'flex' }}>

      {/* ── FIXED LEFT SIDEBAR ────────────────────────────────────────────────── */}
      <aside style={{
        width: '220px', flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(255,255,255,0.01)',
        display: 'flex', flexDirection: 'column',
        padding: '1.75rem 1rem',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Logo */}
        <div style={{ paddingLeft: '0.875rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield style={{ width: '1rem', height: '1rem', color: '#52525b' }} />
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.01em' }}>EventSphere</span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: '#27272a', marginTop: '0.2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Admin Console</p>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 600, color: '#27272a', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.875rem', marginBottom: '0.5rem' }}>System</p>
          <NavItem icon={Activity}  label="Overview"       active={activeNav === 'overview'}  onClick={() => handleNavClick('overview')} />
          <NavItem icon={Globe}     label="All Events"     active={activeNav === 'events'}    onClick={() => handleNavClick('events')} />
          <NavItem icon={Users}     label="User Directory" active={activeNav === 'users'}     onClick={() => handleNavClick('users')} />
          <NavItem icon={BarChart3} label="Analytics"      active={activeNav === 'analytics'} onClick={() => handleNavClick('analytics')} />
        </nav>

        {/* Bottom actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <motion.button whileHover={{ x: 3 }} transition={SPRING} onClick={() => fetchData(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none', background: 'transparent', color: '#52525b', fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left' }}>
            <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
            </motion.div>
            Refresh
          </motion.button>
          <motion.button whileHover={{ x: 3 }} transition={SPRING} onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none', background: 'transparent', color: '#52525b', fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left' }}>
            <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', minWidth: 0, overflowY: 'auto' }}>

        {/* Dynamic page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeNav}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.025em' }}>
                <ScrollBounceText as="span" intensity={0.9} maxSkewDeg={2} maxTranslateY={3} stiffness={360} damping={34}>
                  {header.title}
                </ScrollBounceText>
              </h1>
              <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginTop: '0.25rem' }}>{header.sub}</p>
            </motion.div>
          </AnimatePresence>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#34d399' }}>System Online</span>
          </div>
        </div>

        {/* ── TAB CONTENT with AnimatePresence ──────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ── OVERVIEW ─────────────────────────────────────────── */}
          {activeNav === 'overview' && (
            <motion.div key="overview" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '3rem' }}>
                  <div style={{ width: '1.25rem', height: '1.25rem', border: '1.5px solid rgba(255,255,255,0.10)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#3f3f46' }}>Loading system data…</span>
                </div>
              )}
              {error && !loading && (
                <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '0.75rem', color: '#f87171', fontSize: '0.875rem' }}>
                  {error} — <button onClick={() => fetchData()} style={{ background: 'none', border: 'none', color: '#f87171', textDecoration: 'underline', cursor: 'pointer' }}>retry</button>
                </div>
              )}
              {!loading && !error && data && (
                <>
                  {/* Overview Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '2rem' }}>
                    <BentoStat icon={Layers}      label="Active Events"   value={data.activeEventsCount} />
                    <BentoStat icon={Calendar}    label="Completed"       value={data.completedEventsCount} />
                    <BentoStat icon={Users}       label="Registrations"   value={data.totalRegistrations} />
                    <BentoStat icon={CheckSquare} label="Checked In"      value={data.totalCheckIns} />
                  </div>

                  {/* Drilldown Grids */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                    <DrilldownCard title="Organizers" icon={Shield} items={data.organizers || []} type="organizer" />
                    <DrilldownCard title="Attendees" icon={Users} items={data.attendees || []} type="attendee" />
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* ── ANALYTICS ─────────────────────────────────────────── */}
          {activeNav === 'analytics' && (
            <motion.div key="analytics" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
              {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '3rem' }}>
                  <div style={{ width: '1.25rem', height: '1.25rem', border: '1.5px solid rgba(255,255,255,0.10)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#3f3f46' }}>Loading system data…</span>
                </div>
              )}
              {error && !loading && (
                <div style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', borderRadius: '0.75rem', color: '#f87171', fontSize: '0.875rem' }}>
                  {error} — <button onClick={() => fetchData()} style={{ background: 'none', border: 'none', color: '#f87171', textDecoration: 'underline', cursor: 'pointer' }}>retry</button>
                </div>
              )}
              {!loading && !error && data && (
                <>
                  {/* Analytics Funnel */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.875rem', marginBottom: '2rem' }}>
                    <div style={{ gridColumn: '1 / 3', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', padding: '1.75rem', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />
                      <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46', marginBottom: '1.75rem' }}>Attendee Funnel</p>
                      {[
                        { label: 'Total Capacity',   value: data.totalCapacity,      max: data.totalCapacity },
                        { label: 'Registered',        value: data.totalRegistrations, max: data.totalCapacity },
                        { label: 'Checked In',        value: data.totalCheckIns,      max: data.totalCapacity },
                      ].map(({ label, value, max }, i) => {
                        const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
                        return (
                          <div key={label} style={{ marginBottom: i < 2 ? '1.5rem' : 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                              <span style={{ fontSize: '0.75rem', color: '#52525b' }}>{label}</span>
                              <span style={{ fontSize: '1.25rem', fontWeight: 300, color: '#FAFAFA', letterSpacing: '-0.02em' }}>{value.toLocaleString()}</span>
                            </div>
                            <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 + i * 0.15 }} style={{ height: '100%', background: `rgba(255,255,255,${0.15 + i * 0.15})`, borderRadius: '3px' }} />
                            </div>
                          </div>
                        );
                      })}
                      <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <RingChart value={data.totalRegistrations} max={data.totalCapacity}      label="Fill Rate" />
                        <RingChart value={data.totalCheckIns}      max={data.totalRegistrations} label="Attendance" />
                      </div>
                    </div>
                    
                    <div style={{ gridColumn: '3 / 5', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46' }}>Total Platform Capacity</p>
                        <p style={{ fontSize: '3rem', fontWeight: 300, color: '#FAFAFA', lineHeight: 1, marginTop: '1rem', letterSpacing: '-0.02em' }}>
                          <AnimatedCounter value={data.totalCapacity} />
                        </p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3f3f46', fontSize: '0.875rem' }}>
                        <TrendingUp style={{ width: '1.25rem', height: '1.25rem' }} />
                        {data.totalEvents} event{data.totalEvents !== 1 ? 's' : ''} tracked
                      </div>
                    </div>
                  </div>

                  {/* Analytics breakdown table */}
                  {data.eventBreakdown?.length > 0 && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', overflow: 'hidden' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto auto', gap: '1.5rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                        {['Event', 'Fill', 'Registered / Cap', 'Code', 'Status'].map(h => (
                          <span key={h} style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46' }}>{h}</span>
                        ))}
                      </div>
                      {data.eventBreakdown.map((stat, i) => <TableRow key={stat.id} stat={stat} index={i} />)}
                    </div>
                  )}
                  {(!data.eventBreakdown || data.eventBreakdown.length === 0) && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#3f3f46', fontSize: '0.8125rem' }}>
                      <Calendar style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', opacity: 0.3 }} />
                      No event data yet.
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── GOD-MODE EVENTS TABLE ──────────────────────────────────────────── */}
          {activeNav === 'events' && (
            <motion.div key="events" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
              {eventsLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '3rem' }}>
                  <div style={{ width: '1.25rem', height: '1.25rem', border: '1.5px solid rgba(255,255,255,0.10)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#3f3f46' }}>Loading all events…</span>
                </div>
              )}
              {!eventsLoading && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', overflow: 'hidden' }}>
                  {/* Admin-only warning banner */}
                  <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(239,68,68,0.12)', background: 'rgba(239,68,68,0.04)', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                    <AlertTriangle style={{ width: '0.875rem', height: '0.875rem', color: '#f87171', flexShrink: 0 }} />
                    <span style={{ fontSize: '0.6875rem', color: '#f87171', fontWeight: 500 }}>
                      God-Mode View — Includes secret invite codes and organizer details. Admin eyes only.
                    </span>
                  </div>

                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 0.6fr auto auto auto auto', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                    {['Event', 'Organizer', 'Code', 'Seats', 'Status', ''].map(h => (
                      <span key={h} style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46' }}>{h}</span>
                    ))}
                  </div>

                  {/* Rows */}
                  {allEvents.length === 0 && !eventsLoading && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#3f3f46', fontSize: '0.8125rem' }}>
                      <Globe style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', opacity: 0.3 }} />
                      No events on the platform yet.
                    </div>
                  )}

                  {allEvents.map((event, i) => {
                    const fill = event.capacity > 0 ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100)) : 0;
                    const status = fill >= 90 ? 'FULL' : fill >= 60 ? 'BUSY' : 'OPEN';
                    const statusColor = fill >= 90 ? '#f87171' : fill >= 60 ? '#fbbf24' : '#34d399';
                    const isDeleting = deletingId === event.id;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10, transition: { duration: 0.2 } }}
                        transition={{ ...SPRING, delay: i * 0.03 }}
                        style={{
                          display: 'grid', gridTemplateColumns: '1fr 0.6fr auto auto auto auto',
                          alignItems: 'center', gap: '1rem',
                          padding: '0.875rem 1.25rem',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          opacity: isDeleting ? 0.4 : 1,
                          transition: 'opacity 0.2s',
                        }}
                      >
                        {/* Event info */}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#D4D4D8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</p>
                          <p style={{ fontSize: '0.6875rem', color: '#3f3f46', marginTop: '0.1rem' }}>
                            {event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                          </p>
                        </div>

                        {/* Organizer */}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: '0.75rem', color: '#71717A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.organizerName}
                          </p>
                        </div>

                        {/* Secret code */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                          <Key style={{ width: '0.625rem', height: '0.625rem', color: '#52525b', flexShrink: 0 }} />
                          <span style={{ fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: '0.75rem', fontWeight: 700, color: '#FAFAFA', letterSpacing: '0.12em', padding: '0.2rem 0.5rem', borderRadius: '0.3rem', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)' }}>
                            {event.eventCode ?? '—'}
                          </span>
                        </div>

                        {/* Seats */}
                        <span style={{ fontSize: '0.75rem', color: '#71717A', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                          {event.registeredCount ?? 0} / {event.capacity}
                        </span>

                        {/* Status */}
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '0.3rem', background: `${statusColor}15`, border: `1px solid ${statusColor}30`, color: statusColor, fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
                          {status}
                        </span>

                        {/* Delete button */}
                        <motion.button
                          id={`admin-delete-event-${event.id}`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          transition={SPRING}
                          disabled={isDeleting}
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          title="Master Override: Delete event"
                          style={{
                            width: '2rem', height: '2rem', borderRadius: '0.5rem',
                            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.16)',
                            color: '#f87171', cursor: isDeleting ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          {isDeleting
                            ? <div style={{ width: '0.75rem', height: '0.75rem', border: '1.5px solid #f87171', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                            : <Trash2 style={{ width: '0.75rem', height: '0.75rem' }} />
                          }
                        </motion.button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ── USER DIRECTORY ────────────────────────────────────────────────── */}
          {activeNav === 'users' && (
            <motion.div key="users" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
              {usersLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingTop: '3rem' }}>
                  <div style={{ width: '1.25rem', height: '1.25rem', border: '1.5px solid rgba(255,255,255,0.10)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.8125rem', color: '#3f3f46' }}>Loading user directory…</span>
                </div>
              )}
              {!usersLoading && (
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.875rem', overflow: 'hidden' }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr auto auto', gap: '1rem', padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                    {['#', 'Name', 'Email', 'Role', 'Joined'].map(h => (
                      <span key={h} style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46' }}>{h}</span>
                    ))}
                  </div>

                  {allUsers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '3rem', color: '#3f3f46', fontSize: '0.8125rem' }}>
                      <Users style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', opacity: 0.3 }} />
                      No users registered yet.
                    </div>
                  )}

                  {allUsers.map((user, i) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...SPRING, delay: i * 0.025 }}
                      style={{ display: 'grid', gridTemplateColumns: '2rem 1fr 1fr auto auto', alignItems: 'center', gap: '1rem', padding: '0.875rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      {/* Avatar */}
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A' }}>
                          {(user.name ?? '?').charAt(0).toUpperCase()}
                        </span>
                      </div>

                      {/* Name */}
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#D4D4D8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</p>
                      </div>

                      {/* Email */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', minWidth: 0 }}>
                        <Mail style={{ width: '0.625rem', height: '0.625rem', color: '#3f3f46', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.75rem', color: '#52525b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                      </div>

                      {/* Role */}
                      <RoleBadge role={user.role} />

                      {/* Join date */}
                      <span style={{ fontSize: '0.6875rem', color: '#3f3f46', whiteSpace: 'nowrap' }}>
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Toast */}
      <AnimatePresence>{toast && <Toast message={toast.message} type={toast.type} />}</AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AnalyticsDashboard;
