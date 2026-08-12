import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, CheckCircle, XCircle, User, Calendar, RotateCcw } from 'lucide-react';
import { checkInApi } from '../../services/api.js';

const SPRING = { type: 'spring', stiffness: 380, damping: 28 };

/**
 * ScannerPanel — Organizer tool to manually enter or paste a QR token
 * and validate it against the backend check-in endpoint.
 */
const ScannerPanel = ({ onClose }) => {
  const [token, setToken]     = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult]   = useState(null); // { success, message, attendeeName, eventTitle }

  const handleScan = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;
    setScanning(true);
    setResult(null);
    try {
      const { data } = await checkInApi.validate(token.trim());
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        message: err?.response?.data?.message || 'Check-in request failed.',
        attendeeName: null,
        eventTitle: null,
      });
    } finally {
      setScanning(false);
    }
  };

  const reset = () => {
    setToken('');
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 24 }}
        transition={SPRING}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: '440px',
          borderRadius: '1.5rem',
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12)',
          overflow: 'hidden',
        }}
      >
        {/* Top highlight */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />

        <div style={{ padding: '2rem' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <div style={{
              width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.09)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ScanLine style={{ width: '1.125rem', height: '1.125rem', color: '#D4D4D8' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#FAFAFA', letterSpacing: '-0.02em' }}>
                Check-In Scanner
              </h2>
              <p style={{ fontSize: '0.75rem', color: '#71717A', marginTop: '0.125rem' }}>
                Paste or type the attendee's QR token
              </p>
            </div>
          </div>

          {/* Token input */}
          <form onSubmit={handleScan} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              placeholder="ES-42-A3F9CC..."
              autoFocus
              style={{
                flex: 1, height: '3rem', padding: '0 1rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: '0.75rem', color: '#FAFAFA',
                fontFamily: 'monospace', fontSize: '0.875rem',
                letterSpacing: '0.04em', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(255,255,255,0.22)'; }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; }}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}
              transition={SPRING}
              disabled={scanning || !token.trim()}
              style={{
                height: '3rem', padding: '0 1.25rem',
                borderRadius: '0.75rem', border: 'none',
                background: scanning || !token.trim() ? 'rgba(255,255,255,0.25)' : '#FAFAFA',
                color: '#050505', fontSize: '0.875rem', fontWeight: 600,
                cursor: scanning || !token.trim() ? 'not-allowed' : 'pointer',
                flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              {scanning ? '…' : 'Validate'}
            </motion.button>
          </form>

          {/* Result area */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div
                key={result.success ? 'success' : 'error'}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8 }}
                transition={SPRING}
                style={{
                  padding: '1.25rem',
                  borderRadius: '1rem',
                  background: result.success ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${result.success ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.22)'}`,
                  display: 'flex', flexDirection: 'column', gap: '0.875rem',
                }}
              >
                {/* Status row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {result.success
                    ? <CheckCircle style={{ width: '1.5rem', height: '1.5rem', color: '#34d399', flexShrink: 0 }} />
                    : <XCircle    style={{ width: '1.5rem', height: '1.5rem', color: '#f87171', flexShrink: 0 }} />}
                  <div>
                    <p style={{ fontSize: '0.9375rem', fontWeight: 700, color: result.success ? '#6ee7b7' : '#f87171' }}>
                      {result.success ? 'Check-In Successful' : 'Check-In Failed'}
                    </p>
                    <p style={{ fontSize: '0.8125rem', color: '#71717A', marginTop: '0.125rem' }}>
                      {result.message}
                    </p>
                  </div>
                </div>

                {/* Attendee / event info (success only) */}
                {result.success && result.attendeeName && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingTop: '0.25rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User style={{ width: '0.875rem', height: '0.875rem', color: '#71717A' }} />
                      <span style={{ fontSize: '0.8125rem', color: '#D4D4D8' }}>{result.attendeeName}</span>
                    </div>
                    {result.eventTitle && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar style={{ width: '0.875rem', height: '0.875rem', color: '#71717A' }} />
                        <span style={{ fontSize: '0.8125rem', color: '#D4D4D8' }}>{result.eventTitle}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Reset button */}
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  transition={SPRING}
                  onClick={reset}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
                    width: '100%', height: '2.5rem', borderRadius: '0.625rem',
                    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
                    color: '#D4D4D8', fontSize: '0.8125rem', cursor: 'pointer',
                  }}
                >
                  <RotateCcw style={{ width: '0.875rem', height: '0.875rem' }} />
                  Scan Another
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScannerPanel;
