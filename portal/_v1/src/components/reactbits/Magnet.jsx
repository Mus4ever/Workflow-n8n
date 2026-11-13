import React, { useRef } from 'react';
import { motion, useSpring } from 'framer-motion';

/**
 * React Bits - Magnet Component
 * Attracts elements towards the cursor with organic spring physics.
 */
export default function Magnet({
  children,
  className = '',
  strength = 0.3,
  ...props
}) {
  const ref = useRef(null);

  const springConfig = { damping: 15, stiffness: 150 };
  const x = useSpring(0, springConfig);
  const y = useSpring(0, springConfig);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    const deltaX = (clientX - centerX) * strength;
    const deltaY = (clientY - centerY) * strength;

    x.set(deltaX);
    y.set(deltaY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x, y }}
      className={`inline-block ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

