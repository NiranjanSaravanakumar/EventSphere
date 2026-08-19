import React, { useRef } from 'react';
import { MapPin, Calendar, Clock, CheckCircle, Ticket } from 'lucide-react';

/**
 * TicketPass — Retro Terminal Amber ticket with:
 *  - Harsh 2px border + 6px unblurred shadow
 *  - Amber --pop accent on status badge
 *  - Perforation divider via CSS border-top dashed
 *  - Mechanical QR container with --structure border
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
  const isCheckedIn = status === 'CHECKED_IN';

  return (
    <article style={{
      width: '320px',
      background: 'var(--anchor)',
      border: `2px solid ${isCheckedIn ? 'var(--pop)' : 'var(--structure)'}`,
      boxShadow: isCheckedIn
        ? '6px 6px 0px var(--pop)'
        : '6px 6px 0px var(--ink)',
      userSelect: 'none',
      fontFamily: "'IBM Plex Mono', monospace",
    }}>

      {/* ── TOP SECTION — Event info ───────────────────────────── */}
      <div style={{ padding: '1.75rem', borderBottom: '2px dashed var(--dim-border)' }}>

        {/* Status badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.375rem',
          padding: '0.25rem 0.625rem', marginBottom: '1rem',
          border: `1px solid ${isCheckedIn ? 'var(--pop)' : 'var(--dim-border)'}`,
          background: isCheckedIn ? 'var(--pop)' : 'transparent',
        }}>
          {isCheckedIn && <CheckCircle size={10} color="var(--anchor)" />}
          <span style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.4375rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: isCheckedIn ? 'var(--anchor)' : 'var(--structure)',
          }}>
            {isCheckedIn ? 'CHECKED IN' : 'REGISTERED'}
          </span>
        </div>

        {/* Event name */}
        <h2 style={{
          fontFamily: "'VT323', monospace",
          fontSize: '1.75rem', textTransform: 'uppercase',
          color: 'var(--structure)', letterSpacing: '0.04em', lineHeight: 1.0,
        }}>
          {eventName}
        </h2>
        <p style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '0.625rem', color: 'var(--structure)', opacity: 0.6,
          letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '0.5rem',
        }}>
          {attendeeName}
        </p>

        {/* Meta rows */}
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {[
            { Icon: Calendar, text: date },
            { Icon: Clock,    text: time },
            { Icon: MapPin,   text: location },
          ].filter(r => r.text).map(({ Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <Icon size={11} color="var(--structure)" style={{ opacity: 0.5, flexShrink: 0 }} />
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '0.5625rem', color: 'var(--structure)', opacity: 0.7,
                letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── BOTTOM SECTION — QR Code ───────────────────────────── */}
      <div style={{
        padding: '1.75rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
        background: 'var(--dim-bg)',
      }}>
        {qrBase64 ? (
          <div style={{
            padding: '0.75rem',
            background: 'var(--structure)',
            border: '2px solid var(--structure)',
            boxShadow: '3px 3px 0px var(--ink)',
          }}>
            <img
              src={qrBase64}
              alt="Check-in QR Code"
              style={{
                width: '148px', height: '148px',
                objectFit: 'contain', display: 'block',
                imageRendering: 'pixelated',
              }}
            />
          </div>
        ) : (
          <div style={{
            width: '180px', height: '180px',
            border: '2px dashed var(--dim-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Ticket size={28} color="var(--structure)" style={{ opacity: 0.25 }} />
          </div>
        )}

        {/* Scan label + token */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: "'IBM Plex Mono', monospace",
            fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase',
            color: isCheckedIn ? 'var(--pop)' : 'var(--structure)', opacity: isCheckedIn ? 1 : 0.55,
          }}>
            {isCheckedIn ? 'ALREADY SCANNED' : 'PRESENT AT DOOR'}
          </p>
          {qrToken && (
            <p style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '0.4375rem', color: 'var(--structure)', opacity: 0.3,
              letterSpacing: '0.06em', marginTop: '0.375rem',
            }}>
              {qrToken}
            </p>
          )}
        </div>
      </div>
    </article>
  );
};

export default TicketPass;
