import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, ArrowRight, Clock, Users } from 'lucide-react';

const SPRING = { type: 'spring', stiffness: 380, damping: 30 };

/**
 * Liquid-glass modal that prompts an attendee for an event access code before
 * hitting the registration API. The parent controls open/close state and
 * provides the async onSubmitCode handler.
 */
export default function EventAccessModal({ isOpen, onClose, event, onSubmitCode }) {
  const [code, setCode]               = useState('');
  const [error, setError]             = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset when the modal opens for a new event
  useEffect(() => {
    if (isOpen) { setCode(''); setError(''); }
  }, [isOpen, event?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) { setError('Please enter the event code.'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onSubmitCode(code.trim());
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Invalid event code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSoldOut = event && event.availableSeats === 0;

  const fmtWindow = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
        })
      : '—';

  return (
    <AnimatePresence>
      {isOpen && event && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>

          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          />

          {/* Liquid-glass panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.94, y: 16, filter: 'blur(6px)' }}
            transition={SPRING}
            style={{
              position: 'relative',
              width: '100%', maxWidth: '420px',
              borderRadius: '2rem',
              background: 'rgba(255,255,255,0.06)',
              backdropFilter: 'blur(48px)',
              WebkitBackdropFilter: 'blur(48px)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.14)',
              overflow: 'hidden',
            }}
          >
            {/* Top specular line */}
            <div style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)',
            }} />

            <div style={{ padding: '2rem' }}>

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                transition={SPRING}
                onClick={onClose}
                style={{
                  position: 'absolute', top: '1.5rem', right: '1.5rem',
                  width: '2rem', height: '2rem', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: '#71717A',
                }}
              >
                <X style={{ width: '0.9rem', height: '0.9rem' }} />
              </motion.button>

              {/* Header */}
              <div style={{ marginBottom: '1.75rem' }}>
                <div style={{
                  width: '3rem', height: '3rem', borderRadius: '1rem',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.10)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <Lock style={{ width: '1.25rem', height: '1.25rem', color: '#FAFAFA' }} />
                </div>
                <h2 style={{
                  fontSize: '1.375rem', fontWeight: 600,
                  color: '#FAFAFA', letterSpacing: '-0.025em',
                  lineHeight: 1.2, marginBottom: '0.5rem',
                }}>
                  Unlock Access
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#71717A', lineHeight: 1.6 }}>
                  Enter the invite code provided by the organizer to register for{' '}
                  <span style={{ color: '#D4D4D8', fontWeight: 500 }}>{event.title}</span>.
                </p>
              </div>

              {/* Info pills */}
              <div style={{ display: 'flex', gap: '0.625rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.375rem 0.75rem', borderRadius: '999px',
                  background: isSoldOut ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isSoldOut ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.08)'}`,
                  fontSize: '0.75rem', fontWeight: 500,
                  color: isSoldOut ? '#f87171' : '#D4D4D8',
                }}>
                  <Users style={{ width: '0.75rem', height: '0.75rem' }} />
                  {isSoldOut ? 'Sold Out' : `${event.availableSeats} seats left`}
                </div>

                {event.registrationEnd && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.375rem 0.75rem', borderRadius: '999px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    fontSize: '0.75rem', fontWeight: 500, color: '#D4D4D8',
                  }}>
                    <Clock style={{ width: '0.75rem', height: '0.75rem' }} />
                    Closes {fmtWindow(event.registrationEnd)}
                  </div>
                )}
              </div>

              {/* Code form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <input
                    id="event-code-input"
                    type="text"
                    maxLength={12}
                    placeholder="XXXXXX"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                    disabled={isSoldOut || isSubmitting}
                    autoFocus
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      height: '3.75rem',
                      background: 'rgba(0,0,0,0.35)',
                      border: error
                        ? '1px solid rgba(239,68,68,0.45)'
                        : '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '1rem',
                      padding: '0 1.25rem',
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      letterSpacing: '0.3em',
                      fontFamily: '"SF Mono", "Fira Code", "Courier New", monospace',
                      fontWeight: 600,
                      color: '#FAFAFA',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      opacity: isSoldOut ? 0.4 : 1,
                    }}
                    onFocus={(e) => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.28)'; }}
                    onBlur={(e)  => { if (!error) e.target.style.borderColor = 'rgba(255,255,255,0.10)'; }}
                  />

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        style={{
                          marginTop: '0.5rem',
                          fontSize: '0.8125rem', color: '#f87171',
                          textAlign: 'center',
                        }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA */}
                <motion.button
                  id="event-code-submit"
                  type="submit"
                  whileHover={!isSoldOut && !isSubmitting ? { scale: 1.02 } : undefined}
                  whileTap={!isSoldOut && !isSubmitting ? { scale: 0.97 } : undefined}
                  transition={SPRING}
                  disabled={isSubmitting || isSoldOut}
                  style={{
                    width: '100%', height: '3rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    background: isSoldOut ? 'rgba(255,255,255,0.05)' : isSubmitting ? 'rgba(255,255,255,0.55)' : '#FAFAFA',
                    border: 'none',
                    borderRadius: '1rem',
                    color: isSoldOut ? '#52525b' : '#050505',
                    fontSize: '0.9375rem', fontWeight: 700,
                    cursor: isSoldOut || isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {isSubmitting
                    ? 'Verifying…'
                    : isSoldOut
                    ? 'Sold Out'
                    : (
                      <>
                        Confirm Registration
                        <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                      </>
                    )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
