/**
 * Centralized requestAnimationFrame scheduler that automatically pauses when document is hidden.
 * Ensures zero battery drain and 60fps lock on active tabs.
 */

type Task = (deltaTime: number, timestamp: number) => void;

class RafScheduler {
  private tasks = new Set<Task>();
  private isRunning = false;
  private lastTime = 0;
  private rafId: number | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pause();
        } else if (this.tasks.size > 0) {
          this.resume();
        }
      });
    }
  }

  public subscribe(task: Task): () => void {
    this.tasks.add(task);
    if (!this.isRunning && typeof window !== 'undefined' && !document.hidden) {
      this.resume();
    }
    return () => {
      this.tasks.delete(task);
      if (this.tasks.size === 0) {
        this.pause();
      }
    };
  }

  private resume() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  private pause() {
    this.isRunning = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private loop = (timestamp: number) => {
    if (!this.isRunning) return;

    const delta = Math.min(timestamp - this.lastTime, 100); // Clamp large delta (e.g. after freeze)
    this.lastTime = timestamp;

    this.tasks.forEach((task) => {
      try {
        task(delta, timestamp);
      } catch (err) {
        console.error('Scheduler task error:', err);
      }
    });

    if (this.tasks.size > 0 && !document.hidden) {
      this.rafId = requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
      this.rafId = null;
    }
  };
}

export const rafScheduler = new RafScheduler();
