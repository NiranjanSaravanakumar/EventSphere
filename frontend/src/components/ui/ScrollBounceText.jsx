/**
 * ScrollBounceText.jsx
 *
 * A reusable Framer Motion component that applies a subtle elastic distortion
 * (skewY + translateY) to its children based on the real-time scroll velocity
 * of the page (window scroll, no external ref needed).
 *
 * ── How the velocity → transform pipeline works ──────────────────────────────
 *
 *  useScroll()           → scrollY  (MotionValue<number>, raw px from top)
 *       ↓
 *  useVelocity(scrollY)  → scrollVelocity  (px/s — positive = scrolling down,
 *                                            negative = scrolling up)
 *       ↓
 *  useSpring(scrollVelocity, { stiffness, damping })
 *                        → smoothVelocity  (spring-smoothed, removes jitter,
 *                                           lags slightly for a "bouncy" feel)
 *       ↓
 *  useTransform(smoothVelocity, inputRange, outputRange)
 *                        → skewY (deg)    hard-clamped visual effect
 *                        → translateY (px) optional secondary motion
 *
 *  The inputRange caps the raw velocity so extreme fast-scrolls don't produce
 *  absurd distortions — anything past ±1000 px/s is treated as ±1000.
 *  Adjust `intensity` prop (0–2 is a good range) to scale the effect globally.
 *
 * ── Tuning knobs ─────────────────────────────────────────────────────────────
 *  stiffness   higher → snaps back faster to 0 when scrolling stops
 *  damping     higher → less oscillation on snap-back
 *  inputRange  velocity window before clamping (±1000 px/s is a good default)
 *  outputRange peak skewY (deg) and translateY (px) at max velocity
 *  intensity   prop multiplier — scales both transforms linearly
 *
 * ── Perf note ────────────────────────────────────────────────────────────────
 *  All transforms are MotionValues → Framer Motion applies them via a direct
 *  style mutation, never triggering a React re-render. No useState / useEffect.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * @param {object}          props
 * @param {React.ReactNode} props.children     Content to distort
 * @param {number}          [props.intensity=1] Multiplier for effect strength (0 = off, 2 = double)
 * @param {string}          [props.className]   Extra CSS class names
 * @param {'span'|'div'}    [props.as='div']    Rendered element tag — use 'span' for inline text
 * @param {number}          [props.stiffness=350] Spring stiffness (higher = snappier)
 * @param {number}          [props.damping=35]    Spring damping (higher = less bounce)
 * @param {number}          [props.maxSkewDeg=3]  Max skewY distortion in degrees
 * @param {number}          [props.maxTranslateY=6] Max vertical nudge in pixels
 */

import { useScroll, useVelocity, useSpring, useTransform, motion } from 'framer-motion';

const ScrollBounceText = ({
  children,
  intensity = 1,
  className = '',
  as = 'div',
  stiffness = 350,
  damping = 35,
  maxSkewDeg = 3,
  maxTranslateY = 6,
}) => {
  // ── 1. Get raw page scroll position ──────────────────────────────────────
  const { scrollY } = useScroll();

  // ── 2. Derive velocity from scrollY (px/s) ───────────────────────────────
  const scrollVelocity = useVelocity(scrollY);

  // ── 3. Spring-smooth the velocity for elastic/bouncy feel ────────────────
  //       stiffness ~300-400 + damping ~30-40 gives a natural springy lag
  const smoothVelocity = useSpring(scrollVelocity, {
    stiffness,
    damping,
  });

  // ── 4. Map smoothed velocity → skewY (degrees) ───────────────────────────
  //       Input range ±1000 px/s → output ±maxSkewDeg × intensity
  //       useTransform hard-clamps outside the input range automatically.
  const skewY = useTransform(
    smoothVelocity,
    [-1000, 0, 1000],                           // velocity input (px/s)
    [-maxSkewDeg * intensity, 0, maxSkewDeg * intensity], // skewY output (deg)
  );

  // ── 5. Map smoothed velocity → translateY (pixels) ───────────────────────
  //       Scrolling down nudges text slightly down, up nudges it up.
  //       Kept very subtle — it complements skewY rather than dominating.
  const translateY = useTransform(
    smoothVelocity,
    [-1000, 0, 1000],
    [-maxTranslateY * intensity, 0, maxTranslateY * intensity],
  );

  // ── 6. Render as motion.div (block) or motion.span (inline) ──────────────
  const MotionTag = as === 'span' ? motion.span : motion.div;

  return (
    <MotionTag
      style={{
        skewY,
        y: translateY,
        display: as === 'span' ? 'inline-block' : 'block',
        // inline-block on span is required — transforms don't apply to
        // plain inline elements in CSS / Framer Motion
        willChange: 'transform', // hints compositor to GPU-promote this layer
        transformOrigin: 'center center',
      }}
      className={className}
    >
      {children}
    </MotionTag>
  );
};

export default ScrollBounceText;
