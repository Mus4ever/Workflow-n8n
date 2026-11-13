import React, { useRef, useEffect } from 'react';

/**
 * React Bits - Particles Background Component
 * Ambient interactive canvas particles that drift and connect subtly.
 */
export default function ParticlesBackground({
  quantity = 35,
  staticity = 40,
  ease = 50,
  color = '#EF4444',
  className = '',
}) {
  const canvasRef = useRef(null);
  const context = useRef(null);
  const circles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });
  const canvasSize = useRef({ w: 0, h: 0 });
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  useEffect(() => {
    if (!canvasRef.current) return;
    context.current = canvasRef.current.getContext('2d');

    const initCanvas = () => {
      if (!canvasRef.current || !context.current) return;
      canvasSize.current.w = canvasRef.current.parentElement?.clientWidth || window.innerWidth;
      canvasSize.current.h = canvasRef.current.parentElement?.clientHeight || window.innerHeight;
      canvasRef.current.width = canvasSize.current.w * dpr;
      canvasRef.current.height = canvasSize.current.h * dpr;
      canvasRef.current.style.width = `${canvasSize.current.w}px`;
      canvasRef.current.style.height = `${canvasSize.current.h}px`;
      context.current.scale(dpr, dpr);

      // Initialize particles
      circles.current = [];
      for (let i = 0; i < quantity; i++) {
        circles.current.push({
          x: Math.random() * canvasSize.current.w,
          y: Math.random() * canvasSize.current.h,
          translateX: 0,
          translateY: 0,
          size: Math.random() * 1.8 + 0.8,
          alpha: 0,
          targetAlpha: parseFloat((Math.random() * 0.4 + 0.1).toFixed(2)),
          dx: (Math.random() - 0.5) * 0.4,
          dy: (Math.random() - 0.5) * 0.4,
          magnetism: 0.1 + Math.random() * 3,
        });
      }
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);

    let animationFrameId;

    const render = () => {
      if (!context.current) return;
      context.current.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h);

      circles.current.forEach((circle, i) => {
        // Draw particle
        context.current.beginPath();
        context.current.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
        context.current.fillStyle = color;
        context.current.globalAlpha = circle.alpha;
        context.current.fill();

        // Fade in
        if (circle.alpha < circle.targetAlpha) {
          circle.alpha += 0.01;
        }

        // Move
        circle.x += circle.dx;
        circle.y += circle.dy;

        // Wrap edges
        if (circle.x < 0) circle.x = canvasSize.current.w;
        if (circle.x > canvasSize.current.w) circle.x = 0;
        if (circle.y < 0) circle.y = canvasSize.current.h;
        if (circle.y > canvasSize.current.h) circle.y = 0;

        // Connect nearby particles
        for (let j = i + 1; j < circles.current.length; j++) {
          const c2 = circles.current[j];
          const dist = Math.hypot(circle.x - c2.x, circle.y - c2.y);
          if (dist < 80) {
            context.current.beginPath();
            context.current.moveTo(circle.x, circle.y);
            context.current.lineTo(c2.x, c2.y);
            context.current.strokeStyle = color;
            context.current.globalAlpha = (1 - dist / 80) * 0.12;
            context.current.lineWidth = 0.6;
            context.current.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', initCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [quantity, color, dpr]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}

