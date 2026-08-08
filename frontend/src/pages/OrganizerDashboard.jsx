import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Trash2, Edit3, X, CheckCircle, AlertCircle, TrendingUp, Layers, ScanLine, BarChart3 } from 'lucide-react';
import Navbar from '../components/shared/Navbar.jsx';
import ScannerPanel from '../components/shared/ScannerPanel.jsx';
import { eventsApi } from '../services/api.js';

// ── Animation variants ────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, filter: 'blur(8px)' },
  show: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { type: 'spring', stiffness: 280, damping: 22 },
  },
};

const statVariants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

const SPRING = { type: 'spring', stiffness: 400, damping: 30 };

// ── Glass input helper ────────────────────────────────────────────────────────
const FieldInput = ({ label, type = 'text', value, onChange, placeholder, required, ...rest }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#D4D4D8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{required && <span style={{ color: '#f87171', marginLeft: '0.25rem' }}>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      style={{
        width: '100%', height: '2.75rem',
        padding: '0 0.875rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.625rem',
        color: '#FAFAFA', fontSize: '0.875rem',
        outline: 'none', transition: 'border-color 0.2s',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.22)'; }}
      onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      {...rest}
    />
  </div>
);

const FieldTextarea = ({ label, value, onChange, placeholder, required }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#D4D4D8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label}{required && <span style={{ color: '#f87171', marginLeft: '0.25rem' }}>*</span>}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      rows={3}
      style={{
        width: '100%', padding: '0.625rem 0.875rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '0.625rem',
        color: '#FAFAFA', fontSize: '0.875rem',
        outline: 'none', resize: 'vertical',
        transition: 'border-color 0.2s', fontFamily: 'inherit',
      }}
      onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.22)'; }}
      onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; }}
    />
  </div>
);

// ── Capacity bar ──────────────────────────────────────────────────────────────
const CapacityBar = ({ registered, capacity, delay = 0 }) => {
  const pct = Math.min(100, Math.round((registered / capacity) * 100));
  const color = pct >= 90 ? '#f87171' : pct >= 70 ? '#fbbf24' : '#FAFAFA';

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.375rem' }}>
        <span style={{ fontSize: '0.6875rem', color: '#71717A' }}>{registered} / {capacity} registered</span>
        <span style={{ fontSize: '0.6875rem', fontWeight: 600, color }}>{pct}%</span>
      </div>
      <div style={{ width: '100%', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay }}
          style={{ height: '100%', background: color, borderRadius: '2px' }}
        />
      </div>
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, delay = 0 }) => (
  <motion.div
    variants={statVariants}
    style={{
      padding: '1.25rem 1.5rem',
      borderRadius: '1rem',
      background: 'rgba(255,255,255,0.04)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', alignItems: 'center', gap: '1rem',
    }}
  >
    <div style={{
      width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
      background: 'rgba(255,255,255,0.06)',
      border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon style={{ width: '1rem', height: '1rem', color: '#D4D4D8' }} />
    </div>
    <div>
      <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#FAFAFA', lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '0.25rem' }}>{label}</p>
    </div>
  </motion.div>
);

// ── Toast notification ────────────────────────────────────────────────────────
const Toast = ({ message, type }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 40, scale: 0.9 }}
    transition={SPRING}
    style={{
      position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
      zIndex: 200,
      display: 'flex', alignItems: 'center', gap: '0.625rem',
      padding: '0.75rem 1.25rem',
      borderRadius: '0.875rem',
      background: type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
      border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
      backdropFilter: 'blur(20px)',
      color: type === 'success' ? '#6ee7b7' : '#f87171',
      fontSize: '0.875rem', fontWeight: 500,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
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
    title:       editingEvent?.title       || '',
    description: editingEvent?.description || '',
    date:        editingEvent?.date ? editingEvent.date.slice(0, 16) : '',
    location:    editingEvent?.location    || '',
    capacity:    editingEvent?.capacity    || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = { ...form, date: form.date + ':00', capacity: parseInt(form.capacity, 10) };
      if (isEditing) {
        await eventsApi.update(editingEvent.id, payload);
      } else {
        await eventsApi.create(payload);
      }
      onSaved(isEditing ? 'Event updated successfully.' : 'Event created successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 24 }}
        transition={SPRING}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '520px',
          borderRadius: '1.5rem',
          background: 'rgba(10,10,10,0.9)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Top highlight */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />

        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em' }}>
                {isEditing ? 'Edit Event' : 'Create Event'}
              </h2>
              <p style={{ fontSize: '0.8125rem', color: '#71717A', marginTop: '0.25rem' }}>
                {isEditing ? 'Update event details below.' : 'Fill in the details for your new event.'}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              transition={SPRING}
              onClick={onClose}
              style={{
                width: '2rem', height: '2rem',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#71717A',
              }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </motion.button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <FieldInput
              label="Event Title" value={form.title}
              onChange={set('title')} placeholder="e.g. VisionOS Developer Summit"
              required
            />
            <FieldTextarea
              label="Description" value={form.description}
              onChange={set('description')} placeholder="Describe your event..."
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <FieldInput
                label="Date & Time" type="datetime-local"
                value={form.date} onChange={set('date')} required
              />
              <FieldInput
                label="Capacity" type="number"
                value={form.capacity} onChange={set('capacity')}
                placeholder="e.g. 500" required min="1"
              />
            </div>
            <FieldInput
              label="Location" value={form.location}
              onChange={set('location')} placeholder="e.g. Cupertino, CA" required
            />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  style={{ fontSize: '0.8125rem', color: '#f87171', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.625rem', padding: '0.625rem 0.875rem' }}
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem' }}>
              <button
                type="button" onClick={onClose}
                style={{
                  flex: 1, height: '2.75rem', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#D4D4D8', fontSize: '0.875rem', cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }}
                transition={SPRING}
                disabled={saving}
                style={{
                  flex: 1, height: '2.75rem', borderRadius: '0.75rem',
                  background: saving ? 'rgba(255,255,255,0.3)' : '#FAFAFA',
                  border: 'none', color: '#050505',
                  fontSize: '0.875rem', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s',
                }}
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

// ── Main Dashboard ─────────────────────────────────────────────────────────────
const OrganizerDashboard = () => {
  const navigate  = useNavigate();
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [toast, setToast]       = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await eventsApi.getMyEvents();
      setEvents(data);
    } catch (err) {
      showToast('Failed to load events.', 'error');
    } finally {
      setLoading(false);
    }
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
    } catch {
      showToast('Failed to delete event.', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  // Stats
  const totalRegistered = events.reduce((s, e) => s + (e.registeredCount ?? 0), 0);
  const totalCapacity   = events.reduce((s, e) => s + (e.capacity ?? 0), 0);
  const nearlyFull      = events.filter(e => e.registeredCount / e.capacity >= 0.9).length;

  // Format date
  const fmtDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#FAFAFA', fontFamily: 'Inter, sans-serif' }}>
      <Navbar />

      <div style={{ position: 'relative', padding: '2.5rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Ambient orb */}
        <div style={{
          position: 'absolute', top: '-10%', right: '15%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'rgba(255,255,255,0.025)', filter: 'blur(100px)',
          pointerEvents: 'none',
        }} />

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', position: 'relative', zIndex: 10 }}
        >
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, letterSpacing: '-0.03em', color: '#FAFAFA' }}>
              Your Events
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.375rem' }}>
              Manage and track your upcoming sessions.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Analytics button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING}
              onClick={() => navigate('/analytics')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem', borderRadius: '0.875rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#D4D4D8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <BarChart3 style={{ width: '1rem', height: '1rem' }} />
              Analytics
            </motion.button>

            {/* Scanner button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING}
              onClick={() => setScannerOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem', borderRadius: '0.875rem',
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.10)',
                color: '#D4D4D8', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <ScanLine style={{ width: '1rem', height: '1rem' }} />
              Scan QR
            </motion.button>

            {/* Create button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={SPRING}
              onClick={() => { setEditingEvent(null); setModalOpen(true); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                padding: '0.625rem 1.25rem', borderRadius: '0.875rem',
                background: '#FAFAFA', color: '#050505',
                border: 'none', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              New Event
            </motion.button>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem', position: 'relative', zIndex: 10 }}
        >
          <StatCard icon={Layers}     label="Total Events"       value={events.length} />
          <StatCard icon={Users}      label="Total Registered"   value={totalRegistered} />
          <StatCard icon={TrendingUp} label="Total Capacity"     value={totalCapacity} />
          <StatCard icon={AlertCircle} label="Nearly Full"       value={nearlyFull} />
        </motion.div>

        {/* Events grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
            <div style={{ width: '2rem', height: '2rem', border: '2px solid rgba(255,255,255,0.12)', borderTopColor: 'rgba(255,255,255,0.6)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{
              paddingTop: '5rem', textAlign: 'center',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
            }}
          >
            <div style={{
              width: '5rem', height: '5rem', borderRadius: '1.5rem',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Calendar style={{ width: '2rem', height: '2rem', color: '#71717A' }} />
            </div>
            <div>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#FAFAFA' }}>No events yet</p>
              <p style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.25rem' }}>
                Click "New Event" to create your first event.
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.25rem',
              position: 'relative', zIndex: 10,
            }}
          >
            {events.map((event, i) => (
              <motion.div
                key={event.id}
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={SPRING}
                style={{
                  padding: '1.5rem',
                  borderRadius: '1.25rem',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                  cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* Top highlight */}
                <div style={{ position: 'absolute', left: 0, right: 0, top: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' }} />

                {/* Title */}
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.015em', lineHeight: 1.3 }}>
                  {event.title}
                </h3>

                {/* Meta */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[
                    { Icon: Calendar, text: fmtDate(event.date) },
                    { Icon: MapPin,   text: event.location },
                    { Icon: Users,    text: `${event.registeredCount ?? 0} / ${event.capacity} registered` },
                  ].map(({ Icon, text }) => (
                    <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <Icon style={{ width: '0.875rem', height: '0.875rem', color: '#71717A', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.8125rem', color: '#D4D4D8' }}>{text}</span>
                    </div>
                  ))}
                </div>

                {/* Capacity bar */}
                <CapacityBar
                  registered={event.registeredCount ?? 0}
                  capacity={event.capacity}
                  delay={0.3 + i * 0.08}
                />

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.25rem' }}>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={(e) => { e.stopPropagation(); setEditingEvent(event); setModalOpen(true); }}
                    style={{
                      flex: 1, height: '2.25rem', borderRadius: '0.625rem',
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                      color: '#D4D4D8', fontSize: '0.8125rem', fontWeight: 500, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    }}
                  >
                    <Edit3 style={{ width: '0.8125rem', height: '0.8125rem' }} />
                    Edit
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={(e) => { e.stopPropagation(); handleDelete(event.id); }}
                    disabled={deletingId === event.id}
                    style={{
                      height: '2.25rem', width: '2.25rem', borderRadius: '0.625rem',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                      color: '#f87171', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: deletingId === event.id ? 0.5 : 1,
                    }}
                  >
                    <Trash2 style={{ width: '0.875rem', height: '0.875rem' }} />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <EventModal
            editingEvent={editingEvent}
            onClose={() => { setModalOpen(false); setEditingEvent(null); }}
            onSaved={handleSaved}
          />
        )}
      </AnimatePresence>

      {/* Check-In Scanner */}
      <AnimatePresence>
        {scannerOpen && (
          <ScannerPanel onClose={() => setScannerOpen(false)} />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerDashboard;
