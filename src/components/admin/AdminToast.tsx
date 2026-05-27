"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  undoAction?: () => void;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, opts?: { undoAction?: () => void; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);
export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

function ToastItem({ toast: t, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const duration = t.duration || 4000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) { clearInterval(interval); dismiss(); }
    }, 50);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const dismiss = () => {
    setExiting(true);
    setTimeout(() => onDismiss(t.id), 250);
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />,
    error: <XCircle size={16} className="text-red-400 shrink-0" />,
    warning: <AlertTriangle size={16} className="text-amber-400 shrink-0" />,
    info: <Info size={16} className="text-[#C77DFF] shrink-0" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: "border-l-emerald-400", error: "border-l-red-400",
    warning: "border-l-amber-400", info: "border-l-[#C77DFF]",
  };

  const barColors: Record<ToastType, string> = {
    success: "bg-emerald-400", error: "bg-red-400",
    warning: "bg-amber-400", info: "bg-[#C77DFF]",
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`admin-toast-item ${exiting ? "admin-toast-exit" : "admin-toast-enter"} ${borderColors[t.type]}`}
    >
      <div className="flex items-start gap-3 p-3.5">
        {icons[t.type]}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-white leading-tight">{t.title}</p>
          {t.message && <p className="text-[10px] text-white/50 mt-0.5 leading-relaxed">{t.message}</p>}
          {t.undoAction && (
            <button onClick={() => { t.undoAction?.(); dismiss(); }} className="text-[10px] font-bold text-[#C77DFF] hover:text-[#E056FD] mt-1 cursor-pointer uppercase tracking-wider">
              Undo
            </button>
          )}
        </div>
        <button onClick={dismiss} className="p-0.5 hover:bg-white/10 rounded transition-colors cursor-pointer shrink-0">
          <X size={12} className="text-white/40" />
        </button>
      </div>
      {/* Progress bar */}
      <div className="h-[2px] bg-white/5">
        <div className={`h-full ${barColors[t.type]} transition-none`} style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, opts?: { undoAction?: () => void; duration?: number }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message, ...opts }]);
  }, []);

  const ctx: ToastContextType = {
    toast: addToast,
    success: (title, msg) => addToast("success", title, msg),
    error: (title, msg) => addToast("error", title, msg),
    warning: (title, msg) => addToast("warning", title, msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[340px] max-w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
