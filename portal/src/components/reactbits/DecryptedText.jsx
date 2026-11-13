import React, { useEffect, useState } from 'react';

const DEFAULT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

/**
 * DecryptedText - React Bits inspired cyber text unscrambler.
 * Text scrambles through glyphs before locking into the target string.
 */
export default function DecryptedText({
  text,
  speed = 40,
  maxIterations = 12,
  characters = DEFAULT_CHARS,
  className = '',
  parentClassName = '',
  animateOn = 'mount', // 'mount' or 'hover'
  sequential = true,
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let intervalId;
    let iteration = 0;

    const runDecryption = () => {
      intervalId = setInterval(() => {
        setDisplayText(() =>
          text
            .split('')
            .map((char, index) => {
              if (char === ' ') return ' ';
              if (sequential) {
                if (index < iteration / (maxIterations / text.length)) {
                  return text[index];
                }
              } else {
                if (iteration >= maxIterations) {
                  return text[index];
                }
              }
              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join('')
        );

        iteration++;
        if (iteration > (sequential ? maxIterations * 1.5 : maxIterations)) {
          clearInterval(intervalId);
          setDisplayText(text);
        }
      }, speed);
    };

    if (animateOn === 'mount' || (animateOn === 'hover' && isHovered)) {
      runDecryption();
    } else {
      setDisplayText(text);
    }

    return () => clearInterval(intervalId);
  }, [text, speed, maxIterations, characters, animateOn, isHovered, sequential]);

  return (
    <span
      className={`inline-block font-mono ${parentClassName}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className={className}>{displayText}</span>
    </span>
  );
}

