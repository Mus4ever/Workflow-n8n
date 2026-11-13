import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * React Bits - BlurText Component
 * Words or characters fade in smoothly from a blurred state.
 */
export default function BlurText({
  text = '',
  delay = 50,
  className = '',
  animateBy = 'words', // 'words' | 'letters'
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {elements.map((el, i) => (
        <motion.span
          key={i}
          initial={{ filter: 'blur(10px)', opacity: 0, y: 10 }}
          animate={isInView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
          transition={{
            duration: 0.6,
            delay: (i * delay) / 1000,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="inline-block"
          style={{ marginRight: animateBy === 'words' ? '0.28em' : '0' }}
        >
          {el}
        </motion.span>
      ))}
    </span>
  );
}

