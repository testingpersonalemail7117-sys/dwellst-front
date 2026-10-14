"use client";

import { useEffect, useRef } from "react";
import { btnDanger, btnOutline } from "./style";

// Uses the native <dialog> element: focus is trapped inside, Escape closes it, and the page behind is inert.
export default function ConfirmDialog({ open, title, children, confirmLabel = "Confirm", busy = false, onConfirm, onCancel }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onClose={() => open && !busy && onCancel()}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-xl border border-line bg-surface p-6 text-ink shadow-md backdrop:bg-ink/50"
    >
      <h2 id="confirm-title" className="text-lg font-bold">
        {title}
      </h2>
      <div className="mt-2 text-sm text-muted">{children}</div>

      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={busy} className={btnOutline}>
          Cancel
        </button>
        <button type="button" onClick={onConfirm} disabled={busy} className={btnDanger}>
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}