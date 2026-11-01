import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'danger' | 'info' | 'warning';
  title: string;
  message?: string;
  onUndo?: () => void;
  undoDurationMs?: number;
  shake?: boolean;
}

type ToastListener = (toast: ToastMessage) => void;
const toastListeners = new Set<ToastListener>();

export const showToast = (toast: Omit<ToastMessage, 'id'>) => {
  const fullToast: ToastMessage = {
    ...toast,
    id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  };
  toastListeners.forEach((l) => l(fullToast));
};

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener: ToastListener = (t) => {
      setToasts((prev) => [...prev, t]);

      // Auto dismiss
      const duration = t.onUndo ? t.undoDurationMs || 6000 : 4000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((item) => item.id !== t.id));
      }, duration);
    };

    toastListeners.add(listener);
    return () => {
      toastListeners.delete(listener);
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => {
        const isDanger = toast.type === 'danger';
        const isSuccess = toast.type === 'success';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border shadow-xl flex items-start justify-between gap-3 bg-[#0D322D] text-[#F4F6F4] transform transition-all duration-200 ease-[var(--e-lux)] ${
              toast.shake ? 'shake-reject border-[#A12B2B]' : 'border-[#C9A04A]/30'
            } emboss-card`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              {isSuccess && <CheckCircle2 className="w-4 h-4 text-[#1E6B45] shrink-0 mt-0.5" />}
              {isDanger && <AlertCircle className="w-4 h-4 text-[#A12B2B] shrink-0 mt-0.5" />}
              {!isSuccess && !isDanger && <Info className="w-4 h-4 text-[#C9A04A] shrink-0 mt-0.5" />}

              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-semibold leading-tight">{toast.title}</div>
                {toast.message && (
                  <div className="text-[11px] text-[#A0B2AC] leading-snug">{toast.message}</div>
                )}
                {toast.onUndo && (
                  <button
                    onClick={() => {
                      toast.onUndo?.();
                      removeToast(toast.id);
                    }}
                    className="inline-flex items-center gap-1 text-[11px] font-mono text-[#C9A04A] hover:underline pt-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Undo Action</span>
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-[#52625D] hover:text-[#F4F6F4] rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
