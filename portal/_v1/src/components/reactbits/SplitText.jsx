import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * React Bits - SplitText Component
 * Splits text into words or characters with staggered entrance physics.
 */
export default function SplitText({
  text = '',
  className = '',
  delay = 35,
  duration = 0.6,
  splitType = 'words', // 'words' | 'chars'
  onLetterAnimationComplete
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-30px' });

  if (!text) return null;

  const items = splitType === 'chars' ? text.split('') : text.split(' ');

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {items.map((item, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
          animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
          transition={{
            duration,
            delay: (index * delay) / 1000,
            ease: [0.22, 1, 0.36, 1],
          }}
          onAnimationComplete={index === items.length - 1 ? onLetterAnimationComplete : undefined}
          className="inline-block"
          style={{ marginRight: splitType === 'words' ? '0.28em' : '0' }}
        >
          {item}
        </motion.span>
      ))}
    </span>
  );
}

