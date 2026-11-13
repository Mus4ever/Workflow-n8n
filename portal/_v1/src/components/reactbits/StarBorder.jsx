import React from 'react';

/**
 * React Bits - StarBorder Component
 * Luminous animated laser-beam border effect circling around buttons/containers.
 */
export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#EF4444',
  speed = '3.5s',
  children,
  ...props
}) {
  return (
    <Component
      className={`relative inline-block overflow-hidden rounded-xl p-[1px] ${className}`}
      {...props}
    >
      {/* Animated rotating beam */}
      <span
        className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite]"
        style={{
          background: `conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 70%, ${color} 100%)`,
          animationDuration: speed,
        }}
      />
      {/* Content holder */}
      <div className="relative z-10 w-full h-full rounded-[11px] bg-zinc-950 px-4 py-2.5 flex items-center justify-center gap-2">
        {children}
      </div>
    </Component>
  );
}

