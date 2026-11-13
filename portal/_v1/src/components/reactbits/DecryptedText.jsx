import React, { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

/**
 * React Bits - DecryptedText Component
 * Cyberpunk / hacker text decryption scrambler effect.
 */
export default function DecryptedText({
  text = '',
  speed = 40,
  maxIterations = 12,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~|}{[]',
  className = '',
  animateOn = 'hover', // 'view' | 'hover' | 'both'
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  const triggerAnimation = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(
        text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join('')
      );

      iteration += 1 / 2;

      if (iteration >= text.length) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);
  };

  useEffect(() => {
    if ((animateOn === 'view' || animateOn === 'both') && isInView && !hasAnimated) {
      setHasAnimated(true);
      triggerAnimation();
    }
  }, [isInView, animateOn, hasAnimated]);

  const handleMouseEnter = () => {
    if (animateOn === 'hover' || animateOn === 'both') {
      setIsHovering(true);
      triggerAnimation();
    }
  };

  return (
    <span
      ref={ref}
      onMouseEnter={handleMouseEnter}
      className={`inline-block font-mono cursor-default ${className}`}
    >
      {displayText}
    </span>
  );
}

