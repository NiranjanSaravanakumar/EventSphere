import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, MapPin, Key, Copy, Check, LogOut,
  Trash2, Edit3, X, CheckCircle, AlertCircle, ScanLine,
} from 'lucide-react';
import { eventsApi, organizerApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../components/shared/Navbar.jsx';

// ── Film Grain ────────────────────────────────────────────────────────────────
const FilmGrain = () => (
  <svg aria-hidden="true" style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 997, opacity: 0.06, mixBlendMode: 'overlay' }}>
    <filter id="grit-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="100%" height="100%" filter="url(#grit-grain)" />
  </svg>
);

// ── Form Field Components ─────────────────────────────────────────────────────
const FieldInput = ({ label, type = 'text', value, onChange, placeholder, required, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, color: 'var(--structure)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
      {label}{required && <span style={{ color: 'var(--pop)', marginLeft: '0.375rem' }}>*</span>}
    </label>
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      className="grit-input"
      style={{ width: '100%', height: '3rem', padding: '0 1rem', fontSize: '0.8125rem' }}
      {...rest}
    />
  </div>
);

const FieldTextarea = ({ label, value, onChange, placeholder, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, color: 'var(--structure)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
      {label}{required && <span style={{ color: 'var(--pop)', marginLeft: '0.375rem' }}>*</span>}
    </label>
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3}
      className="grit-input"
      style={{ width: '100%', padding: '0.875rem 1rem', fontSize: '0.8125rem', resize: 'vertical' }}
    />
  </div>
);

// ── Capacity Bar ──────────────────────────────────────────────────────────────
const CapacityBar = ({ registered, capacity }) => {
  const pct = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const atCap = pct >= 90;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.6 }}>
          {registered.toLocaleString()}&thinsp;/&thinsp;{capacity.toLocaleString()} SEATS
        </span>
        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, color: 'var(--pop)' }}>
          {pct}%
        </span>
      </div>
      <div style={{ width: '100%', height: '3px', background: 'var(--dim-border)' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--pop)', transition: 'width 0.15s linear' }} />
      </div>
    </div>
  );
};

// ── Stat Tile ─────────────────────────────────────────────────────────────────
const StatTile = ({ label, value, accent = false }) => (
  <div style={{
    background: 'var(--anchor)',
    border: `2px solid ${accent ? 'var(--pop)' : 'var(--structure)'}`,
    boxShadow: 'var(--shadow)',
    padding: '1.75rem',
    display: 'flex', flexDirection: 'column', gap: '0.625rem',
  }}>
    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: accent ? 'var(--pop)' : 'var(--structure)', opacity: accent ? 0.85 : 0.55 }}>
      {label}
    </p>
    <p style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', lineHeight: 1, textTransform: 'uppercase', color: accent ? 'var(--pop)' : 'var(--structure)' }}>
      {value}
    </p>
  </div>
);

// ── Event Card ────────────────────────────────────────────────────────────────
const TactileCard = ({ event, isLarge, onEdit, onDelete, deletingId, fmtDate, onCardClick }) => {
  const [copied, setCopied] = useState(false);
  const pct = event.capacity > 0 ? Math.round((event.registeredCount ?? 0) / event.capacity * 100) : 0;
  const atCapacity = pct >= 90;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (!event.eventCode) return;
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(event.eventCode).then(done).catch(console.error);
    } else {
      const ta = Object.assign(document.createElement('textarea'), { value: event.eventCode, style: 'position:fixed;left:-9999px' });
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch { }
      document.body.removeChild(ta);
    }
  };

  return (
    <article
      className="grit-card"
      onClick={() => onCardClick(event.id)}
      style={{
        background: 'var(--anchor)',
        border: `2px solid ${atCapacity ? 'var(--pop)' : 'var(--structure)'}`,
        boxShadow: 'var(--shadow)',
        padding: isLarge ? '2.5rem' : '1.75rem',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        position: 'relative',
        minHeight: isLarge ? '340px' : '220px',
        height: '100%',
      }}
    >
      {/* Capacity status tag */}
      {atCapacity && (
        <div style={{
          position: 'absolute',
          top: isLarge ? '2.5rem' : '1.75rem',
          right: isLarge ? '2.5rem' : '1.75rem',
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
          color: 'var(--pop)', border: '1px solid var(--pop)', padding: '0.25rem 0.625rem',
        }}>
          AT CAPACITY
        </div>
      )}

      {/* Title */}
      <h3 style={{
        fontFamily: "'VT323', monospace", textTransform: 'uppercase',
        fontSize: isLarge ? 'clamp(2rem, 3vw, 2.75rem)' : '1.625rem',
        color: 'var(--structure)',
        lineHeight: 1.0,
        paddingRight: atCapacity ? '7rem' : 0,
        marginTop: 'auto',
      }}>
        {event.title}
      </h3>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <time style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.6 }}>
          {fmtDate(event.date)}
        </time>
        <address style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.6, fontStyle: 'normal' }}>
          {event.location}
        </address>
      </div>

      <CapacityBar registered={event.registeredCount ?? 0} capacity={event.capacity} />

      {/* Access code badge */}
      {event.eventCode && (
        <div
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', border: '2px solid var(--structure)', position: 'relative', zIndex: 2 }}
          onClick={e => e.stopPropagation()}
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--pop)' }}>
            ACCESS CODE
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '1rem', color: 'var(--pop)', opacity: 0.75 }}>
            &rarr;
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '1.125rem', fontWeight: 700, letterSpacing: '0.14em', color: 'var(--structure)' }}>
            {event.eventCode}
          </span>
          <button
            id={`copy-code-${event.id}`}
            className="grit-btn grit-action-btn"
            onClick={handleCopy}
            title="Copy access code"
            style={{
              width: '2rem', height: '2rem',
              background: copied ? 'var(--pop)' : 'transparent',
              border: `1px solid ${copied ? 'var(--pop)' : 'var(--structure)'}`,
              color: copied ? 'var(--anchor)' : 'var(--structure)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: copied ? 'none' : 'var(--shadow-sm)', cursor: 'pointer',
            }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', position: 'relative', zIndex: 2 }} onClick={e => e.stopPropagation()}>
        <button
          id={`edit-event-${event.id}`}
          className="grit-btn grit-action-btn"
          onClick={() => onEdit(event)}
          style={{
            flex: 1, height: '2.75rem',
            background: 'transparent', border: '2px solid var(--structure)',
            color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
          }}
        >
          <Edit3 size={11} /> EDIT
        </button>
        <button
          id={`delete-event-${event.id}`}
          className="grit-btn grit-action-btn"
          onClick={() => onDelete(event.id)}
          disabled={deletingId === event.id}
          style={{
            width: '2.75rem', height: '2.75rem',
            background: 'transparent', border: '2px solid var(--structure)',
            color: 'var(--structure)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)',
            opacity: deletingId === event.id ? 0.4 : 1,
            cursor: deletingId === event.id ? 'not-allowed' : 'pointer',
          }}
        >
          <Trash2 size={12} />
        </button>
      </div>
    </article>
  );
};

// ── Toast ─────────────────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.aside
    role="alert"
    initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
    transition={{ duration: 0.1, ease: 'linear' }}
    style={{
      position: 'fixed', bottom: '2rem', left: '2rem', zIndex: 999,
      display: 'flex', alignItems: 'center', gap: '0.875rem',
      padding: '1rem 1.5rem',
      background: 'var(--anchor)',
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

// ── Event Modal ───────────────────────────────────────────────────────────────
const EventModal = ({ editingEvent, onClose, onSaved }) => {
  const isEditing = !!editingEvent;
  const [form, setForm] = useState({
    title: editingEvent?.title || '',
    description: editingEvent?.description || '',
    date: editingEvent?.date ? editingEvent.date.slice(0, 16) : '',
    location: editingEvent?.location || '',
    capacity: editingEvent?.capacity || '',
    registrationStart: editingEvent?.registrationStart ? editingEvent.registrationStart.slice(0, 16) : '',
    registrationEnd: editingEvent?.registrationEnd ? editingEvent.registrationEnd.slice(0, 16) : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        date: form.date + ':00',
        registrationStart: form.registrationStart + ':00',
        registrationEnd: form.registrationEnd + ':00',
        capacity: parseInt(form.capacity, 10),
        eventCode: isEditing ? (editingEvent.eventCode || null) : null,
      };
      if (isEditing) await eventsApi.update(editingEvent.id, payload);
      else await eventsApi.create(payload);
      onSaved(isEditing ? 'EVENT UPDATED.' : 'EVENT CREATED!');
    } catch (err) {
      setError((err?.response?.data?.message || err?.message || 'FAILED TO SAVE.').toUpperCase());
    } finally { setSaving(false); }
  };

  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: 'linear' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.88)',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '560px',
          background: 'var(--anchor)',
          border: '2px solid var(--structure)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Modal header */}
        <div style={{ padding: '2.25rem 2.5rem 1.75rem', borderBottom: '1px solid var(--dim-border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '0.625rem' }}>
              EVENTSPHERE&thinsp;//&thinsp;STUDIO
            </p>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(2rem, 3vw, 2.75rem)', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1 }}>
              {isEditing ? 'EDIT EVENT' : 'DRAFT NEW EVENT'}
            </h2>
          </div>
          <button id="modal-close-btn" className="grit-btn" onClick={onClose} aria-label="Close modal"
            style={{ width: '2.5rem', height: '2.5rem', flexShrink: 0, background: 'transparent', border: '1px solid var(--dim-border)', color: 'var(--structure)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>

        {/* Modal form body */}
        <div style={{ padding: '2rem 2.5rem 2.5rem', overflowY: 'auto', maxHeight: 'calc(100vh - 14rem)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <FieldInput label="Event Title" value={form.title} onChange={set('title')} placeholder="e.g. SYSTEMS DESIGN SUMMIT 2026" required />
            <FieldTextarea label="Description" value={form.description} onChange={set('description')} placeholder="What happens, who should attend, what to expect." />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FieldInput label="Date & Time" type="datetime-local" value={form.date} onChange={set('date')} required />
              <FieldInput label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} placeholder="500" required min="1" />
            </div>
            <FieldInput label="Location" value={form.location} onChange={set('location')} placeholder="e.g. CHENNAI TRADE CENTRE, HALL 3" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FieldInput label="Reg. Opens" type="datetime-local" value={form.registrationStart} onChange={set('registrationStart')} required />
              <FieldInput label="Reg. Closes" type="datetime-local" value={form.registrationEnd} onChange={set('registrationEnd')} required />
            </div>

            {error && (
              <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', border: '1px solid var(--structure)', padding: '0.75rem 1rem', letterSpacing: '0.04em', opacity: 0.8 }}>
                !! {error}
              </p>
            )}

            <div style={{ display: 'flex', gap: '0.875rem', paddingTop: '0.5rem' }}>
              <button id="modal-cancel-btn" type="button" onClick={onClose} className="grit-btn"
                style={{ flex: 1, height: '3.25rem', background: 'transparent', border: '2px solid var(--dim-border)', color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
                CANCEL
              </button>
              <button id="modal-submit-btn" type="submit" className="grit-btn" disabled={saving}
                style={{ flex: 1, height: '3.25rem', background: 'var(--pop)', border: '2px solid var(--pop)', color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', boxShadow: 'var(--shadow)', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.65 : 1 }}>
                {saving ? 'SAVING...' : (isEditing ? 'UPDATE EVENT' : 'CREATE EVENT')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main Organizer Dashboard ──────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await organizerApi.myEvents();
      setEvents(data);
    } catch { showToast('FAILED TO LOAD EVENTS.', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  // Auto-refresh: update counts when the organizer returns to this tab,
  // and poll every 30 s so the board stays live even without tab-switching.
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === 'visible') fetchEvents(); };
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(fetchEvents, 30_000);
    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, [fetchEvents]);

  const handleSaved = (msg) => { setModalOpen(false); setEditingEvent(null); showToast(msg); fetchEvents(); };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await eventsApi.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      showToast('EVENT DELETED.');
    } catch { showToast('FAILED TO DELETE.', 'error'); }
    finally { setDeletingId(null); }
  };



  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--anchor)', color: 'var(--structure)', position: 'relative', overflowX: 'hidden' }}>
      <FilmGrain />

      {/* ── HEADER ──────────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 3rem', height: '64px',
        background: 'var(--anchor)',
        borderBottom: '2px solid var(--structure)',
      }}>
        {/* Brand */}
        <div>
          <p style={{ fontFamily: "'VT323', monospace", fontSize: '1.5rem', textTransform: 'uppercase', color: 'var(--structure)', letterSpacing: '0.05em', lineHeight: 1 }}>
            EVENTSPHERE
          </p>
          <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', color: 'var(--structure)', letterSpacing: '0.14em', opacity: 0.45, textTransform: 'uppercase' }}>
            ORGANIZER STUDIO
          </p>
        </div>

        {/* Nav actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>


          <button id="header-new-event-btn" className="grit-btn" onClick={() => { setEditingEvent(null); setModalOpen(true); }}
            style={{ height: '2.5rem', padding: '0 1.5rem', background: 'var(--pop)', border: '2px solid var(--pop)', color: 'var(--anchor)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow)', cursor: 'pointer' }}>
            <Plus size={11} /> DRAFT EVENT
          </button>

          {/* Theme toggle */}
          <button className="theme-toggle" onClick={toggle} title="Toggle theme" aria-label="Toggle theme">
            {theme === 'dark' ? '☀' : '☾'}
          </button>

          <button id="header-logout-btn" className="grit-btn" onClick={() => { logout(); navigate('/login'); }}
            style={{ height: '2.5rem', padding: '0 1.25rem', background: 'transparent', border: '1px solid var(--dim-border)', color: 'var(--structure)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'var(--shadow-sm)', cursor: 'pointer' }}>
            <LogOut size={11} /> LOG OUT
          </button>
        </nav>
      </header>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '3rem' }}>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '5rem 0' }}>
            <span className="spin-grit" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid var(--dim-border)', borderTopColor: 'var(--structure)', borderRadius: '50%' }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.45 }}>
              LOADING STUDIO...
            </span>
          </div>
        )}

        {!loading && (
          <>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'VT323', monospace", fontSize: 'clamp(3rem, 5vw, 4.5rem)', textTransform: 'uppercase', color: 'var(--pop)', lineHeight: 1.0, whiteSpace: 'nowrap' }}>
                MY EVENTS
              </h2>
              <div style={{ flex: 1, height: '2px', background: 'var(--structure)', opacity: 0.15 }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.4 }}>
                {events.length} TOTAL
              </span>
            </div>

            {/* Equal 3-column event grid */}
            <section aria-label="Event board" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
              {events.map((event) => (
                <div key={event.id} style={{ gridColumn: 'span 1' }}>
                  <TactileCard
                    event={event} isLarge={false}
                    onEdit={(ev) => { setEditingEvent(ev); setModalOpen(true); }}
                    onDelete={handleDelete} deletingId={deletingId}
                    fmtDate={fmtDate}
                    onCardClick={(id) => navigate(`/organizer/me/event/${id}`)}
                  />
                </div>
              ))}

              {/* Draft new event — dashed tile, always span 1 */}
              <div style={{ gridColumn: events.length === 0 ? 'span 3' : 'span 1' }}>
                <button
                  id="draft-new-event-btn"
                  className="grit-btn grit-draft"
                  onClick={() => { setEditingEvent(null); setModalOpen(true); }}
                  style={{
                    width: '100%',
                    minHeight: '220px',
                    height: '100%',
                    background: 'transparent',
                    border: '2px dashed var(--dim-border)',
                    color: 'var(--structure)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.25rem',
                    cursor: 'pointer', boxShadow: 'none',
                    transition: 'border-color 0.1s linear',
                  }}
                >
                  <div style={{ width: '3.5rem', height: '3.5rem', border: '1px dashed var(--dim-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={20} color="var(--structure)" />
                  </div>
                  <span style={{ fontFamily: "'VT323', monospace", fontSize: '1.25rem', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.5, letterSpacing: '0.06em' }}>
                    + DRAFT NEW EVENT
                  </span>
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modalOpen && (
          <EventModal editingEvent={editingEvent} onClose={() => { setModalOpen(false); setEditingEvent(null); }} onSaved={handleSaved} />
        )}
      </AnimatePresence>



      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerDashboard;
