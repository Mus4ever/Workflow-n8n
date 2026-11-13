import React from 'react';

/**
 * ShinyButton - React Bits styled shimmering CTA button.
 */
export default function ShinyButton({
  children,
  onClick,
  disabled = false,
  className = '',
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  type = 'button',
}) {
  const baseStyles =
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50';

  const variants = {
    primary:
      'bg-gradient-to-r from-blue via-[#3A5DFF] to-blue text-white shadow-md shadow-blue/25 hover:shadow-lg hover:shadow-blue/40',
    secondary:
      'border-2 border-line bg-card/90 text-ink backdrop-blur-sm hover:border-ink hover:bg-card',
    danger:
      'bg-gradient-to-r from-red via-[#E01C3E] to-red text-white shadow-md shadow-red/25 hover:shadow-lg hover:shadow-red/40',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant] || variants.primary} min-h-[3.25rem] px-6 text-base ${className}`}
    >
      {/* Animated shimmer sweep */}
      <span
        className="pointer-events-none absolute -inset-full top-0 block -skew-x-12 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-all duration-1000 group-hover:left-full group-hover:opacity-100"
        aria-hidden="true"
      />
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

