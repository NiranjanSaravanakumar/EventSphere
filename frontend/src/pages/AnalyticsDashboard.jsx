import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Users, CheckSquare, Percent,
  Calendar, TrendingUp, ArrowLeft, RefreshCw, Layers
} from 'lucide-react';
import Navbar from '../components/shared/Navbar.jsx';
import AnimatedCounter from '../components/ui/AnimatedCounter.jsx';
import { analyticsApi } from '../services/api.js';
import { useNavigate } from 'react-router-dom';

// ── Animation variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

const SPRING = { type: 'spring', stiffness: 380, damping: 28 };

// ── Stat card ──────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, suffix = '', decimals = 0, accent }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -6, scale: 1.02 }}
    transition={SPRING}
    style={{
      position: 'relative', padding: '1.75rem',
      borderRadius: '1.5rem', overflow: 'hidden',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.10)',
      display: 'flex', flexDirection: 'column', gap: '0.75rem',
      cursor: 'default',
    }}
  >
    {/* Top specular */}
    <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />

    {/* Ghost icon in corner */}
    <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', opacity: 0.07 }}>
      <Icon style={{ width: '3.5rem', height: '3.5rem', color: '#FAFAFA' }} />
    </div>

    {/* Label */}
    <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#71717A', position: 'relative', zIndex: 1 }}>
      {label}
    </p>

    {/* Value */}
    <div style={{ fontSize: '3rem', fontWeight: 700, color: '#FAFAFA', lineHeight: 1, position: 'relative', zIndex: 1 }}>
      <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
    </div>

    {/* Accent bar at bottom */}
    <motion.div
      initial={{ width: 0 }}
      animate={{ width: '40%' }}
      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
      style={{
        position: 'absolute', bottom: 0, left: 0, height: '2px',
        background: accent || 'rgba(255,255,255,0.3)',
        borderRadius: '0 2px 0 0',
      }}
    />
  </motion.div>
);

// ── Event breakdown row ────────────────────────────────────────────────────────
const EventRow = ({ stat, index }) => {
  const fillPct     = Math.min(100, stat.fillRate);
  const checkinPct  = stat.registered > 0 ? Math.round((stat.checkedIn / stat.registered) * 100) : 0;
  const fillColor   = fillPct >= 90 ? '#f87171' : fillPct >= 70 ? '#fbbf24' : '#34d399';

  return (
    <motion.div
      variants={itemVariants}
      style={{
        padding: '1.25rem 1.5rem',
        borderRadius: '1rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: '1rem',
        alignItems: 'center',
      }}
    >
      <div style={{ minWidth: 0 }}>
        {/* Title + date */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#FAFAFA', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {stat.title}
          </p>
          <span style={{ fontSize: '0.6875rem', color: '#71717A', whiteSpace: 'nowrap', flexShrink: 0 }}>
            {stat.date}
          </span>
        </div>

        {/* Fill bar */}
        <div style={{ marginTop: '0.625rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>
              {stat.registered.toLocaleString()} / {stat.capacity.toLocaleString()} registered
            </span>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: fillColor }}>
              {fillPct}%
            </span>
          </div>
          <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fillPct}%` }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.15 + index * 0.05 }}
              style={{ height: '100%', background: fillColor, borderRadius: '4px' }}
            />
          </div>
        </div>

        {/* Check-in sub-bar */}
        {stat.checkedIn > 0 && (
          <div style={{ marginTop: '0.375rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
              <span style={{ fontSize: '0.625rem', color: '#52525b' }}>
                {stat.checkedIn.toLocaleString()} checked in
              </span>
              <span style={{ fontSize: '0.625rem', color: '#52525b' }}>
                {checkinPct}% attendance
              </span>
            </div>
            <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${checkinPct}%` }}
                transition={{ duration: 1.4, ease: 'easeOut', delay: 0.35 + index * 0.05 }}
                style={{ height: '100%', background: 'rgba(255,255,255,0.25)', borderRadius: '2px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Badge column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
        <span style={{
          padding: '0.2rem 0.625rem', borderRadius: '999px',
          background: fillPct >= 90 ? 'rgba(248,113,113,0.12)' : 'rgba(52,211,153,0.10)',
          border: `1px solid ${fillPct >= 90 ? 'rgba(248,113,113,0.25)' : 'rgba(52,211,153,0.20)'}`,
          fontSize: '0.6875rem', fontWeight: 700,
          color: fillPct >= 90 ? '#f87171' : '#34d399',
          letterSpacing: '0.04em',
        }}>
          {fillPct >= 90 ? 'FULL' : fillPct >= 70 ? 'BUSY' : 'OPEN'}
        </span>
        <span style={{ fontSize: '0.75rem', color: '#52525b' }}>
          {stat.capacity.toLocaleString()} cap
        </span>
      </div>
    </motion.div>
  );
};

// ── Ring chart (CSS-only) ──────────────────────────────────────────────────────
const RingChart = ({ value, max, label, sublabel }) => {
  const pct    = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const radius = 42;
  const circ   = 2 * Math.PI * radius;
  const dash   = (pct / 100) * circ;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ position: 'relative', width: '110px', height: '110px' }}>
        <svg width="110" height="110" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle cx="55" cy="55" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          {/* Progress */}
          <motion.circle
            cx="55" cy="55" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - dash }}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FAFAFA', lineHeight: 1 }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#D4D4D8' }}>{label}</p>
        <p style={{ fontSize: '0.6875rem', color: '#71717A', marginTop: '0.125rem' }}>{sublabel}</p>
      </div>
    </div>
  );
};

// ── Main AnalyticsDashboard ────────────────────────────────────────────────────
const AnalyticsDashboard = () => {
  const navigate  = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ position: 'relative', padding: '2.5rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: '5%', left: '25%', width: 600, height: 600, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', filter: 'blur(120px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: 350, height: 350, borderRadius: '50%', background: 'rgba(255,255,255,0.015)', filter: 'blur(90px)', pointerEvents: 'none' }} />

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={SPRING}
          style={{
            display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', marginBottom: '2.5rem',
            flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            {/* Back button */}
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={SPRING}
              onClick={() => navigate('/dashboard')}
              style={{
                width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#D4D4D8',
              }}
            >
              <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
            </motion.button>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>
                Analytics
              </h1>
              <p style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.25rem' }}>
                Real-time performance metrics across your events.
              </p>
            </div>
          </div>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.5rem 1.125rem', borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: '#D4D4D8', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <motion.div animate={{ rotate: refreshing ? 360 : 0 }} transition={{ duration: 0.8, ease: 'linear', repeat: refreshing ? Infinity : 0 }}>
              <RefreshCw style={{ width: '0.875rem', height: '0.875rem' }} />
            </motion.div>
            Refresh
          </motion.button>
        </motion.div>

        {/* States */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(255,255,255,0.12)', borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center', paddingTop: '4rem', color: '#f87171',
              fontSize: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            }}
          >
            <BarChart3 style={{ width: '2.5rem', height: '2.5rem', opacity: 0.5 }} />
            <p>{error}</p>
            <button onClick={() => fetchData()} style={{ padding: '0.5rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)', color: '#D4D4D8', cursor: 'pointer' }}>
              Try Again
            </button>
          </motion.div>
        )}

        {!loading && !error && data && (
          <>
            {/* ── Stat cards grid ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '1.25rem', marginBottom: '2.5rem',
                position: 'relative', zIndex: 10,
              }}
            >
              <StatCard icon={Layers}     label="Total Events"        value={data.totalEvents}           accent="rgba(255,255,255,0.5)" />
              <StatCard icon={TrendingUp} label="Total Capacity"       value={data.totalCapacity}         accent="rgba(255,255,255,0.35)" />
              <StatCard icon={Users}      label="Total Registrations"  value={data.totalRegistrations}    accent="rgba(255,255,255,0.45)" />
              <StatCard icon={CheckSquare} label="Total Check-Ins"     value={data.totalCheckIns}         accent="rgba(52,211,153,0.6)" />
              <StatCard icon={Percent}    label="Attendance Rate"      value={data.overallAttendanceRate} suffix="%" decimals={1} accent="rgba(251,191,36,0.6)" />
            </motion.div>

            {/* ── Overview rings + capacity flow ── */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.25rem', marginBottom: '2.5rem',
                position: 'relative', zIndex: 10,
              }}
            >
              {/* Capacity Utilisation ring panel */}
              <motion.div
                variants={itemVariants}
                style={{
                  padding: '2rem', borderRadius: '1.5rem',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                }}
              >
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#71717A', marginBottom: '1.5rem' }}>
                  Capacity Utilisation
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <RingChart
                    value={data.totalRegistrations}
                    max={data.totalCapacity}
                    label="Fill Rate"
                    sublabel={`${data.totalRegistrations.toLocaleString()} registered`}
                  />
                  <RingChart
                    value={data.totalCheckIns}
                    max={data.totalRegistrations}
                    label="Attendance"
                    sublabel={`${data.totalCheckIns.toLocaleString()} checked in`}
                  />
                </div>
              </motion.div>

              {/* Funnel panel */}
              <motion.div
                variants={itemVariants}
                style={{
                  padding: '2rem', borderRadius: '1.5rem',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                }}
              >
                <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#71717A', marginBottom: '1.5rem' }}>
                  Attendee Funnel
                </p>
                {[
                  { label: 'Total Capacity',   value: data.totalCapacity,       max: data.totalCapacity,       color: 'rgba(255,255,255,0.15)' },
                  { label: 'Registered',        value: data.totalRegistrations,  max: data.totalCapacity,       color: 'rgba(255,255,255,0.45)' },
                  { label: 'Checked In',        value: data.totalCheckIns,       max: data.totalCapacity,       color: 'rgba(52,211,153,0.7)' },
                ].map(({ label, value, max, color }, i) => {
                  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
                  return (
                    <div key={label} style={{ marginBottom: i < 2 ? '1.25rem' : 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
                        <span style={{ fontSize: '0.8125rem', color: '#D4D4D8' }}>{label}</span>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#FAFAFA' }}>
                          {value.toLocaleString()}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 + i * 0.15 }}
                          style={{ height: '100%', background: color, borderRadius: '6px' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* ── Event breakdown table ── */}
            {data.eventBreakdown?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: 0.3 }}
                style={{ position: 'relative', zIndex: 10 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#71717A' }}>
                    Event Breakdown  ·  {data.eventBreakdown.length} event{data.eventBreakdown.length !== 1 ? 's' : ''}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: '#3f3f46' }}>sorted by fill rate</p>
                </div>

                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}
                >
                  {data.eventBreakdown.map((stat, i) => (
                    <EventRow key={stat.id} stat={stat} index={i} />
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* Empty state */}
            {(!data.eventBreakdown || data.eventBreakdown.length === 0) && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: 'center', paddingTop: '3rem', color: '#71717A' }}
              >
                <Calendar style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', opacity: 0.4 }} />
                <p>No event data to display yet.</p>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
