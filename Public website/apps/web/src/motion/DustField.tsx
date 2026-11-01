import React, { useEffect, useRef } from 'react';
import { rafScheduler } from './scheduler.ts';

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  speed: number;
  swaySpeed: number;
  swayOffset: number;
}

export const DustField: React.FC<{ isVisible?: boolean; className?: string }> = ({
  isVisible = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    // Only run on full tier
    if (typeof document !== 'undefined') {
      const tier = document.documentElement.getAttribute('data-fx');
      if (tier !== 'full') return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Pre-allocate 36 particles (zero allocation in loop)
    const particleCount = 36;
    const particles: Particle[] = new Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      particles[i] = {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.6 + Math.random() * 1.0, // 0.6 - 1.6px
        alpha: 0.15 + Math.random() * 0.35, // 0.15 - 0.5
        speed: 4 + Math.random() * 6, // 4 - 10px/s
        swaySpeed: 0.5 + Math.random() * 1.5,
        swayOffset: Math.random() * Math.PI * 2,
      };
    }

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth;
      height = canvas.parentElement.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    let totalTime = 0;
    const unregister = rafScheduler.register((deltaMs) => {
      if (!isVisible) return;

      const dt = deltaMs / 1000;
      totalTime += dt;

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Rise
        p.y -= p.speed * dt;
        // Sine sway
        const sway = Math.sin(totalTime * p.swaySpeed + p.swayOffset) * 0.4;
        p.x += sway;

        // Wrap around
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 160, 74, ${p.alpha})`;
        ctx.fill();
      }
    });

    return () => {
      unregister();
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none select-none ${className}`}
      aria-hidden="true"
    />
  );
};
