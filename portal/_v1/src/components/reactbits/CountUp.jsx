import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * React Bits - CountUp Component
 * Smooth numeric counter animation with customizable duration.
 */
export default function CountUp({
  to = 0,
  from = 0,
  duration = 1.2,
  className = '',
  suffix = '',
  prefix = ''
}) {
  const [count, setCount] = useState(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let start = from;
    const end = to;
    const startTime = performance.now();

    const updateCount = (now) => {
      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * easeProgress);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isInView, to, from, duration]);

  return (
    <span ref={ref} className={`font-mono ${className}`}>
      {prefix}{count}{suffix}
    </span>
  );
}

