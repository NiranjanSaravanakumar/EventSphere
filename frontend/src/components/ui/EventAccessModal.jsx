import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ArrowRight, Clock, Users } from 'lucide-react';

/**
 * EventAccessModal — Retro Terminal Amber version.
 * Hard 2px border, unblurred 10px shadow, VT323 title, IBM Plex Mono body.
 * No blur, no rounded corners, no spring physics.
 * Parent controls open/close state and provides async onSubmitCode handler.
 */
export default function EventAccessModal({ isOpen, onClose, event, onSubmitCode }) {
  const [code, setCode]                 = useState('');
  const [error, setError]               = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) { setCode(''); setError(''); }
  }, [isOpen, event?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('ENTER THE EVENT CODE.'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmitCode(code.trim());
      onClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'INVALID EVENT CODE.';
      setError(msg.toUpperCase());
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSoldOut = event && event.availableSeats === 0;

  const fmtWindow = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : '—';

  return (
    <AnimatePresence>
      {isOpen && event && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

          {/* Backdrop — flat dark, no blur */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)' }}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.12, ease: 'linear' }}
            style={{
              position: 'relative',
              width: '100%', maxWidth: '440px',
              background: 'var(--anchor)',
              border: '2px solid var(--structure)',
              boxShadow: '10px 10px 0px var(--ink)',
            }}
          >
            {/* Header strip */}
            <div style={{
              padding: '2rem 2.5rem 1.75rem',
              borderBottom: '1px solid var(--dim-border)',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            }}>
              <div>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--pop)', marginBottom: '0.625rem' }}>
                  EVENTSPHERE&thinsp;//&thinsp;GATE CHECK
                </p>
                <h2 style={{ fontFamily: "'VT323', monospace", fontSize: '2.25rem', textTransform: 'uppercase', color: 'var(--structure)', lineHeight: 1 }}>
                  ENTER ACCESS CODE
                </h2>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.55, lineHeight: 1.8, letterSpacing: '0.04em', marginTop: '0.625rem', maxWidth: '320px' }}>
                  TYPE THE INVITE CODE PROVIDED BY THE ORGANIZER FOR{' '}
                  <strong style={{ color: 'var(--structure)', opacity: 1 }}>{event.title.toUpperCase()}</strong>.
                </p>
              </div>

              {/* Close button */}
              <button
                id="modal-close-btn"
                className="grit-btn"
                onClick={onClose}
                aria-label="Close modal"
                style={{
                  width: '2.5rem', height: '2.5rem', flexShrink: 0,
                  background: 'transparent', border: '1px solid var(--dim-border)',
                  color: 'var(--structure)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-sm)', cursor: 'pointer',
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: '2rem 2.5rem 2.5rem' }}>

              {/* Info badges */}
              <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', border: `1px solid ${isSoldOut ? 'var(--structure)' : 'var(--dim-border)'}`, fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: isSoldOut ? 'var(--structure)' : 'var(--structure)', opacity: isSoldOut ? 1 : 0.65 }}>
                  <Users size={10} />
                  {isSoldOut ? 'SOLD OUT' : `${event.availableSeats} SEATS LEFT`}
                </div>
                {event.registrationEnd && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.3rem 0.75rem', border: '1px solid var(--dim-border)', fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--structure)', opacity: 0.55 }}>
                    <Clock size={10} />
                    CLOSES {fmtWindow(event.registrationEnd)}
                  </div>
                )}
              </div>

              {/* Code form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--structure)' }}>
                    INVITE CODE
                  </label>
                  <input
                    id="event-code-input"
                    type="text"
                    maxLength={12}
                    placeholder="ES-XX-XXXXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
                    disabled={isSoldOut || isSubmitting}
                    autoFocus
                    className="grit-input"
                    style={{
                      width: '100%', height: '4rem',
                      padding: '0 1.5rem',
                      textAlign: 'center',
                      fontSize: '1.375rem',
                      letterSpacing: '0.25em',
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontWeight: 700,
                      border: error ? '2px solid var(--structure)' : undefined,
                      opacity: isSoldOut ? 0.4 : 1,
                    }}
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.5625rem', color: 'var(--structure)', letterSpacing: '0.06em', opacity: 0.8 }}
                      >
                        !! {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA */}
                <button
                  id="event-code-submit"
                  type="submit"
                  className="grit-btn"
                  disabled={isSubmitting || isSoldOut}
                  style={{
                    width: '100%', height: '3.25rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.625rem',
                    background: isSoldOut ? 'var(--dim-bg)' : 'var(--pop)',
                    border: `2px solid ${isSoldOut ? 'var(--dim-border)' : 'var(--pop)'}`,
                    color: isSoldOut ? 'var(--structure)' : 'var(--anchor)',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                    boxShadow: isSoldOut ? 'none' : 'var(--shadow)',
                    cursor: isSoldOut || isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.65 : 1,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spin-grit" style={{ display: 'inline-block', width: '0.875rem', height: '0.875rem', border: '2px solid var(--anchor)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                      VERIFYING...
                    </>
                  ) : isSoldOut ? (
                    'SOLD OUT'
                  ) : (
                    <>CONFIRM REGISTRATION <ArrowRight size={13} /></>
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
