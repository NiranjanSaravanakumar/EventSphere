import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, CheckSquare, Percent, Calendar,
  TrendingUp, RefreshCw, Layers, Activity, Shield,
  ChevronRight, LogOut, Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AnimatedCounter from '../components/ui/AnimatedCounter.jsx';
import { analyticsApi } from '../services/api.js';

// ── Spring config ──────────────────────────────────────────────────────────────
const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

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
    {/* Top specular line */}
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />

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

      {/* Fill bar */}
      <div style={{ width: '80px' }}>
        <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${fill}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 + index * 0.04 }}
            style={{ height: '100%', background: statusColor, borderRadius: '3px' }}
          />
        </div>
      </div>

      {/* Registered count */}
      <span style={{ fontSize: '0.75rem', color: '#71717A', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
        {stat.registered.toLocaleString()} / {stat.capacity.toLocaleString()}
      </span>

      {/* Event code */}
      <span style={{
        fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
        fontSize: '0.6875rem', fontWeight: 700,
        color: '#71717A', letterSpacing: '0.10em',
        padding: '0.2rem 0.5rem', borderRadius: '0.3rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        whiteSpace: 'nowrap',
      }}>
        {stat.eventCode ?? '—'}
      </span>

      {/* Status badge */}
      <span style={{
        padding: '0.2rem 0.5rem', borderRadius: '0.3rem',
        background: `${statusColor}15`,
        border: `1px solid ${statusColor}30`,
        color: statusColor, fontSize: '0.625rem', fontWeight: 700,
        letterSpacing: '0.06em',
      }}>
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
          <motion.circle
            cx="40" cy="40" r={radius}
            fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="5" strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FAFAFA' }}>{Math.round(pct)}%</span>
        </div>
      </div>
      <p style={{ fontSize: '0.6875rem', color: '#52525b', textAlign: 'center', letterSpacing: '0.04em' }}>{label}</p>
    </div>
  );
};

// ── Main Admin Dashboard ───────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const navigate   = useNavigate();
  const { logout } = useAuth();
  const [data, setData]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeNav, setActiveNav]   = useState('overview');

  const fetchData = useCallback(async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      const { data: metrics } = await analyticsApi.dashboard();
      setData(metrics);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleLogout = () => { logout(); navigate('/auth'); };

  return (
    <div style={{
      minHeight: '100vh', background: '#050505', color: '#FAFAFA',
      fontFamily: 'Inter, system-ui, sans-serif',
      display: 'flex',
    }}>

      {/* ── FIXED LEFT SIDEBAR ─────────────────────────────────────────────────── */}
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
            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.01em' }}>
              EventSphere
            </span>
          </div>
          <p style={{ fontSize: '0.6875rem', color: '#27272a', marginTop: '0.2rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Admin Console
          </p>
        </div>

        {/* Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
          <p style={{ fontSize: '0.625rem', fontWeight: 600, color: '#27272a', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 0.875rem', marginBottom: '0.5rem' }}>
            System
          </p>
          <NavItem icon={Activity}  label="Overview"       active={activeNav === 'overview'}  onClick={() => setActiveNav('overview')} />
          <NavItem icon={Globe}     label="All Events"     active={activeNav === 'events'}    onClick={() => setActiveNav('events')} />
          <NavItem icon={Users}     label="User Directory" active={activeNav === 'users'}     onClick={() => setActiveNav('users')} />
          <NavItem icon={BarChart3} label="Analytics"      active={activeNav === 'analytics'} onClick={() => setActiveNav('analytics')} />
        </nav>

        {/* Bottom actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem' }}>
          <motion.button
            whileHover={{ x: 3 }} transition={SPRING}
            onClick={() => fetchData(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none',
              background: 'transparent', color: '#52525b',
              fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, repeat: refreshing ? Infinity : 0, ease: 'linear' }}>
              <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
            </motion.div>
            Refresh
          </motion.button>

          <motion.button
            whileHover={{ x: 3 }} transition={SPRING}
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem', borderRadius: '0.625rem', border: 'none',
              background: 'transparent', color: '#52525b',
              fontSize: '0.8125rem', cursor: 'pointer', textAlign: 'left',
            }}
          >
            <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
            Sign Out
          </motion.button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2rem 2.5rem', minWidth: 0, overflowY: 'auto' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.025em' }}>
              System Overview
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#3f3f46', marginTop: '0.25rem' }}>
              Global platform metrics · All events · All organizers
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.875rem', background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.15)', borderRadius: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
            <span style={{ fontSize: '0.6875rem', fontWeight: 500, color: '#34d399' }}>System Online</span>
          </div>
        </div>

        {/* States */}
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
            {/* ── BENTO GRID ─────────────────────────────────────────────────── */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gridTemplateRows: 'auto auto auto',
              gap: '0.875rem',
              marginBottom: '2rem',
            }}>
              {/* Large: Attendance Funnel — col-span-2 row-span-2 */}
              <div style={{
                gridColumn: '1 / 3', gridRow: '1 / 3',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.875rem', padding: '1.75rem',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)' }} />
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46', marginBottom: '1.75rem' }}>
                  Attendee Funnel
                </p>

                {[
                  { label: 'Total Capacity',   value: data.totalCapacity,      max: data.totalCapacity,      dim: false },
                  { label: 'Registered',        value: data.totalRegistrations, max: data.totalCapacity,      dim: false },
                  { label: 'Checked In',        value: data.totalCheckIns,      max: data.totalCapacity,      dim: false },
                ].map(({ label, value, max }, i) => {
                  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
                  return (
                    <div key={label} style={{ marginBottom: i < 2 ? '1.5rem' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: '#52525b' }}>{label}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 300, color: '#FAFAFA', letterSpacing: '-0.02em' }}>
                          {value.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.04)', borderRadius: '3px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 + i * 0.15 }}
                          style={{ height: '100%', background: `rgba(255,255,255,${0.15 + i * 0.15})`, borderRadius: '3px' }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Ring charts at bottom */}
                <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  <RingChart value={data.totalRegistrations} max={data.totalCapacity}      label="Fill Rate" />
                  <RingChart value={data.totalCheckIns}      max={data.totalRegistrations} label="Attendance" />
                </div>
              </div>

              {/* Small stat blocks — col 3-4, row 1 */}
              <BentoStat icon={Layers}     label="Active Events"    value={data.totalEvents}           style={{ gridColumn: '3', gridRow: '1' }} />
              <BentoStat icon={Users}      label="Registrations"    value={data.totalRegistrations}    style={{ gridColumn: '4', gridRow: '1' }} />
              <BentoStat icon={CheckSquare} label="Checked In"      value={data.totalCheckIns}         style={{ gridColumn: '3', gridRow: '2' }} />
              <BentoStat icon={Percent}    label="Attendance Rate"  value={data.overallAttendanceRate} suffix="%" decimals={1} style={{ gridColumn: '4', gridRow: '2' }} />

              {/* Wide bottom: capacity total */}
              <div style={{
                gridColumn: '1 / 5', gridRow: '3',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.875rem',
                padding: '1rem 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '2rem', flexWrap: 'wrap',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)' }} />
                <div>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46' }}>Total Platform Capacity</p>
                  <p style={{ fontSize: '2rem', fontWeight: 300, color: '#FAFAFA', lineHeight: 1, marginTop: '0.25rem', letterSpacing: '-0.02em' }}>
                    <AnimatedCounter value={data.totalCapacity} />
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3f3f46', fontSize: '0.75rem' }}>
                  <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                  {data.totalEvents} event{data.totalEvents !== 1 ? 's' : ''} tracked
                </div>
              </div>
            </div>

            {/* ── EVENT BREAKDOWN TABLE ──────────────────────────────────────── */}
            {data.eventBreakdown?.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '0.875rem', overflow: 'hidden',
              }}>
                {/* Table header */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr auto auto auto auto',
                  gap: '1.5rem', padding: '0.75rem 1.25rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.01)',
                }}>
                  {['Event', 'Fill', 'Registered / Cap', 'Code', 'Status'].map(h => (
                    <span key={h} style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#3f3f46' }}>{h}</span>
                  ))}
                </div>

                {data.eventBreakdown.map((stat, i) => (
                  <TableRow key={stat.id} stat={stat} index={i} />
                ))}
              </div>
            )}

            {/* Empty */}
            {(!data.eventBreakdown || data.eventBreakdown.length === 0) && (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#3f3f46', fontSize: '0.8125rem' }}>
                <Calendar style={{ width: '2rem', height: '2rem', margin: '0 auto 0.75rem', opacity: 0.3 }} />
                No event data yet.
              </div>
            )}
          </>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default AnalyticsDashboard;
