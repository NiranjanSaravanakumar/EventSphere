import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, CheckCircle, AlertCircle, Search, Ticket } from 'lucide-react';
import Navbar from '../components/shared/Navbar.jsx';
import TicketPass from '../components/shared/TicketPass.jsx';
import { eventsApi, registrationsApi } from '../services/api.js';

// ── Animation variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(8px)' },
  show:   { opacity: 1, y: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 280, damping: 22 } },
};

const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

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
      padding: '0.75rem 1.25rem', borderRadius: '0.875rem',
      background: type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
      backdropFilter: 'blur(20px)', color: type === 'success' ? '#6ee7b7' : '#f87171',
      fontSize: '0.875rem', fontWeight: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}
  >
    {type === 'success'
      ? <CheckCircle style={{ width: '1rem', height: '1rem' }} />
      : <AlertCircle style={{ width: '1rem', height: '1rem' }} />}
    {message}
  </motion.div>
);

// ── Tab switch ─────────────────────────────────────────────────────────────────
const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '0.5rem 1.25rem', borderRadius: '0.625rem',
      fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer', border: 'none',
      background: active ? 'rgba(255,255,255,0.10)' : 'transparent',
      color: active ? '#FAFAFA' : '#71717A', transition: 'all 0.2s',
    }}
  >
    {label}
  </button>
);

// ── Capacity bar ───────────────────────────────────────────────────────────────
const CapacityBar = ({ registered, capacity }) => {
  const pct = Math.min(100, Math.round((registered / capacity) * 100));
  const color = pct >= 90 ? '#f87171' : '#FAFAFA';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
        <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>{registered}/{capacity} spots</span>
        <span style={{ fontSize: '0.6875rem', color }}>{pct}%</span>
      </div>
      <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
          style={{ height: '100%', background: color, borderRadius: '2px' }}
        />
      </div>
    </div>
  );
};

// ── Event card (Discover tab) ──────────────────────────────────────────────────
const EventCard = ({ event, isRegistered, registering, onRegister }) => {
  const full = (event.registeredCount ?? 0) >= event.capacity;
  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -5, scale: 1.01 }}
      transition={SPRING}
      style={{
        padding: '1.5rem', borderRadius: '1.25rem',
        background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: isRegistered ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column', gap: '1rem',
        position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 0, height: '1px',
        background: isRegistered
          ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.4), transparent)'
          : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)',
      }} />

      {isRegistered && (
        <div style={{
          position: 'absolute', top: '1rem', right: '1rem',
          display: 'flex', alignItems: 'center', gap: '0.25rem',
          padding: '0.25rem 0.625rem', borderRadius: '999px',
          background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)',
          fontSize: '0.6875rem', fontWeight: 600, color: '#6ee7b7',
        }}>
          <CheckCircle style={{ width: '0.625rem', height: '0.625rem' }} /> Registered
        </div>
      )}

      <div style={{ paddingRight: isRegistered ? '5.5rem' : 0 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.015em', lineHeight: 1.3 }}>
          {event.title}
        </h3>
        {event.description && (
          <p style={{ fontSize: '0.8125rem', color: '#71717A', marginTop: '0.375rem', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {event.description}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {[
          { Icon: Calendar, text: fmtDate(event.date) },
          { Icon: MapPin,   text: event.location },
          { Icon: Users,    text: `Hosted by ${event.organizerName}` },
        ].map(({ Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Icon style={{ width: '0.8125rem', height: '0.8125rem', color: '#71717A', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: '#D4D4D8' }}>{text}</span>
          </div>
        ))}
      </div>

      <CapacityBar registered={event.registeredCount ?? 0} capacity={event.capacity} />

      <motion.button
        whileHover={!isRegistered && !full ? { scale: 1.02 } : undefined}
        whileTap={!isRegistered && !full ? { scale: 0.97 } : undefined}
        transition={SPRING}
        onClick={() => !isRegistered && !full && onRegister(event.id)}
        disabled={isRegistered || full || registering}
        style={{
          width: '100%', height: '2.5rem', borderRadius: '0.75rem', border: 'none',
          background: isRegistered ? 'rgba(16,185,129,0.10)' : full ? 'rgba(255,255,255,0.04)' : '#FAFAFA',
          color: isRegistered ? '#6ee7b7' : full ? '#71717A' : '#050505',
          fontSize: '0.875rem', fontWeight: 600,
          cursor: isRegistered || full ? 'default' : 'pointer',
          opacity: registering ? 0.7 : 1, transition: 'all 0.2s',
        }}
      >
        {registering ? 'Registering…' : isRegistered ? '✓ Registered' : full ? 'Fully Booked' : 'Register'}
      </motion.button>
    </motion.div>
  );
};

// ── Format helpers ─────────────────────────────────────────────────────────────
const fmtDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  : '—';
const fmtTime = (iso) => iso
  ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  : '—';

// ── Main AttendeePortal ────────────────────────────────────────────────────────
const AttendeePortal = () => {
  const [tab, setTab]             = useState('discover');
  const [events, setEvents]       = useState([]);
  const [tickets, setTickets]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [registering, setRegistering] = useState(null);
  const [toast, setToast]         = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, tkRes] = await Promise.all([
        eventsApi.getAll(),
        registrationsApi.myTickets(),
      ]);
      setEvents(evRes.data);
      setTickets(tkRes.data);
    } catch {
      showToast('Failed to load data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRegister = async (eventId) => {
    setRegistering(eventId);
    try {
      await registrationsApi.register(eventId);
      showToast('Successfully registered! Your ticket is ready.');
      await fetchAll();
      setTab('tickets'); // auto-switch to show the new ticket
    } catch (err) {
      showToast(err?.response?.data?.message || 'Registration failed.', 'error');
    } finally {
      setRegistering(null);
    }
  };

  const registeredEventIds = new Set(tickets.map(t => t.eventId));
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ position: 'relative', padding: '2.5rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: '-5%', left: '10%', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', filter: 'blur(90px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.015)', filter: 'blur(80px)', pointerEvents: 'none' }} />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ marginBottom: '2rem', position: 'relative', zIndex: 10 }}
        >
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>
            Event Portal
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.375rem' }}>
            Discover events and access your tickets.
          </p>
        </motion.div>

        {/* Tabs + Search */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 10,
        }}>
          <div style={{
            display: 'flex', gap: '0.25rem', padding: '0.25rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem',
          }}>
            <Tab label="Discover"                      active={tab === 'discover'} onClick={() => setTab('discover')} />
            <Tab label={`My Tickets (${tickets.length})`} active={tab === 'tickets'}  onClick={() => setTab('tickets')}  />
          </div>

          {tab === 'discover' && (
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', width: '0.875rem', height: '0.875rem', color: '#71717A', pointerEvents: 'none' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search events…"
                style={{
                  height: '2.5rem', paddingLeft: '2.5rem', paddingRight: '1rem',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '0.75rem', color: '#FAFAFA', fontSize: '0.875rem', outline: 'none', width: '220px',
                }}
              />
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '5rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(255,255,255,0.12)', borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'discover' ? (
              /* ── Discover grid ── */
              <motion.div
                key="discover"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '1.25rem', position: 'relative', zIndex: 10,
                }}
              >
                {filteredEvents.length === 0 ? (
                  <motion.div
                    variants={cardVariants}
                    style={{ gridColumn: '1/-1', textAlign: 'center', paddingTop: '4rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                  >
                    <div style={{ width: '4rem', height: '4rem', borderRadius: '1.25rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar style={{ width: '1.5rem', height: '1.5rem', color: '#71717A' }} />
                    </div>
                    <p style={{ color: '#71717A' }}>
                      {search ? `No events found for "${search}"` : 'No upcoming events.'}
                    </p>
                  </motion.div>
                ) : filteredEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={registeredEventIds.has(event.id)}
                    registering={registering === event.id}
                    onRegister={handleRegister}
                  />
                ))}
              </motion.div>
            ) : (
              /* ── My Tickets — TicketPass gallery ── */
              <motion.div
                key="tickets"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                style={{ position: 'relative', zIndex: 10 }}
              >
                {tickets.length === 0 ? (
                  <div style={{ paddingTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ width: '5rem', height: '5rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ticket style={{ width: '2rem', height: '2rem', color: '#71717A' }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontWeight: 600, color: '#FAFAFA' }}>No tickets yet</p>
                      <p style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.25rem' }}>
                        Register for an event to receive your Wallet Pass.
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                      onClick={() => setTab('discover')}
                      style={{
                        padding: '0.625rem 1.5rem', borderRadius: '0.875rem',
                        background: '#FAFAFA', color: '#050505',
                        border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      Browse Events
                    </motion.button>
                  </div>
                ) : (
                  <>
                    {/* Section label */}
                    <p style={{ fontSize: '0.75rem', fontWeight: 500, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.5rem' }}>
                      {tickets.length} Ticket{tickets.length !== 1 ? 's' : ''}
                    </p>

                    {/* Ticket pass gallery — horizontal wrap */}
                    <div style={{
                      display: 'flex', flexWrap: 'wrap', gap: '2rem',
                      justifyContent: 'flex-start',
                      perspective: '1200px',
                    }}>
                      {tickets.map((ticket, i) => (
                        <motion.div
                          key={ticket.registrationId}
                          initial={{ opacity: 0, y: 32 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ type: 'spring', stiffness: 280, damping: 24, delay: i * 0.08 }}
                        >
                          <TicketPass
                            eventName={ticket.eventTitle}
                            date={fmtDate(ticket.eventDate)}
                            time={fmtTime(ticket.eventDate)}
                            location={ticket.eventLocation}
                            attendeeName="Your Ticket"
                            qrBase64={ticket.qrBase64}
                            qrToken={ticket.qrToken}
                            status={ticket.status}
                          />
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
};

export default AttendeePortal;
