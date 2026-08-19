import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import {
  Calendar, MapPin, Users, CheckCircle, AlertCircle,
  Search, Ticket, Clock,
} from 'lucide-react';
import Navbar from '../components/shared/Navbar.jsx';
import TicketPass from '../components/shared/TicketPass.jsx';
import EventAccessModal from '../components/ui/EventAccessModal.jsx';
import { eventsApi, attendeeApi, registrationsApi } from '../services/api.js';

// ── Film Grain ────────────────────────────────────────────────────────────────
const FilmGrain = () => (
  <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 997, opacity: 0.06, mixBlendMode: 'overlay' }}>
    <filter id="ap-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter="url(#ap-grain)" />
  </svg>
);

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.aside
    role="alert"
    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.1, ease: 'linear' }}
    style={{
      position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 999,
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '1rem 1.5rem', background: 'var(--anchor)',
      border: `2px solid ${type === 'success' ? 'var(--pop)' : 'var(--structure)'}`,
      boxShadow: 'var(--shadow)',
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
      color: 'var(--structure)',
    }}
  >
    {type === 'success'
      ? <CheckCircle size={14} color="var(--pop)" />
      : <AlertCircle size={14} color="var(--structure)" />}
    {message}
  </motion.aside>
);

// ── Tab button ────────────────────────────────────────────────────────────────
const TabBtn = ({ id, label, active, onClick }) => (
  <button
    id={id}
    onClick={onClick}
    style={{
      height: '2.5rem', padding: '0 1.5rem',
      background: 'transparent',
      border: 'none', borderBottom: `2px solid ${active ? 'var(--pop)' : 'transparent'}`,
      color: active ? 'var(--structure)' : 'var(--structure)',
      opacity: active ? 1 : 0.4,
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
      cursor: 'pointer', transition: 'border-color 0.08s linear, opacity 0.08s linear',
    }}
  >
    {label}
  </button>
);

// ── Cancel Confirm Modal ───────────────────────────────────────────────────────
const CancelConfirmModal = ({ eventTitle, onConfirm, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: 0.1, ease: 'linear' }}
    style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', padding: '1rem' }}
    onClick={onDismiss}
  >
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      onClick={e => e.stopPropagation()}
      style={{ width: '100%', maxWidth: '420px', background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: '10px 10px 0px var(--ink)' }}
    >
      <div style={{ padding: '1.5rem 2rem 1.25rem', borderBottom: '1px solid var(--dim-border)' }}>
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5, marginBottom: '0.5rem' }}>
          EVENTSPHERE // REGISTRATION
        </p>
        <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '2rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1 }}>
          CANCEL REGISTRATION?
        </h2>
      </div>
      <div style={{ padding: '1.5rem 2rem' }}>
        <div style={{ border: '1px solid var(--structure)', padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)' }}>
            !! WARNING — THIS ACTION IS PERMANENT
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.6, lineHeight: 1.8, letterSpacing: '0.04em' }}>
            Cancelling your spot for <strong style={{ opacity: 1 }}>{eventTitle}</strong> will free
            the seat and <strong style={{ opacity: 1 }}>permanently block you from re-registering</strong> for this event.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button id="cancel-confirm-btn" className="grit-btn" onClick={onConfirm}
            style={{ flex: 1, height: '2.875rem', background: 'var(--anchor)', border: '2px solid var(--structure)', color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            YES, CANCEL MY SPOT
          </button>
          <button id="cancel-dismiss-btn" className="grit-btn" onClick={onDismiss}
            style={{ flex: 1, height: '2.875rem', background: 'var(--pop)', border: '2px solid var(--pop)', color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', boxShadow: 'var(--shadow)' }}>
            KEEP MY SPOT
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ── Capacity bar ───────────────────────────────────────────────────────────────
const CapacityBar = ({ registered, capacity }) => {
  const pct   = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const atCap = pct >= 90;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5 }}>
          {registered}&thinsp;/&thinsp;{capacity} SEATS
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, color: atCap ? 'var(--pop)' : 'var(--structure)' }}>
          {pct}%
        </span>
      </div>
      <div style={{ width: '100%', height: '2px', background: 'var(--dim-border)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: atCap ? 'var(--pop)' : 'var(--structure)', transition: 'width 0.15s linear' }} />
      </div>
    </div>
  );
};

// ── Event card ────────────────────────────────────────────────────────────────
const EventCard = ({ event, isRegistered, registering, onOpenModal }) => {
  const isSoldOut = (event.availableSeats ?? (event.capacity - (event.registeredCount ?? 0))) <= 0;
  const fmtDate   = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';
  const fmtShort  = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <article
      className="grit-event-card"
      style={{
        background: 'var(--anchor)',
        border: `2px solid ${isRegistered ? 'var(--pop)' : 'var(--structure)'}`,
        boxShadow: isRegistered ? 'var(--shadow)' : 'var(--shadow)',
        padding: '1.75rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        position: 'relative', height: '100%',
      }}
    >
      {isRegistered && (
        <div style={{ position: 'absolute', top: '1.75rem', right: '1.75rem', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--pop)', border: '1px solid var(--pop)', padding: '0.25rem 0.5rem' }}>
          REGISTERED
        </div>
      )}

      <h3 style={{ fontFamily: "'VT323', monospace", textTransform: 'uppercase', fontSize: '1.625rem', color: 'var(--structure)', lineHeight: 1.0, paddingRight: isRegistered ? '6.5rem' : 0 }}>
        {event.title}
      </h3>

      {event.description && (
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.55, lineHeight: 1.8, letterSpacing: '0.04em', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {[
          { Icon: Calendar, text: fmtDate(event.date) },
          { Icon: MapPin,   text: event.location },
          { Icon: Users,    text: `HOSTED BY ${(event.organizerName || '').toUpperCase()}` },
        ].map(({ Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Icon size={11} color="var(--pop)" style={{ flexShrink: 0 }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.06em', color: 'var(--structure)', opacity: 0.7 }}>
              {text}
            </span>
          </div>
        ))}
      </div>

      <CapacityBar registered={event.registeredCount ?? 0} capacity={event.capacity} />

      {event.registrationEnd && !isRegistered && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Clock size={10} color="var(--structure)" style={{ opacity: 0.4 }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', letterSpacing: '0.06em', color: 'var(--structure)', opacity: 0.4 }}>
            CLOSES {fmtShort(event.registrationEnd)}
          </span>
        </div>
      )}

      <button
        id={`register-event-${event.id}`}
        className="grit-btn"
        onClick={() => !isRegistered && !isSoldOut && onOpenModal(event)}
        disabled={isRegistered || isSoldOut || registering}
        style={{
          width: '100%', height: '2.75rem',
          background: isRegistered ? 'var(--dim-bg)' : isSoldOut ? 'transparent' : 'var(--pop)',
          border: `2px solid ${isRegistered ? 'var(--pop)' : isSoldOut ? 'var(--dim-border)' : 'var(--pop)'}`,
          color: isRegistered ? 'var(--pop)' : isSoldOut ? 'var(--structure-40)' : 'var(--anchor)',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
          boxShadow: isRegistered || isSoldOut ? 'none' : 'var(--shadow-sm)',
          cursor: isRegistered || isSoldOut ? 'default' : registering ? 'wait' : 'pointer',
          opacity: registering ? 0.6 : 1,
          marginTop: 'auto',
        }}
      >
        {registering ? 'REGISTERING...' : isRegistered ? '✓ REGISTERED' : isSoldOut ? 'SOLD OUT' : 'ENTER CODE TO REGISTER'}
      </button>
    </article>
  );
};

// ── Format helpers ────────────────────────────────────────────────────────────
const fmtDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '—';

const TAB_VARIANTS = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.1, ease: 'linear' } },
  exit:    { opacity: 0, transition: { duration: 0.08, ease: 'linear' } },
};

// ── Main AttendeePortal ───────────────────────────────────────────────────────
const AttendeePortal = ({ initialTab = 'discover' }) => {
  const { username }  = useParams();
  const [tab, setTab] = useState(initialTab);
  const [events, setEvents]     = useState([]);
  const [tickets, setTickets]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [registering, setRegistering] = useState(null);
  const [toast, setToast]       = useState(null);
  const [modalEvent, setModalEvent]   = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [evRes, tkRes] = await Promise.all([eventsApi.available(), attendeeApi.myTickets()]);
      setEvents(evRes.data); setTickets(tkRes.data);
    } catch { showToast('FAILED TO LOAD DATA.', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSubmitCode = async (code) => {
    if (!modalEvent) return;
    setRegistering(modalEvent.id);
    try {
      await registrationsApi.register(modalEvent.id, code);
      showToast('REGISTERED! YOUR TICKET IS READY.');
      await fetchAll();
      setTab('tickets');
    } finally { setRegistering(null); }
  };

  const [confirmCancel, setConfirmCancel] = useState(null); // { registrationId, eventTitle }

  const handleCancel = (registrationId, eventTitle) => {
    setConfirmCancel({ registrationId, eventTitle });
  };

  const executeCancel = async () => {
    const { registrationId } = confirmCancel;
    setConfirmCancel(null);
    try {
      await registrationsApi.cancel(registrationId);
      showToast('REGISTRATION CANCELLED. YOUR SPOT HAS BEEN FREED.');
      await fetchAll();
    } catch (err) {
      showToast((err?.response?.data?.message || 'CANCELLATION FAILED.').toUpperCase(), 'error');
    }
  };

  const registeredEventIds = new Set(tickets.map(t => t.eventId));
  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    (e.location?.toLowerCase() ?? '').includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--anchor)', color: 'var(--structure)', position: 'relative' }}>
      <FilmGrain />
      <Navbar />

      {/* Cancel confirmation modal */}
      <AnimatePresence>
        {confirmCancel && (
          <CancelConfirmModal
            key="cancel-modal"
            eventTitle={confirmCancel.eventTitle}
            onConfirm={executeCancel}
            onDismiss={() => setConfirmCancel(null)}
          />
        )}
      </AnimatePresence>

      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2.5rem 3rem 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '0.5rem' }}>
            EVENTSPHERE&thinsp;//&thinsp;ATTENDEE PORTAL
          </p>
          <h1 style={{ fontFamily: "'VT323', monospace", textTransform: 'uppercase', fontSize: 'clamp(3rem, 5vw, 5rem)', color: 'var(--structure)', lineHeight: 1.0 }}>
            EVENT PORTAL
          </h1>
        </div>

        {/* Search */}
        {tab === 'discover' && (
          <div style={{ position: 'relative' }}>
            <Search size={12} color="var(--structure)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.35, pointerEvents: 'none' }} />
            <input
              className="grit-input"
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="SEARCH EVENTS..."
              style={{
                height: '2.5rem', paddingLeft: '2.5rem', paddingRight: '1rem',
                width: '220px', fontSize: '0.6875rem',
              }}
            />
          </div>
        )}
      </div>

      {/* ── TABS ─────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 3rem' }}>
        <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid var(--structure)', marginTop: '1.5rem' }}>
          <TabBtn id="tab-discover" label="DISCOVER"                             active={tab === 'discover'} onClick={() => setTab('discover')} />
          <TabBtn id="tab-tickets"  label={`MY TICKETS (${tickets.length})`}     active={tab === 'tickets'}  onClick={() => setTab('tickets')} />
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '2.5rem 3rem' }}>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '5rem 0' }}>
            <span className="spin-grit" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid var(--dim-border)', borderTopColor: 'var(--structure)', borderRadius: '50%' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.4 }}>
              LOADING...
            </span>
          </div>
        )}

        {!loading && (
          <AnimatePresence mode="wait">

            {/* ── DISCOVER ──────────────────────────────────────────────── */}
            {tab === 'discover' && (
              <motion.div key="discover" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
                {filteredEvents.length === 0 ? (
                  <div style={{ paddingTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '4rem', height: '4rem', border: '2px solid var(--dim-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={20} color="var(--structure)" style={{ opacity: 0.35 }} />
                    </div>
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.35 }}>
                      {search ? `NO EVENTS FOUND FOR "${search.toUpperCase()}"` : 'NO UPCOMING EVENTS'}
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {filteredEvents.map(event => (
                      <EventCard
                        key={event.id} event={event}
                        isRegistered={registeredEventIds.has(event.id)}
                        registering={registering === event.id}
                        onOpenModal={ev => setModalEvent(ev)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── MY TICKETS ────────────────────────────────────────────── */}
            {tab === 'tickets' && (
              <motion.div key="tickets" variants={TAB_VARIANTS} initial="initial" animate="animate" exit="exit">
                {tickets.length === 0 ? (
                  <div style={{ paddingTop: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ width: '4rem', height: '4rem', border: '2px solid var(--dim-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ticket size={20} color="var(--structure)" style={{ opacity: 0.35 }} />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.35, marginBottom: '0.75rem' }}>
                        NO TICKETS YET
                      </p>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.25, letterSpacing: '0.04em' }}>
                        REGISTER FOR AN EVENT TO RECEIVE YOUR WALLET PASS.
                      </p>
                    </div>
                    <button
                      className="grit-btn"
                      onClick={() => setTab('discover')}
                      style={{
                        height: '2.75rem', padding: '0 2rem',
                        background: 'var(--pop)', border: '2px solid var(--pop)',
                        color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        boxShadow: 'var(--shadow)', cursor: 'pointer',
                      }}
                    >
                      BROWSE EVENTS
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.4, marginBottom: '2rem' }}>
                      {tickets.length} TICKET{tickets.length !== 1 ? 'S' : ''} ISSUED
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'flex-start' }}>
                      {tickets.map((ticket) => (
                        <div key={ticket.registrationId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                          {ticket.isDeleted ? (
                            <div style={{ padding: '1.5rem', background: 'var(--anchor)', border: '2px solid var(--structure)', boxShadow: 'var(--shadow)', color: 'var(--structure)', width: '280px', textAlign: 'center' }}>
                              <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', marginBottom: '0.5rem', lineHeight: 1 }}>
                                {ticket.eventTitle}
                              </p>
                              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.06em', color: 'var(--structure)', opacity: 0.65 }}>
                                !! THIS EVENT WAS DELETED BY THE ORGANIZER.
                              </p>
                            </div>
                          ) : (
                            <>
                              <TicketPass
                                eventName={ticket.eventTitle}
                                date={fmtDate(ticket.eventDate)}
                                time={fmtTime(ticket.eventDate)}
                                location={ticket.eventLocation}
                                attendeeName="YOUR TICKET"
                                qrBase64={ticket.qrBase64}
                                qrToken={ticket.qrToken}
                                status={ticket.status}
                              />
                              {ticket.status === 'REGISTERED' && (
                                <button
                                  className="grit-btn"
                                  onClick={() => handleCancel(ticket.registrationId, ticket.eventTitle)}
                                  style={{
                                    padding: '0.5rem 1.5rem',
                                    background: 'transparent', border: '1px solid var(--dim-border)',
                                    color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace",
                                    fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                                    cursor: 'pointer', opacity: 0.6,
                                  }}
                                >
                                  CANCEL REGISTRATION
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* Toasts & Modals */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <EventAccessModal
        isOpen={!!modalEvent}
        onClose={() => setModalEvent(null)}
        event={modalEvent}
        onSubmitCode={handleSubmitCode}
      />
    </div>
  );
};

export default AttendeePortal;
