import React, { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ScanLine, CheckCircle, XCircle, User, Calendar,
  RotateCcw, X, Camera, CameraOff, Type,
} from "lucide-react";
import { checkInApi } from "../../services/api.js";

// Mode Tab Button
const ModeTab = ({ id, icon: Icon, label, active, onClick }) => (
  <button
    id={id}
    onClick={onClick}
    className="grit-btn"
    style={{
      flex: 1, height: "2.625rem",
      display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
      background: active ? "var(--pop)" : "transparent",
      border: "none",
      borderBottom: active ? "2px solid var(--pop)" : "2px solid var(--dim-border)",
      color: active ? "var(--anchor)" : "var(--structure)",
      fontFamily: "'IBM Plex Mono', monospace",
      fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
      cursor: "pointer", opacity: active ? 1 : 0.5,
    }}
  >
    <Icon size={11} />
    {label}
  </button>
);

// Camera Scanner
const CameraScanner = ({ onDetected }) => {
  const videoRef  = useRef(null);
  const readerRef = useRef(null);
  const [camErr, setCamErr] = useState(null);
  const [ready,  setReady]  = useState(false);

  // Immediately kills the reader + every camera track + clears srcObject
  const stopCamera = useCallback(() => {
    try { if (readerRef.current) { readerRef.current.reset(); readerRef.current = null; } } catch {}
    try {
      const vid = videoRef.current;
      if (vid && vid.srcObject) {
        vid.srcObject.getTracks().forEach(t => { t.stop(); });
        vid.srcObject = null;
      }
    } catch {}
  }, []);

  const startCamera = useCallback(async () => {
    setCamErr(null);
    setReady(false);
    try {
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const deviceId = devices.find(d =>
        d.label.toLowerCase().includes("back") ||
        d.label.toLowerCase().includes("rear") ||
        d.label.toLowerCase().includes("environment")
      )?.deviceId || devices[0]?.deviceId || undefined;
      await reader.decodeFromVideoDevice(deviceId, videoRef.current, (res, err) => {
        if (res) { onDetected(res.getText()); return; }
        // Silence "NotFoundException" — normal "no QR in frame yet" events
        if (err && err.name !== "NotFoundException" && !/not found/i.test(err.message || "")) {
          console.warn("[Scanner]", err);
        }
      });
      setReady(true);
    } catch (err) {
      if (err && err.name === "NotAllowedError") {
        setCamErr("CAMERA PERMISSION DENIED. PLEASE ALLOW CAMERA ACCESS IN YOUR BROWSER.");
      } else if (err && err.name === "NotFoundError") {
        setCamErr("NO CAMERA DETECTED ON THIS DEVICE.");
      } else {
        setCamErr("CAMERA ERROR: " + ((err && err.message) || "UNKNOWN").toUpperCase());
      }
    }
  }, [onDetected]);

  useEffect(() => {
    startCamera();
    return () => stopCamera(); // immediate camera release on unmount
  }, [startCamera, stopCamera]);

  if (camErr) {
    return (
      <div style={{ height: "240px", border: "2px solid var(--structure)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem", padding: "1.5rem", textAlign: "center" }}>
        <CameraOff size={28} color="var(--structure)" style={{ opacity: 0.4 }} />
        <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--structure)", opacity: 0.55, lineHeight: 1.8 }}>
          {camErr}
        </p>
        <button className="grit-btn" onClick={startCamera} style={{ height: "2.5rem", padding: "0 1.5rem", background: "transparent", border: "1px solid var(--dim-border)", color: "var(--structure)", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <RotateCcw size={11} /> RETRY
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "240px", background: "#000", overflow: "hidden", border: "2px solid var(--structure)" }}>
      {/* Live camera feed */}
      <video ref={videoRef} muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />

      {/* Scanline overlay */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)" }} />

      {/* Targeting reticle */}
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
        <div style={{ position: "relative", width: "140px", height: "140px" }}>
          <div style={{ position: "absolute", top: 0, left: 0, width: "20px", height: "20px", borderTop: "3px solid var(--pop)", borderLeft: "3px solid var(--pop)" }} />
          <div style={{ position: "absolute", top: 0, right: 0, width: "20px", height: "20px", borderTop: "3px solid var(--pop)", borderRight: "3px solid var(--pop)" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, width: "20px", height: "20px", borderBottom: "3px solid var(--pop)", borderLeft: "3px solid var(--pop)" }} />
          <div style={{ position: "absolute", bottom: 0, right: 0, width: "20px", height: "20px", borderBottom: "3px solid var(--pop)", borderRight: "3px solid var(--pop)" }} />
          {/* Animated sweep line */}
          <div style={{ position: "absolute", left: "4px", right: "4px", height: "2px", background: "var(--pop)", opacity: 0.75, animation: "scan-sweep 1.8s ease-in-out infinite" }} />
        </div>
      </div>

      {/* Status badge */}
      {!ready && (
        <div style={{ position: "absolute", bottom: "0.75rem", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(18,14,11,0.85)", padding: "0.375rem 0.875rem", border: "1px solid var(--dim-border)" }}>
          <span className="spin-grit" style={{ display: "inline-block", width: "10px", height: "10px", border: "1.5px solid var(--dim-border)", borderTopColor: "var(--structure)", borderRadius: "50%" }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.4375rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--structure)", opacity: 0.7 }}>INITIALIZING...</span>
        </div>
      )}
      {ready && (
        <div style={{ position: "absolute", bottom: "0.75rem", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(18,14,11,0.85)", padding: "0.375rem 0.875rem", border: "1px solid var(--pop)" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--pop)" }} />
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.4375rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pop)" }}>SCANNING LIVE</span>
        </div>
      )}

      <style>{"@keyframes scan-sweep { 0% { top: 8px; } 50% { top: calc(100% - 10px); } 100% { top: 8px; } }"}</style>
    </div>
  );
};

// Main ScannerPanel
const ScannerPanel = ({ onClose }) => {
  const [mode,     setMode]     = useState("manual");
  const [token,    setToken]    = useState("");
  const [scanning, setScanning] = useState(false);
  const [result,   setResult]   = useState(null);

  const submitToken = useCallback(async (rawToken) => {
    const t = rawToken && rawToken.trim();
    if (!t || scanning) return;
    setScanning(true);
    setResult(null);
    try {
      const res = await checkInApi.validate(t);
      setResult(res.data);
    } catch (err) {
      const msg = (err && err.response && err.response.data && err.response.data.message) || "CHECK-IN REQUEST FAILED.";
      setResult({ success: false, message: msg.toUpperCase(), attendeeName: null, eventTitle: null });
    } finally {
      setScanning(false);
    }
  }, [scanning]);

  const handleCameraDetect = useCallback((detected) => {
    setToken(detected);
    submitToken(detected);
  }, [submitToken]);

  const handleManualSubmit = (e) => { e.preventDefault(); submitToken(token); };
  const reset = () => { setToken(""); setResult(null); };
  const switchMode = (m) => { setMode(m); reset(); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.1, ease: "linear" }}
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.88)", padding: "1rem" }}
      onClick={onClose}
    >
      <svg aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.06 }}>
        <filter id="sc-grain"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="100%" height="100%" filter="url(#sc-grain)" />
      </svg>

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.12, ease: "linear" }}
        onClick={e => e.stopPropagation()}
        style={{ width: "100%", maxWidth: "500px", background: "var(--anchor)", border: "2px solid var(--structure)", boxShadow: "10px 10px 0px var(--ink)", position: "relative", zIndex: 1, maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* Header */}
        <div style={{ padding: "1.75rem 2rem 1.5rem", borderBottom: "1px solid var(--dim-border)", display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
          <div>
            <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.4375rem", fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--pop)", marginBottom: "0.5rem" }}>
              EVENTSPHERE // QR VALIDATION
            </p>
            <h2 style={{ fontFamily: "'VT323', monospace", fontSize: "2.25rem", textTransform: "uppercase", color: "var(--structure)", letterSpacing: "0.04em", lineHeight: 1 }}>
              CHECK-IN SCANNER
            </h2>
          </div>
          <button id="scanner-close-btn" className="grit-btn" onClick={onClose} aria-label="Close scanner"
            style={{ width: "2.5rem", height: "2.5rem", flexShrink: 0, background: "transparent", border: "1px solid var(--dim-border)", color: "var(--structure)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "var(--shadow-sm)", cursor: "pointer" }}>
            <X size={14} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--dim-border)" }}>
          <ModeTab id="scanner-tab-camera" icon={Camera} label="CAMERA SCAN"   active={mode === "camera"} onClick={() => switchMode("camera")} />
          <ModeTab id="scanner-tab-manual" icon={Type}   label="MANUAL ENTRY"  active={mode === "manual"} onClick={() => switchMode("manual")} />
        </div>

        {/* Body */}
        <div style={{ padding: "1.5rem 2rem 2rem" }}>
          <AnimatePresence mode="wait">

            {/* Camera mode */}
            {mode === "camera" && !result && (
              <motion.div key="cam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.08, ease: "linear" }}>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--structure)", opacity: 0.45, marginBottom: "0.875rem" }}>
                  POINT CAMERA AT ATTENDEE QR CODE — AUTO-VALIDATES ON DETECT
                </p>
                {scanning ? (
                  <div style={{ height: "240px", border: "2px solid var(--pop)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                    <span className="spin-grit" style={{ display: "inline-block", width: "20px", height: "20px", border: "2px solid var(--dim-border)", borderTopColor: "var(--pop)", borderRadius: "50%" }} />
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--pop)" }}>VALIDATING...</p>
                    <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.4375rem", color: "var(--structure)", opacity: 0.5, letterSpacing: "0.06em", maxWidth: "240px", textAlign: "center", wordBreak: "break-all" }}>{token}</p>
                  </div>
                ) : (
                  <CameraScanner onDetected={handleCameraDetect} />
                )}
              </motion.div>
            )}

            {/* Manual mode */}
            {mode === "manual" && !result && (
              <motion.div key="manual" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.08, ease: "linear" }}>
                <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5625rem", letterSpacing: "0.06em", color: "var(--structure)", opacity: 0.5, marginBottom: "1.25rem", textTransform: "uppercase" }}>
                  PASTE OR TYPE THE ATTENDEE QR TOKEN BELOW
                </p>
                <form onSubmit={handleManualSubmit} style={{ display: "flex", gap: "0.75rem" }}>
                  <input
                    value={token} onChange={e => setToken(e.target.value)}
                    placeholder="ES-42-A3F9CC..." autoFocus className="grit-input"
                    style={{ flex: 1, height: "3rem", padding: "0 1rem", fontSize: "0.8125rem", letterSpacing: "0.06em" }}
                  />
                  <button id="scanner-validate-btn" type="submit" className="grit-btn" disabled={scanning || !token.trim()}
                    style={{
                      height: "3rem", padding: "0 1.5rem", flexShrink: 0,
                      background: (scanning || !token.trim()) ? "var(--dim-bg)" : "var(--pop)",
                      border: "2px solid " + ((scanning || !token.trim()) ? "var(--dim-border)" : "var(--pop)"),
                      color: (scanning || !token.trim()) ? "var(--structure)" : "var(--anchor)",
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: "0.5625rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                      cursor: (scanning || !token.trim()) ? "not-allowed" : "pointer",
                      opacity: (scanning || !token.trim()) ? 0.5 : 1,
                      display: "flex", alignItems: "center", gap: "0.5rem",
                    }}
                  >
                    {scanning ? (
                      <><span className="spin-grit" style={{ display: "inline-block", width: "12px", height: "12px", border: "2px solid var(--dim-border)", borderTopColor: "var(--structure)", borderRadius: "50%" }} /> SCANNING</>
                    ) : (
                      <><ScanLine size={12} /> VALIDATE</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Result */}
            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.1, ease: "linear" }}>
                <div style={{ border: "2px solid " + (result.success ? "var(--pop)" : "var(--structure)"), boxShadow: "4px 4px 0px var(--ink)", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.875rem", background: "var(--dim-bg)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {result.success
                      ? <CheckCircle size={20} color="var(--pop)" style={{ flexShrink: 0 }} />
                      : <XCircle size={20} color="var(--structure)" style={{ flexShrink: 0, opacity: 0.6 }} />}
                    <div>
                      <p style={{ fontFamily: "'VT323', monospace", fontSize: "1.5rem", textTransform: "uppercase", color: result.success ? "var(--pop)" : "var(--structure)", lineHeight: 1 }}>
                        {result.success ? "CHECK-IN OK" : "CHECK-IN DENIED"}
                      </p>
                      <p style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5625rem", color: "var(--structure)", opacity: 0.6, letterSpacing: "0.06em", marginTop: "0.25rem", textTransform: "uppercase" }}>
                        {result.message}
                      </p>
                    </div>
                  </div>
                  {result.success && result.attendeeName && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid var(--dim-border)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <User size={11} color="var(--structure)" style={{ opacity: 0.45, flexShrink: 0 }} />
                        <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--structure)", opacity: 0.8 }}>{result.attendeeName}</span>
                      </div>
                      {result.eventTitle && (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <Calendar size={11} color="var(--structure)" style={{ opacity: 0.45, flexShrink: 0 }} />
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--structure)", opacity: 0.8 }}>{result.eventTitle}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <button className="grit-btn" onClick={reset}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%", height: "2.5rem", background: "transparent", border: "1px solid var(--dim-border)", color: "var(--structure)", cursor: "pointer", fontFamily: "'IBM Plex Mono', monospace", fontSize: "0.5rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", boxShadow: "var(--shadow-sm)" }}>
                    <RotateCcw size={11} /> SCAN ANOTHER
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ScannerPanel;
