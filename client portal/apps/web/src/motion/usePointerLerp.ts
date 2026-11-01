/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * usePointerLerp hook:
 * Smoothly interpolates pointer position with exponential decay (eased: 1 - e^(-dt / 120ms)).
 * Computes 3D tilt rotation (max 4deg) and specular sheen coordinates.
 * Respects effects tiers:
 * - 'off': returns zero tilt, static position
 * - 'lite': returns zero tilt, hover flag only
 * - 'full': computes 3D perspective tilt and sheen coordinates
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { rafScheduler } from './rafScheduler';

interface PointerLerpState {
  rotateX: number;
  rotateY: number;
  sheenX: number;
  sheenY: number;
  isHovered: boolean;
}

export function usePointerLerp<T extends HTMLElement = HTMLDivElement>() {
  const containerRef = useRef<T | null>(null);
  const targetX = useRef(0);
  const targetY = useRef(0);
  const currentX = useRef(0);
  const currentY = useRef(0);
  const isHovering = useRef(false);

  const [state, setState] = useState<PointerLerpState>({
    rotateX: 0,
    rotateY: 0,
    sheenX: 50,
    sheenY: 50,
    isHovered: false,
  });

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0..1
    const y = (e.clientY - rect.top) / rect.height; // 0..1

    // Center normalized (-1 .. 1)
    targetX.current = (x - 0.5) * 2;
    targetY.current = (y - 0.5) * 2;
  }, []);

  const onPointerEnter = useCallback(() => {
    isHovering.current = true;
    setState(s => ({ ...s, isHovered: true }));
  }, []);

  const onPointerLeave = useCallback(() => {
    isHovering.current = false;
    targetX.current = 0;
    targetY.current = 0;
    setState(s => ({ ...s, isHovered: false }));
  }, []);

  useEffect(() => {
    const fx = typeof document !== 'undefined' ? document.documentElement.getAttribute('data-fx') : 'full';
    if (fx === 'off' || fx === 'lite') {
      return;
    }

    const unsubscribe = rafScheduler.subscribe((dt) => {
      // 1 - e^(-dt / 120ms)
      const alpha = 1 - Math.exp(-dt / 120);

      currentX.current += (targetX.current - currentX.current) * alpha;
      currentY.current += (targetY.current - currentY.current) * alpha;

      // Max 4 degrees tilt
      const rotY = currentX.current * 4;
      const rotX = -currentY.current * 4;
      const sheenX = ((currentX.current + 1) / 2) * 100;
      const sheenY = ((currentY.current + 1) / 2) * 100;

      setState(prev => {
        if (
          Math.abs(prev.rotateX - rotX) < 0.01 &&
          Math.abs(prev.rotateY - rotY) < 0.01 &&
          !isHovering.current &&
          Math.abs(rotX) < 0.01 &&
          Math.abs(rotY) < 0.01
        ) {
          return prev;
        }
        return {
          rotateX: parseFloat(rotX.toFixed(2)),
          rotateY: parseFloat(rotY.toFixed(2)),
          sheenX: parseFloat(sheenX.toFixed(1)),
          sheenY: parseFloat(sheenY.toFixed(1)),
          isHovered: isHovering.current,
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    ref: containerRef,
    state,
    handlers: {
      onPointerMove,
      onPointerEnter,
      onPointerLeave,
    },
  };
}
