import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, ScanLine, Users, CheckCircle, Clock, Calendar, MapPin, Loader2
} from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import ScannerPanel from '../components/shared/ScannerPanel.jsx';
import { eventsApi, registrationsApi } from '../services/api.js';
import ScrollBounceText from '../components/ui/ScrollBounceText.jsx';

const SPRING = { type: 'spring', stiffness: 320, damping: 26 };

const OrganizerEventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [eventRes, guestsRes] = await Promise.all([
        eventsApi.getById(id),
        registrationsApi.guestList(id)
      ]);
      setEvent(eventRes.data);
      setGuests(guestsRes.data);
    } catch (err) {
      console.error('Failed to fetch event details', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Optionally re-fetch after scanner closes to update counts
  const handleScannerClose = () => {
    setScannerOpen(false);
    fetchData();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '2rem', height: '2rem', color: '#FAFAFA', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{ minHeight: '100vh', background: '#050505', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#FAFAFA' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Event not found</h2>
        <button onClick={() => navigate(-1)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#FAFAFA', border: 'none', cursor: 'pointer' }}>Go Back</button>
      </div>
    );
  }

  const checkedInCount = guests.filter(g => g.status === 'CHECKED_IN').length;
  const registeredCount = guests.filter(g => g.status === 'REGISTERED').length;
  const cancelledCount = guests.filter(g => g.status === 'CANCELLED').length;
  const totalActive = checkedInCount + registeredCount; // Only active people
  const availableSpots = Math.max(0, event.capacity - totalActive);

  const fmtDate = (iso) => iso
    ? new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : '—';

  // ECharts Registration Pie Chart
  const registrationPieOption = {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#FAFAFA' } },
    legend: { top: 'bottom', textStyle: { color: '#FAFAFA' } },
    series: [
      {
        name: 'Registration',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#050505', borderWidth: 2 },
        label: { show: true, position: 'inside', formatter: '{c}', color: '#FAFAFA', fontWeight: 'bold' },
        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold', color: '#FAFAFA' } },
        labelLine: { show: false },
        data: [
          { value: totalActive, name: 'Registered (Total)', itemStyle: { color: '#60a5fa' } },
          { value: availableSpots, name: 'Available Capacity', itemStyle: { color: '#3f3f46' } },
          { value: cancelledCount, name: 'Cancelled', itemStyle: { color: '#f87171' } }
        ].filter(d => d.value > 0)
      }
    ]
  };

  // ECharts Attendance Pie Chart
  const attendancePieOption = {
    tooltip: { trigger: 'item', backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', textStyle: { color: '#FAFAFA' } },
    legend: { top: 'bottom', textStyle: { color: '#FAFAFA' } },
    series: [
      {
        name: 'Attendance',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#050505', borderWidth: 2 },
        label: { show: true, position: 'inside', formatter: '{c}', color: '#FAFAFA', fontWeight: 'bold' },
        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold', color: '#FAFAFA' } },
        labelLine: { show: false },
        data: [
          { value: checkedInCount, name: 'Inside (Checked In)', itemStyle: { color: '#34d399' } },
          { value: registeredCount, name: 'Registered (Not Arrived)', itemStyle: { color: '#a1a1aa' } }
        ].filter(d => d.value > 0)
      }
    ]
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#050505', color: '#FAFAFA',
      fontFamily: 'Inter, system-ui, sans-serif', padding: '2rem'
    }}>
      {/* Top Nav */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem',
            borderRadius: '999px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#D4D4D8', fontSize: '0.875rem', cursor: 'pointer'
          }}
        >
          <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
          Back to Studio
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setScannerOpen(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem',
            borderRadius: '999px', background: '#FAFAFA', border: 'none',
            color: '#050505', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <ScanLine style={{ width: '1rem', height: '1rem' }} />
          Open Scanner
        </motion.button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        
        {/* Left Column: Event Details & Guest List */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={SPRING}
            style={{
              padding: '2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem'
            }}
          >
            <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              <ScrollBounceText as="span" intensity={1.0} maxSkewDeg={2.5} maxTranslateY={5} stiffness={340} damping={32}>
                {event.title}
              </ScrollBounceText>
            </h1>
            <p style={{ color: '#A1A1AA', lineHeight: 1.6, marginBottom: '2rem' }}>{event.description || 'No description provided.'}</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#D4D4D8' }}>
                <Calendar style={{ color: '#71717A' }} /> <span>{fmtDate(event.date)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#D4D4D8' }}>
                <MapPin style={{ color: '#71717A' }} /> <span>{event.location}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#D4D4D8' }}>
                <Users style={{ color: '#71717A' }} /> <span>Capacity: {event.capacity}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#D4D4D8' }}>
                <CheckCircle style={{ color: '#34d399' }} /> <span>Inside: {checkedInCount}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...SPRING, delay: 0.1 }}
            style={{
              padding: '2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>
              <ScrollBounceText as="span" intensity={0.8} maxSkewDeg={2} maxTranslateY={3} stiffness={360} damping={36}>
                Guest List
              </ScrollBounceText>
            </h2>
            {guests.length === 0 ? (
              <p style={{ color: '#71717A' }}>No guests registered yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {guests.map((g, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '1rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <div>
                      <div style={{ fontWeight: 500, color: '#FAFAFA' }}>{g.attendeeName}</div>
                      <div style={{ fontSize: '0.8125rem', color: '#71717A', marginTop: '0.25rem' }}>{g.attendeeEmail}</div>
                    </div>
                    <div style={{
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                      background: g.status === 'CHECKED_IN' ? 'rgba(52,211,153,0.1)' : g.status === 'REGISTERED' ? 'rgba(96,165,250,0.1)' : 'rgba(248,113,113,0.1)',
                      color: g.status === 'CHECKED_IN' ? '#34d399' : g.status === 'REGISTERED' ? '#60a5fa' : '#f87171'
                    }}>
                      {g.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Right Column: Dashboard / Chart */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ ...SPRING, delay: 0.2 }}
            style={{
              padding: '2rem', borderRadius: '1.5rem', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', position: 'sticky', top: '2rem'
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
              <ScrollBounceText as="span" intensity={0.8} maxSkewDeg={2} maxTranslateY={3} stiffness={360} damping={36}>
                Event Stats
              </ScrollBounceText>
            </h2>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', fontWeight: 700, color: '#34d399', lineHeight: 1 }}>{checkedInCount}</div>
                <div style={{ fontSize: '0.875rem', color: '#71717A', marginTop: '0.5rem' }}>People Inside</div>
              </div>
            </div>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: '#D4D4D8', marginTop: '2rem' }}>
              <ScrollBounceText as="span" intensity={0.7} maxSkewDeg={1.5} maxTranslateY={2} stiffness={380} damping={38}>
                Registration Status
              </ScrollBounceText>
            </h3>
            <div style={{ height: '240px', width: '100%', marginBottom: '1rem' }}>
              <ReactECharts option={registrationPieOption} style={{ height: '100%', width: '100%' }} />
            </div>

            <h3 style={{ fontSize: '0.875rem', fontWeight: 600, textAlign: 'center', color: '#D4D4D8', marginTop: '1rem' }}>
              <ScrollBounceText as="span" intensity={0.7} maxSkewDeg={1.5} maxTranslateY={2} stiffness={380} damping={38}>
                Attendance Breakdown
              </ScrollBounceText>
            </h3>
            <div style={{ height: '240px', width: '100%' }}>
              <ReactECharts option={attendancePieOption} style={{ height: '100%', width: '100%' }} />
            </div>

          </motion.div>
        </div>

      </div>

      <AnimatePresence>
        {scannerOpen && <ScannerPanel onClose={handleScannerClose} />}
      </AnimatePresence>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default OrganizerEventDetails;
