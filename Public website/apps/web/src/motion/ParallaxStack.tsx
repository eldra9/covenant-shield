import React, { useRef, useEffect, useState } from 'react';
import { GuillocheSeal } from './GuillocheSeal.tsx';
import { rafScheduler } from './scheduler.ts';
import { Shield, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export const ParallaxStack: React.FC<{ isVisible?: boolean }> = ({ isVisible = true }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const targetPointer = useRef({ x: 0, y: 0 });
  const currentPointer = useRef({ x: 0, y: 0 });

  const [offsets, setOffsets] = useState({
    far: { x: 0, y: 0 },
    mid: { x: 0, y: 0 },
    near: { x: 0, y: 0 },
  });

  useEffect(() => {
    const isFine = window.matchMedia('(pointer: fine)').matches;
    const fx = document.documentElement.getAttribute('data-fx');
    if (!isFine || fx === 'off') return;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize pointer between -1 and 1 around window center
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      targetPointer.current.x = nx;
      targetPointer.current.y = ny;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const unregister = rafScheduler.register((deltaMs) => {
      if (!isVisible) return;

      const alpha = 1 - Math.exp(-deltaMs / 120); // 1-e^(-dt/120ms)
      currentPointer.current.x += (targetPointer.current.x - currentPointer.current.x) * alpha;
      currentPointer.current.y += (targetPointer.current.y - currentPointer.current.y) * alpha;

      const scrollY = window.scrollY || 0;

      // Layer 1 (Far Seal): 0.2 scroll, 6px pointer
      const farY = scrollY * 0.2 + currentPointer.current.y * 6;
      const farX = currentPointer.current.x * 6;

      // Layer 2 (Mid Shield): 0.5 scroll, 14px pointer
      const midY = scrollY * 0.5 + currentPointer.current.y * 14;
      const midX = currentPointer.current.x * 14;

      // Layer 3 (Near Ticket): 0.9 scroll, 28px pointer
      const nearY = scrollY * 0.9 + currentPointer.current.y * 28;
      const nearX = currentPointer.current.x * 28;

      setOffsets({
        far: { x: farX, y: farY },
        mid: { x: midX, y: midY },
        near: { x: nearX, y: nearY },
      });
    });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      unregister();
    };
  }, [isVisible]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[560px] overflow-visible select-none pointer-events-none"
      aria-hidden="true"
    >
      {/* 1. Far Layer: Huge Guilloche Seal (720px, cropped by right edge) */}
      <div
        className="absolute -top-10 -right-24 md:-right-32 opacity-25 will-change-transform"
        style={{
          transform: `translate3d(${offsets.far.x.toFixed(1)}px, ${offsets.far.y.toFixed(1)}px, 0)`,
        }}
      >
        <GuillocheSeal size={720} variant="gold" strokeColor="#C9A04A" />
      </div>

      {/* 2. Mid Layer: Shield outline in 1.5px foil that draws on */}
      <div
        className="absolute top-12 right-12 md:right-24 w-80 h-96 opacity-60 will-change-transform"
        style={{
          transform: `translate3d(${offsets.mid.x.toFixed(1)}px, ${offsets.mid.y.toFixed(1)}px, 0)`,
        }}
      >
        <svg
          viewBox="0 0 100 120"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 4 L92 20 V62 C92 90 50 114 50 114 C50 114 8 90 8 62 V20 L50 4 Z"
            stroke="url(#midFoilGrad)"
            strokeWidth="1.5"
            strokeDasharray="400"
            className="animate-[drawStroke_1.8s_var(--e-draw)_forwards]"
          />
          <defs>
            <linearGradient id="midFoilGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#A47F2E" />
              <stop offset="35%" stopColor="#C9A04A" />
              <stop offset="50%" stopColor="#E6CB8A" />
              <stop offset="65%" stopColor="#C9A04A" />
              <stop offset="100%" stopColor="#A47F2E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 3. Near Layer: Dispatch Ticket rotated 3deg tagged "Illustrative example" */}
      <div
        className="absolute top-28 rounded-xl bg-[#0D322D] border border-[#C9A04A]/30 p-5 shadow-2xl backdrop-blur-md will-change-transform"
        style={{
          right: 'clamp(0.5rem, 2vw, 1.5rem)',
          width: 'min(22rem, calc(100vw - 3rem))',
          maxWidth: 'calc(100% - 1rem)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -1px 0 rgba(0,0,0,0.25), 0 20px 40px rgba(0,20,16,0.6)',
          transform: `translate3d(${offsets.near.x.toFixed(1)}px, ${offsets.near.y.toFixed(1)}px, 0) rotate(3deg)`,
          transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Ticket Header */}
        <div className="flex items-center justify-between border-b border-[#C9A04A]/20 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#C9A04A]" />
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              SR-2026-00123
            </span>
          </div>
          <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-[#C9A04A]/10 text-[#C9A04A] border border-[#C9A04A]/30">
            Illustrative example
          </span>
        </div>

        {/* Ticket Body */}
        <div className="space-y-3">
          <div>
            <div className="text-white font-serif text-sm font-semibold tracking-wide">
              Static Guarding · Night Coverage
            </div>
            <div className="text-xs text-[#52625D] text-white/70 flex items-center gap-2 mt-0.5">
              <span>Pier 42 Maritime Terminal</span>
              <span>·</span>
              <span className="text-[#C9A04A]">4 Sentries</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-white/80">
              <Clock className="w-3.5 h-3.5 text-[#C9A04A]" />
              <span>Rostered: 20:00 - 08:00</span>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#1D4E89]/40 text-[#E8F0FA] border border-[#1D4E89]/60">
              Quotation sent
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-white/60">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A04A]" />
            <span>SOP verified · Supervisory post check 02:00</span>
          </div>
        </div>
      </div>
    </div>
  );
};
