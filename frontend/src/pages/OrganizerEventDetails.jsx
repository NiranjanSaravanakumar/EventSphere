import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ScanLine, Users, CheckCircle, Clock, Calendar, MapPin, Key,
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import ScannerPanel from '../components/shared/ScannerPanel.jsx';
import { eventsApi, registrationsApi } from '../services/api.js';
import { useTheme } from '../components/shared/Navbar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

// -- Film Grain
const FilmGrain = () => (
  <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 997, opacity: 0.06, mixBlendMode: 'overlay' }}>
    <filter id="oed-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#oed-grain)" />
  </svg>
);

// -- Stat Block
// 60/30/10 RULE:
//   accent=true  => background --anchor, border --pop, label/value in --pop  (pop = border + text only)
//   accent=false => background --anchor, border --structure, label/value in --structure
const StatBlock = ({ label, value, accent = false }) => (
  <div style={{
    background: 'var(--anchor)',
    border: accent ? '2px solid var(--pop)' : '2px solid var(--structure)',
    boxShadow: 'var(--shadow)',
    padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '0.5rem',
  }}>
    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent ? 'var(--pop)' : 'var(--structure)', opacity: accent ? 0.85 : 0.5 }}>{label}</p>
    <p style={{ fontFamily: "'VT323', monospace", fontSize: '2.75rem', lineHeight: 1, textTransform: 'uppercase', color: accent ? 'var(--pop)' : 'var(--structure)' }}>{value}</p>
  </div>
);

// -- Main Component
const OrganizerEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user } = useAuth();

  const [event, setEvent]     = useState(null);
  const [guests, setGuests]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [eventRes, guestsRes] = await Promise.all([
        eventsApi.getById(id),
        registrationsApi.guestList(id),
      ]);
      setEvent(eventRes.data);
      setGuests(guestsRes.data);
    } catch (err) {
      console.error('Failed to fetch event details', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleScannerClose = () => { setScannerOpen(false); fetchData(); };

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'n/a';

  // -- Loading
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--anchor)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FilmGrain />
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="spin-grit" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid var(--dim-border)', borderTopColor: 'var(--structure)', borderRadius: '50%' }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.45 }}>
            LOADING EVENT...
          </span>
        </div>
      </div>
    );
  }

  // -- Not found
  if (!event) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--anchor)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <FilmGrain />
        <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '3rem', textTransform: 'uppercase', color: 'var(--structure)' }}>
          EVENT NOT FOUND
        </h2>
        <button className="grit-btn" onClick={() => navigate(-1)} style={{
          padding: '0.875rem 2rem', background: 'transparent', border: '2px solid var(--structure)',
          color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem',
          fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', boxShadow: 'var(--shadow)', cursor: 'pointer',
        }}>
          GO BACK
        </button>
      </div>
    );
  }

  const checkedInCount  = guests.filter(g => g.status === 'CHECKED_IN').length;
  const registeredCount = guests.filter(g => g.status === 'REGISTERED').length;
  const cancelledCount  = guests.filter(g => g.status === 'CANCELLED').length;
  const totalActive     = checkedInCount + registeredCount;
  const availableSpots  = Math.max(0, event.capacity - totalActive);
  const fillPct         = event.capacity > 0 ? Math.round((totalActive / event.capacity) * 100) : 0;

  // ECharts amber terminal palette
  const chartTextStyle = { color: '#FDF6E3', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10 };

  const registrationPieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#000', borderColor: 'rgba(253,246,227,0.18)', textStyle: chartTextStyle },
    legend: { top: 'bottom', textStyle: chartTextStyle },
    series: [{
      name: 'Seats', type: 'pie', radius: ['40%', '68%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 0, borderColor: '#120E0B', borderWidth: 2 },
      label: { show: true, position: 'inside', formatter: '{c}', color: '#120E0B', fontWeight: 'bold', fontFamily: "'IBM Plex Mono', monospace" },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#120E0B' } },
      labelLine: { show: false },
      data: [
        { value: totalActive,    name: 'Registered',  itemStyle: { color: '#FDF6E3' } },
        { value: availableSpots, name: 'Available',   itemStyle: { color: 'rgba(253,246,227,0.2)' } },
        { value: cancelledCount, name: 'Cancelled',   itemStyle: { color: '#FFB300' } },
      ].filter(d => d.value > 0),
    }],
  };

  const attendancePieOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', backgroundColor: '#000', borderColor: 'rgba(253,246,227,0.18)', textStyle: chartTextStyle },
    legend: { top: 'bottom', textStyle: chartTextStyle },
    series: [{
      name: 'Attendance', type: 'pie', radius: ['40%', '68%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 0, borderColor: '#120E0B', borderWidth: 2 },
      label: { show: true, position: 'inside', formatter: '{c}', color: '#120E0B', fontWeight: 'bold', fontFamily: "'IBM Plex Mono', monospace" },
      emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#120E0B' } },
      labelLine: { show: false },
      data: [
        { value: checkedInCount,  name: 'Checked In',      itemStyle: { color: '#FFB300' } },
        { value: registeredCount, name: 'Not Yet Arrived', itemStyle: { color: '#FDF6E3' } },
      ].filter(d => d.value > 0),
    }],
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--anchor)', color: 'var(--structure)', position: 'relative' }}>
      <FilmGrain />

      {/* HEADER */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 3rem', height: '64px',
        background: 'var(--anchor)', borderBottom: '2px solid var(--structure)',
      }}>
        <button
          id="back-to-studio-btn"
          className="grit-btn"
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.625rem',
            padding: '0 1.25rem', height: '2.5rem',
            background: 'transparent', border: '1px solid var(--dim-border)',
            color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
          }}
        >
          <ArrowLeft size={12} /> BACK TO STUDIO
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
          {/* OPEN SCANNER => primary CTA, correct use of --pop */}
          <button
            id="open-scanner-btn"
            className="grit-btn"
            onClick={() => setScannerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.625rem',
              padding: '0 1.5rem', height: '2.5rem',
              background: 'var(--pop)', border: '2px solid var(--pop)',
              color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
              boxShadow: 'var(--shadow)', cursor: 'pointer',
            }}
          >
            <ScanLine size={12} /> OPEN SCANNER
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '3rem', display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>

        {/* Top Bento-Box Metrics Grid -- 60/30/10 compliant StatBlocks */}
        <section style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <StatBlock label="Total Registered"  value={totalActive} />
          <StatBlock label="Checked In"        value={checkedInCount} accent />
          <StatBlock label="Pending Arrival"   value={registeredCount} />
          <StatBlock label="Platform Capacity" value={event.capacity.toLocaleString()} />
          <StatBlock label="Fill Rate"         value={fillPct + '%'} accent={fillPct >= 90} />
          <StatBlock label="Available Seats"   value={availableSpots.toLocaleString()} />
        </section>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Event info card */}
          <section style={{ background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', padding: '2.5rem' }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '1rem' }}>
              EVENTSPHERE // EVENT DETAILS
            </p>
            <h1 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2.5rem, 4vw, 4rem)', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1.0, marginBottom: '1.5rem' }}>
              {event.title}
            </h1>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem', color: 'var(--structure)', opacity: 0.6, lineHeight: 1.8, marginBottom: '2rem' }}>
              {event.description || 'NO DESCRIPTION PROVIDED.'}
            </p>

            {/* Meta grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--dim-border)', paddingTop: '2rem' }}>
              {[
                { Icon: Calendar,    text: fmtDate(event.date) },
                { Icon: MapPin,      text: event.location },
                { Icon: Users,       text: 'CAPACITY: ' + event.capacity },
                { Icon: CheckCircle, text: checkedInCount + ' INSIDE' },
              ].map(({ Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={13} color="var(--pop)" />
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.625rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.7 }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Guest list */}
          <section style={{ border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', padding: '0.875rem 1.5rem', borderBottom: '2px solid var(--structure)', background: 'var(--dim-bg)' }}>
              {['GUEST NAME', 'EMAIL', 'STATUS'].map(h => (
                <span key={h} style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5 }}>{h}</span>
              ))}
            </div>

            {guests.length === 0 && (
              <div style={{ padding: '3rem', textAlign: 'center', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.3 }}>
                NO GUESTS REGISTERED YET
              </div>
            )}
            {guests.map((g, i) => {
              const isChecked   = g.status === 'CHECKED_IN';
              const isCancelled = g.status === 'CANCELLED';
              const statusColor = isChecked ? 'var(--pop)' : isCancelled ? 'var(--structure-25)' : 'var(--structure)';
              return (
                <div key={i} className="grit-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', alignItems: 'center', gap: '1rem', padding: '1rem 1.5rem', borderBottom: '1px solid var(--dim-border)' }}>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.6875rem', fontWeight: 700, color: 'var(--structure)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.attendeeName}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {g.attendeeEmail}
                  </span>
                  <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: statusColor, border: '1px solid ' + statusColor, padding: '0.25rem 0.625rem', whiteSpace: 'nowrap' }}>
                    {g.status}
                  </span>
                </div>
              );
            })}
          </section>
        </div>

        {/* RIGHT COLUMN -- Charts */}
        <aside style={{ position: 'sticky', top: '4.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Registration donut */}
          <div style={{ background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', padding: '1.75rem' }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '0.5rem' }}>
              SEAT DISTRIBUTION
            </p>
            <h3 style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1, marginBottom: '1.25rem' }}>
              REGISTRATION STATUS
            </h3>
            <div style={{ height: '220px' }}>
              <ReactECharts option={registrationPieOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* Attendance donut */}
          <div style={{ background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', padding: '1.75rem' }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '0.5rem' }}>
              DOOR STATUS
            </p>
            <h3 style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1, marginBottom: '1.25rem' }}>
              ATTENDANCE BREAKDOWN
            </h3>
            <div style={{ height: '220px' }}>
              <ReactECharts option={attendancePieOption} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>

          {/* People inside hero number tile */}
          {/* 60/30/10 FIX: was background: var(--pop) -- VIOLATION */}
          {/* Now: --anchor bg (60%), --pop border only, --pop value text (10%) */}
          <div style={{ background: 'var(--anchor)', border: '2px solid var(--pop)', boxShadow: 'var(--shadow)', padding: '1.75rem', textAlign: 'center' }}>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.55, marginBottom: '0.75rem' }}>
              PEOPLE INSIDE NOW
            </p>
            <p style={{ fontFamily: "'VT323', monospace", fontSize: '5rem', lineHeight: 1, textTransform: 'uppercase', color: 'var(--pop)' }}>
              {checkedInCount}
            </p>
          </div>
        </aside>
      </main>

      {/* Scanner */}
      <AnimatePresence>
        {scannerOpen && <ScannerPanel onClose={handleScannerClose} />}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerEventDetails;
