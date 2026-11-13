import confetti from 'canvas-confetti';

/**
 * Trigger celebration confetti explosion when a participant proves a mission rule.
 */
export function fireCelebration() {
  confetti({
    particleCount: 65,
    spread: 60,
    origin: { y: 0.7 },
    colors: ['#2B4BFF', '#12805C', '#A85F00', '#38BDF8', '#F59E0B'],
    disableForReducedMotion: true,
  });
}

