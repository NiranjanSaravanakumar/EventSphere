import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { MapPin, Calendar, Clock, CheckCircle, Ticket } from 'lucide-react';

/**
 * TicketPass — Apple Wallet-style Liquid Glass ticket with:
 *  - 3D magnetic hover tilt (useSpring)
 *  - Specular glare chasing the cursor
 *  - Perforated divider (notched circles)
 *  - Live ZXing Base64 QR code
 */
const TicketPass = ({
  eventName,
  date,
  time,
  location,
  attendeeName,
  qrBase64,
  status = 'REGISTERED',
  qrToken,
}) => {
  const cardRef = useRef(null);

  // Raw motion values (instant)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Smoothed springs
  const springX = useSpring(rawX, { stiffness: 280, damping: 28 });
  const springY = useSpring(rawY, { stiffness: 280, damping: 28 });

  // Map [-0.5, 0.5] → rotation degrees
  const rotateX = useTransform(springY, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-7deg', '7deg']);

  // Glare position mapped to CSS gradient
  const glareX = useTransform(springX, [-0.5, 0.5], ['0%', '100%']);
  const glareY = useTransform(springY, [-0.5, 0.5], ['0%', '100%']);

  const handleMouseMove = (e) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const isCheckedIn = status === 'CHECKED_IN';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1000,
      }}
      initial={{ opacity: 0, y: 32, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
    >
      {/* ── Card shell ──────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          width: '320px',
          borderRadius: '2rem',
          overflow: 'hidden',
          background: 'rgba(var(--glass-rgb),0.055)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          border: isCheckedIn
            ? '1px solid rgba(16,185,129,0.30)'
            : '1px solid rgba(var(--glass-rgb),0.10)',
          boxShadow: isCheckedIn
            ? '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.15), inset 0 1px 0 rgba(var(--glass-rgb),0.15)'
            : '0 32px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(var(--glass-rgb),0.15)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {/* Specular glare — follows cursor */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            pointerEvents: 'none',
            borderRadius: '2rem',
            background: useTransform(
              [glareX, glareY],
              ([gx, gy]) =>
                `radial-gradient(circle at ${gx} ${gy}, rgba(var(--glass-rgb),0.12) 0%, transparent 55%)`
            ),
          }}
        />

        {/* Top edge highlight */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(var(--glass-rgb),0.25), transparent)',
          zIndex: 21,
        }} />

        {/* ── TOP SECTION — Event details ─────────────────────────────────── */}
        <div style={{ padding: '2rem', position: 'relative', zIndex: 10 }}>
          {/* Status badge */}
          {isCheckedIn && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
              padding: '0.25rem 0.75rem', borderRadius: '999px', marginBottom: '1rem',
              background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.30)',
              fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.06em',
              textTransform: 'uppercase', color: '#6ee7b7',
            }}>
              <CheckCircle style={{ width: '0.75rem', height: '0.75rem' }} />
              Checked In
            </div>
          )}

          {/* Event name */}
          <h2 style={{
            fontSize: '1.125rem', fontWeight: 700,
            letterSpacing: '-0.02em', lineHeight: 1.25,
            color: 'var(--color-text-primary)',
          }}>
            {eventName}
          </h2>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-subtle)', marginTop: '0.375rem' }}>
            {attendeeName}
          </p>

          {/* Meta rows */}
          <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {[
              { Icon: Calendar, text: date },
              { Icon: Clock,    text: time },
              { Icon: MapPin,   text: location },
            ].map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Icon style={{ width: '0.9375rem', height: '0.9375rem', color: 'var(--color-text-subtle)', flexShrink: 0 }} />
                <span style={{ fontSize: '0.8125rem', color: '#D4D4D8' }}>{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── PERFORATED DIVIDER (Apple Wallet style) ─────────────────────── */}
        <div style={{ position: 'relative', height: '1px', zIndex: 10 }}>
          {/* Left notch */}
          <div style={{
            position: 'absolute', left: '-14px', top: '50%', transform: 'translateY(-50%)',
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--color-bg-primary)',
            border: '1px solid rgba(var(--glass-rgb),0.07)',
          }} />
          {/* Dashed line */}
          <div style={{
            position: 'absolute', left: '14px', right: '14px', top: '50%',
            borderTop: '1.5px dashed rgba(var(--glass-rgb),0.10)',
          }} />
          {/* Right notch */}
          <div style={{
            position: 'absolute', right: '-14px', top: '50%', transform: 'translateY(-50%)',
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--color-bg-primary)',
            border: '1px solid rgba(var(--glass-rgb),0.07)',
          }} />
        </div>

        {/* ── BOTTOM SECTION — QR Code ────────────────────────────────────── */}
        <div style={{
          padding: '2rem',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
          background: 'rgba(0,0,0,0.20)',
          position: 'relative', zIndex: 10,
        }}>
          {qrBase64 ? (
            <div style={{
              padding: '0.875rem',
              background: '#FFFFFF',
              borderRadius: '1.125rem',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}>
              <img
                src={qrBase64}
                alt="Check-in QR Code"
                style={{
                  width: '160px', height: '160px',
                  objectFit: 'contain',
                  display: 'block',
                  mixBlendMode: 'multiply',
                }}
              />
            </div>
          ) : (
            /* Fallback skeleton while loading */
            <div style={{
              width: '190px', height: '190px',
              borderRadius: '1.125rem',
              background: 'rgba(var(--glass-rgb),0.04)',
              border: '1px solid rgba(var(--glass-rgb),0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ticket style={{ width: '2rem', height: '2rem', color: '#3f3f46' }} />
            </div>
          )}

          {/* Token + scan label */}
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--color-text-subtle)',
            }}>
              {isCheckedIn ? 'Already Scanned' : 'Ready to Scan'}
            </p>
            {qrToken && (
              <p style={{
                fontSize: '0.6875rem', color: '#3f3f46',
                fontFamily: 'Quantico, monospace', letterSpacing: '0.04em',
                marginTop: '0.25rem',
              }}>
                {qrToken}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketPass;
