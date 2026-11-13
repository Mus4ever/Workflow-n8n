import React from 'react';

/**
 * React Bits - ShinyText Component
 * Metallic light-sweep shimmer effect across text.
 */
export default function ShinyText({
  text = '',
  disabled = false,
  speed = 3,
  className = '',
  children
}) {
  const content = text || children;

  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#94a3b8,35%,#ffffff,50%,#94a3b8,65%)] bg-[length:200%_100%] ${className}`}
      style={{
        animation: disabled ? 'none' : `shineSweep ${speed}s ease-in-out infinite`,
      }}
    >
      {content}
    </span>
  );
}

