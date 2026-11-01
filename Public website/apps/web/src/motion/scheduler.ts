/**
 * Centralized RequestAnimationFrame scheduler for Covenant Shield.
 * Pauses automatically when document.hidden to save CPU & battery.
 */

type FrameCallback = (deltaMs: number, timestamp: number) => void;

class RafScheduler {
  private callbacks = new Set<FrameCallback>();
  private rafId: number | null = null;
  private lastTime = 0;
  private isPaused = false;

  constructor() {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else {
          this.resume();
        }
      });
    }
  }

  public register(callback: FrameCallback): () => void {
    this.callbacks.add(callback);
    if (this.callbacks.size === 1 && !this.isPaused) {
      this.start();
    }
    return () => {
      this.callbacks.delete(callback);
      if (this.callbacks.size === 0) {
        this.stop();
      }
    };
  }

  private loop = (timestamp: number) => {
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
    }
    const deltaMs = Math.min(timestamp - this.lastTime, 100); // clamp for tab wakeups
    this.lastTime = timestamp;

    for (const cb of this.callbacks) {
      cb(deltaMs, timestamp);
    }

    if (this.callbacks.size > 0 && !this.isPaused) {
      this.rafId = requestAnimationFrame(this.loop);
    }
  };

  private start() {
    this.lastTime = 0;
    this.rafId = requestAnimationFrame(this.loop);
  }

  private stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.lastTime = 0;
  }

  private pause() {
    this.isPaused = true;
    this.stop();
  }

  private resume() {
    if (this.isPaused) {
      this.isPaused = false;
      if (this.callbacks.size > 0) {
        this.start();
      }
    }
  }
}

export const rafScheduler = new RafScheduler();
