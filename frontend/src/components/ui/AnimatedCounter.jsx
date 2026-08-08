import React, { useEffect, useState } from 'react';
import { useSpring } from 'framer-motion';

/**
 * AnimatedCounter — springs from 0 to `value` on mount/update.
 * Uses Framer Motion's useSpring for fluid easing (not a linear tween).
 */
const AnimatedCounter = ({ value, suffix = '', decimals = 0 }) => {
  const springValue = useSpring(0, { stiffness: 55, damping: 22, restDelta: 0.01 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    springValue.set(value);
  }, [value, springValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      setDisplay(
        decimals > 0
          ? parseFloat(latest.toFixed(decimals))
          : Math.round(latest)
      );
    });
  }, [springValue, decimals]);

  return (
    <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>
      {decimals > 0
        ? display.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : display.toLocaleString()}
      {suffix}
    </span>
  );
};

export default AnimatedCounter;
