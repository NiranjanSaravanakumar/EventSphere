import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useTransform, useMotionValue } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Plus, Calendar, MapPin, Users, Trash2, Edit3, X,
  CheckCircle, AlertCircle, ScanLine, BarChart3, Layers, TrendingUp,
  Key, Copy, Check, LogOut
} from 'lucide-react';
import ScannerPanel from '../components/shared/ScannerPanel.jsx';
import { eventsApi, organizerApi } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import ScrollBounceText from '../components/ui/ScrollBounceText.jsx';

const SPRING = { type: 'spring', stiffness: 320, damping: 26 };

// ── Glass form field ───────────────────────────────────────────────────────────
const FieldInput = ({ label, type = 'text', value, onChange, placeholder, required, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {label}{required && <span style={{ color: '#f87171', marginLeft: '0.25rem' }}>*</span>}
    </label>
    <input
      type={type} value={value} onChange={onChange}
      placeholder={placeholder} required={required}
      style={{
        width: '100%', height: '3rem', padding: '0 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem', color: '#FAFAFA', fontSize: '0.9375rem',
        outline: 'none', transition: 'border-color 0.2s', backdropFilter: 'blur(8px)',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.22)'; }}
      onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      {...rest}
    />
  </div>
);

const FieldTextarea = ({ label, value, onChange, placeholder, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#71717A', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {label}{required && <span style={{ color: '#f87171', marginLeft: '0.25rem' }}>*</span>}
    </label>
    <textarea
      value={value} onChange={onChange} placeholder={placeholder} required={required} rows={3}
      style={{
        width: '100%', padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '1rem', color: '#FAFAFA', fontSize: '0.9375rem',
        outline: 'none', resize: 'vertical', transition: 'border-color 0.2s',
        fontFamily: 'inherit', backdropFilter: 'blur(8px)',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.22)'; }}
      onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    />
  </div>
);

// ── Capacity bar ───────────────────────────────────────────────────────────────
const CapacityBar = ({ registered, capacity, delay = 0 }) => {
  const pct   = capacity > 0 ? Math.min(100, Math.round((registered / capacity) * 100)) : 0;
  const color = pct >= 90 ? '#f87171' : pct >= 70 ? '#fbbf24' : 'rgba(255,255,255,0.4)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>{registered} / {capacity}</span>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1.3, ease: 'easeOut', delay }}
          style={{ height: '100%', background: color, borderRadius: '2px' }}
        />
      </div>
    </div>
  );
};

const TactileCard = ({ event, index, onEdit, onDelete, deletingId, fmtDate }) => {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = (e) => {
    e.stopPropagation();
    if (event.eventCode) {
      navigator.clipboard.writeText(event.eventCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const pct   = event.capacity > 0 ? Math.round((event.registeredCount ?? 0) / event.capacity * 100) : 0;
  const isFull = pct >= 90;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 32, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ ...SPRING, delay: index * 0.07 }}
      style={{
        position: 'relative',
        borderRadius: '2rem',
        background: 'rgba(255,255,255,0.055)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: '0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
        padding: '1.75rem',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
        overflow: 'hidden', cursor: 'default',
      }}
    >
      {/* Top specular */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }} />

      {/* Static subtle glare */}
      <div
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: '2rem',
          background: `radial-gradient(circle at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 65%)`,
        }}
      />

      {/* Clickable Overlay */}
      <div 
        onClick={() => event.onClickCard && event.onClickCard(event.id)}
        style={{ position: 'absolute', inset: 0, zIndex: 1, cursor: 'pointer' }}
      />

      {/* Status dot */}
      {isFull && (
        <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', width: '8px', height: '8px', borderRadius: '50%', background: '#f87171', boxShadow: '0 0 8px rgba(248,113,113,0.7)' }} />
      )}

      {/* Title */}
      <h3 style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em', lineHeight: 1.3 }}>
        {event.title}
      </h3>

      {/* Meta */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {[
          { Icon: Calendar, text: fmtDate(event.date) },
          { Icon: MapPin,   text: event.location },
        ].map(({ Icon, text }) => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Icon style={{ width: '0.8125rem', height: '0.8125rem', color: '#52525b', flexShrink: 0 }} />
            <span style={{ fontSize: '0.8125rem', color: '#71717A' }}>{text}</span>
          </div>
        ))}
      </div>

      {/* Capacity bar */}
      <CapacityBar
        registered={event.registeredCount ?? 0}
        capacity={event.capacity}
        delay={0.25 + index * 0.06}
      />

      {/* Access Code badge */}
      {event.eventCode && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.625rem 0.875rem',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '0.875rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Key style={{ width: '0.75rem', height: '0.75rem', color: '#52525b' }} />
            <span style={{ fontSize: '0.6875rem', color: '#52525b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Access Code</span>
            <span style={{ fontFamily: '"SF Mono", "Fira Code", monospace', fontSize: '0.875rem', fontWeight: 700, color: '#FAFAFA', letterSpacing: '0.12em' }}>{event.eventCode}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={handleCopyCode}
            title="Copy code"
            style={{
              width: '1.75rem', height: '1.75rem', borderRadius: '0.5rem',
              background: copied ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${copied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.08)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: copied ? '#6ee7b7' : '#71717A',
              transition: 'all 0.2s',
            }}
          >
            {copied
              ? <Check style={{ width: '0.75rem', height: '0.75rem' }} />
              : <Copy style={{ width: '0.75rem', height: '0.75rem' }} />}
          </motion.button>
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
        <motion.button
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={(e) => { e.stopPropagation(); onEdit(event); }}
          style={{
            flex: 1, height: '2.5rem', borderRadius: '0.875rem',
            background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)',
            color: '#D4D4D8', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          }}
        >
          <Edit3 style={{ width: '0.8125rem', height: '0.8125rem' }} />
          Edit
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={(e) => { e.stopPropagation(); onDelete(event.id); }}
          disabled={deletingId === event.id}
          style={{
            width: '2.5rem', height: '2.5rem', borderRadius: '0.875rem',
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
            color: '#f87171', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: deletingId === event.id ? 0.4 : 1,
          }}
        >
          <Trash2 style={{ width: '0.8125rem', height: '0.8125rem' }} />
        </motion.button>
      </div>
    </motion.div>
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
    {type === 'success'
      ? <CheckCircle style={{ width: '1rem', height: '1rem' }} />
      : <AlertCircle style={{ width: '1rem', height: '1rem' }} />}
    {message}
  </motion.div>
);

// ── Create / Edit Modal ────────────────────────────────────────────────────────
const EventModal = ({ editingEvent, onClose, onSaved }) => {
  const isEditing = !!editingEvent;
  const [form, setForm] = useState({
    title:             editingEvent?.title             || '',
    description:       editingEvent?.description       || '',
    date:              editingEvent?.date ? editingEvent.date.slice(0, 16) : '',
    location:          editingEvent?.location          || '',
    capacity:          editingEvent?.capacity          || '',
    registrationStart: editingEvent?.registrationStart ? editingEvent.registrationStart.slice(0, 16) : '',
    registrationEnd:   editingEvent?.registrationEnd   ? editingEvent.registrationEnd.slice(0, 16)   : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        date:              form.date              + ':00',
        registrationStart: form.registrationStart + ':00',
        registrationEnd:   form.registrationEnd   + ':00',
        capacity: parseInt(form.capacity, 10),
        // Always auto-generate the access code on create; preserve on edit
        eventCode: isEditing ? (editingEvent.eventCode || null) : null,
      };
      if (isEditing) await eventsApi.update(editingEvent.id, payload);
      else           await eventsApi.create(payload);
      onSaved(isEditing ? 'Event updated.' : 'Event created!');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  // Lock body scroll while modal is open so the page behind never scrolls
  React.useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(12px)', padding: '1rem' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.93, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.93, y: 24 }}
        transition={SPRING}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '520px', borderRadius: '2rem',
          background: 'rgba(8,8,8,0.92)', backdropFilter: 'blur(48px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 48px 120px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
        <div style={{ padding: '2rem', overflowY: 'auto', maxHeight: 'calc(100vh - 4rem)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em' }}>
                <ScrollBounceText as="span" intensity={0.8} maxSkewDeg={2} maxTranslateY={3} stiffness={360} damping={36}>
                  {isEditing ? 'Edit Event' : 'Draft New Event'}
                </ScrollBounceText>
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#52525b', marginTop: '0.25rem' }}>
                {isEditing ? 'Update the event details.' : 'Fill in the details for your event.'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }} whileTap={{ scale: 0.9 }} transition={SPRING}
              onClick={onClose}
              style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#71717A' }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </motion.button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <FieldInput label="Event Title" value={form.title} onChange={set('title')} placeholder="e.g. VisionOS Summit" required />
            <FieldTextarea label="Description" value={form.description} onChange={set('description')} placeholder="Describe your event…" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FieldInput label="Date & Time" type="datetime-local" value={form.date} onChange={set('date')} required />
              <FieldInput label="Capacity" type="number" value={form.capacity} onChange={set('capacity')} placeholder="e.g. 500" required min="1" />
            </div>
            <FieldInput label="Location" value={form.location} onChange={set('location')} placeholder="e.g. Cupertino, CA" required />

            {/* Registration window — stacked so inputs never clip */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FieldInput label="Reg. Opens" type="datetime-local" value={form.registrationStart} onChange={set('registrationStart')} required />
              <FieldInput label="Reg. Closes" type="datetime-local" value={form.registrationEnd}   onChange={set('registrationEnd')}   required />
            </div>

            {/* Access code is always auto-generated — shown on the event card after creation */}

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ fontSize: '0.8125rem', color: '#f87171', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: '0.75rem', padding: '0.625rem 0.875rem' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button
                type="button" onClick={onClose}
                style={{ flex: 1, height: '3rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#71717A', fontSize: '0.9375rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} transition={SPRING}
                disabled={saving}
                style={{ flex: 1, height: '3rem', borderRadius: '1rem', background: saving ? 'rgba(255,255,255,0.3)' : '#FAFAFA', border: 'none', color: '#050505', fontSize: '0.9375rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
              >
                {saving ? 'Saving…' : (isEditing ? 'Update Event' : 'Create Event')}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Main Organizer Dashboard ───────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [events, setEvents]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast]               = useState(null);
  const [deletingId, setDeletingId]     = useState(null);
  const [scannerOpen, setScannerOpen]   = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await organizerApi.myEvents();
      setEvents(data);
    } catch { showToast('Failed to load events.', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchEvents(); }, [fetchEvents]);

  const handleSaved = (msg) => {
    setModalOpen(false);
    setEditingEvent(null);
    showToast(msg);
    fetchEvents();
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await eventsApi.delete(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      showToast('Event deleted.');
    } catch { showToast('Failed to delete.', 'error'); }
    finally { setDeletingId(null); }
  };

  const totalRegistered = events.reduce((s, e) => s + (e.registeredCount ?? 0), 0);
  const totalCapacity   = events.reduce((s, e) => s + (e.capacity ?? 0), 0);
  const nearlyFull      = events.filter(e => (e.registeredCount ?? 0) / e.capacity >= 0.9).length;

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  return (
    <div style={{
      minHeight: '100vh', background: '#050505', color: '#FAFAFA',
      fontFamily: 'Inter, system-ui, sans-serif',
      position: 'relative', overflowX: 'hidden',
    }}>
      {/* Ambient orbs */}
      <div style={{ position: 'absolute', top: '-5%', left: '30%', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.015) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── FLOATING TOP NAV ────────────────────────────────────────────────── */}
      <div style={{ position: 'sticky', top: '1.25rem', zIndex: 50, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
        <motion.header
          initial={{ opacity: 0, y: -20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ ...SPRING, delay: 0.05 }}
          style={{
            pointerEvents: 'auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '2rem',
            padding: '0 1.25rem',
            height: '3.25rem',
            background: 'rgba(255,255,255,0.055)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.10)',
            borderRadius: '999px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.12)',
            minWidth: 'min(90vw, 680px)',
          }}
        >
          {/* Brand */}
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#FAFAFA', letterSpacing: '-0.01em', whiteSpace: 'nowrap' }}>
            Studio
          </span>

          <div style={{ flex: 1 }} />
          {/* Logout */}
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={SPRING}
            onClick={() => { logout(); navigate('/login'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.5rem 1.25rem', borderRadius: '999px',
              background: '#FAFAFA', border: 'none',
              color: '#050505', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            <LogOut style={{ width: '0.875rem', height: '0.875rem' }} />
            Log Out
          </motion.button>
        </motion.header>
      </div>

      {/* ── HERO AREA ───────────────────────────────────────────────────────── */}
      <div style={{ paddingTop: '4.5rem', paddingBottom: '0', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <motion.h1
          initial={{ opacity: 0, y: 24, filter: 'blur(12px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ ...SPRING, delay: 0.12 }}
          style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 600, letterSpacing: '-0.04em',
            color: '#FAFAFA', lineHeight: 1.05,
          }}
        >
          What are we<br />
          <ScrollBounceText as="span" intensity={1.0} maxSkewDeg={2.5} maxTranslateY={5} stiffness={350} damping={32}>
            <span style={{ color: '#FAFAFA' }}>hosting next?</span>
          </ScrollBounceText>
        </motion.h1>

      </div>

      {/* ── EVENTS CANVAS ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '3rem 2rem 4rem', position: 'relative', zIndex: 1 }}>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
            <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid rgba(255,255,255,0.08)', borderTopColor: 'rgba(255,255,255,0.5)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        )}

        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {/* Draft New Event — dashed placeholder card */}
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: 0.05 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.035)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setEditingEvent(null); setModalOpen(true); }}
              style={{
                borderRadius: '2rem',
                border: '1.5px dashed rgba(255,255,255,0.12)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: '0.75rem', minHeight: '240px', cursor: 'pointer',
                color: '#3f3f46', background: 'transparent',
                transition: 'all 0.2s',
              }}
            >
              <div style={{ width: '3rem', height: '3rem', borderRadius: '1rem', border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Draft New Event</span>
            </motion.div>

            {/* Tactile event cards */}
            {events.map((event, i) => (
              <TactileCard
                key={event.id}
                event={{
                  ...event,
                  onClickCard: (id) => navigate(`/organizer/me/event/${id}`)
                }}
                index={i}
                onEdit={(ev) => { setEditingEvent(ev); setModalOpen(true); }}
                onDelete={handleDelete}
                deletingId={deletingId}
                fmtDate={fmtDate}
              />
            ))}
          </div>
        )}

        {/* Empty state — no events yet */}
        {!loading && events.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.3 } }}
            style={{ textAlign: 'center', paddingTop: '2rem', color: '#3f3f46', fontSize: '0.875rem' }}
          >
            <p>Your studio is empty. Create your first event above.</p>
          </motion.div>
        )}
      </div>

      {/* ── Modals & overlays ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {modalOpen && (
          <EventModal
            editingEvent={editingEvent}
            onClose={() => { setModalOpen(false); setEditingEvent(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scannerOpen && <ScannerPanel onClose={() => setScannerOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrganizerDashboard;
