import React, { useEffect, useRef } from 'react';

/**
 * DynamicBackground - React Bits inspired interactive particle & glowing grid background.
 * Lightweight, GPU-accelerated via Canvas + CSS gradients.
 */
export default function DynamicBackground({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Subtle floating nodes that simulate workflow steps / connections
    const nodeCount = Math.min(Math.floor((width * height) / 28000), 45);
    const nodes = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.2,
      pulse: Math.random() * Math.PI,
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let t = 0;
    const render = () => {
      t += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Connect nodes that are close to each other (like workflow pipelines)
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        a.pulse += 0.03;

        // Wrap around edges
        if (a.x < -10) a.x = width + 10;
        if (a.x > width + 10) a.x = -10;
        if (a.y < -10) a.y = height + 10;
        if (a.y > height + 10) a.y = -10;

        // Draw connections
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 110 * 110) {
            const alpha = (1 - Math.sqrt(distSq) / 110) * 0.16;
            ctx.strokeStyle = `rgba(43, 75, 255, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Mouse gravity / glow
        const mdx = mouseX - a.x;
        const mdy = mouseY - a.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        const nearMouse = mDist < 160;

        // Draw node
        const r = a.radius + Math.sin(a.pulse) * 0.5;
        ctx.beginPath();
        ctx.arc(a.x, a.y, nearMouse ? r * 1.6 : r, 0, Math.PI * 2);
        ctx.fillStyle = nearMouse
          ? 'rgba(43, 75, 255, 0.75)'
          : 'rgba(18, 128, 92, 0.45)';
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`} aria-hidden="true">
      {/* Aurora glow orbs */}
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-gradient-to-br from-blue/20 via-cyan-400/15 to-transparent blur-3xl" />
      <div className="absolute top-1/3 -right-40 h-[520px] w-[520px] rounded-full bg-gradient-to-bl from-green/15 via-emerald-400/10 to-transparent blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 h-[440px] w-[440px] rounded-full bg-gradient-to-t from-blue/15 via-indigo-500/10 to-transparent blur-3xl" />

      {/* Cyber grid lines */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #101B33 1px, transparent 1px),
            linear-gradient(to bottom, #101B33 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      {/* Canvas for animated workflow nodes & edges */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

