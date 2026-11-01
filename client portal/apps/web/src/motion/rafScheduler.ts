/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Centralized requestAnimationFrame scheduler that automatically pauses when document.hidden.
 * Ensures smooth frame management without third-party animation libraries.
 */

type FrameCallback = (deltaTime: number, timestamp: number) => void;

class RafScheduler {
  private callbacks: Set<FrameCallback> = new Set();
  private rafId: number | null = null;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
    }
  }

  private handleVisibilityChange = () => {
    if (document.hidden) {
      this.pause();
    } else {
      this.resume();
    }
  };

  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    if (!this.lastTime) this.lastTime = timestamp;
    const dt = Math.min(timestamp - this.lastTime, 100); // clamp delta to 100ms
    this.lastTime = timestamp;

    this.callbacks.forEach((cb) => {
      try {
        cb(dt, timestamp);
      } catch (err) {
        console.error('RafScheduler callback error:', err);
      }
    });

    if (this.callbacks.size > 0 && !document.hidden) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
      this.rafId = null;
    }
  };

  public subscribe(cb: FrameCallback): () => void {
    this.callbacks.add(cb);
    if (!this.isRunning && !document.hidden && typeof window !== 'undefined') {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.loop);
    }

    return () => {
      this.callbacks.delete(cb);
      if (this.callbacks.size === 0 && this.rafId !== null) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
        this.isRunning = false;
      }
    };
  }

  public pause() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
    this.lastTime = 0;
  }

  public resume() {
    if (this.callbacks.size > 0 && !this.isRunning && !document.hidden) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.rafId = requestAnimationFrame(this.loop);
    }
  }
}

export const rafScheduler = new RafScheduler();
