"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const ToastContext = createContext(null);

const styles = {
  success: "border-success/30 bg-primary-light text-success",
  error: "border-error/30 bg-surface text-error",
  info: "border-line bg-surface text-ink",
};
const labels = { success: "Success:", error: "Error:", info: "" };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  // toast("Saved", "success") | toast("Something failed", "error") | toast("FYI")
  const toast = useCallback(
    (message, variant = "info") => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-3), { id, message, variant }]);
      setTimeout(() => dismiss(id), variant === "error" ? 8000 : 5000);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-md ${styles[t.variant] ?? styles.info}`}
          >
            <p className="flex-1">
              {labels[t.variant] && <span className="font-semibold">{labels[t.variant]} </span>}
              {t.message}
            </p>
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => dismiss(t.id)}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-muted hover:text-ink"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}