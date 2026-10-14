"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, errorMessage } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import ConfirmDialog from "../ui/ConfirmDialog";
import { btnDanger, btnOutline } from "../ui/style";

// Shown only to the listing owner (the server decides: listing.isOwner). The API enforces ownership again.
export default function OwnerTools({ listing, statuses }) {
  const router = useRouter();
  const { toast } = useToast();
  const [status, setStatus] = useState(listing.status);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => setStatus(listing.status), [listing.status]);

  async function changeStatus(next) {
    const previous = status;
    setStatus(next);
    setBusy(true);
    try {
      await apiFetch(`/listings/${listing.id}/availability`, { method: "PATCH", body: { availabilityStatus: next } });
      toast("Availability updated", "success");
      router.refresh();
    } catch (err) {
      setStatus(previous);
      toast(errorMessage(err), "error");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setDeleting(true);
    try {
      await apiFetch(`/listings/${listing.id}`, { method: "DELETE" });
      toast("Listing deleted", "success");
      router.push("/owner/listings");
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <section aria-labelledby="owner-tools-heading" className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 id="owner-tools-heading" className="font-semibold text-ink">
        Manage this listing
      </h2>

      <div className="mt-3 space-y-3">
        <div>
          <label htmlFor="availability" className="mb-1 block text-sm font-medium text-ink">
            Availability
          </label>
          <select
            id="availability"
            value={status}
            disabled={busy}
            onChange={(e) => changeStatus(e.target.value)}
            className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-primary"
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href={`/owner/listings/${listing.id}/edit`} className={btnOutline}>
            Edit
          </Link>
          <button type="button" onClick={() => setConfirming(true)} className={btnDanger}>
            Delete
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirming}
        title="Delete this listing?"
        confirmLabel="Delete listing"
        busy={deleting}
        onConfirm={remove}
        onCancel={() => setConfirming(false)}
      >
        This permanently removes the listing, its photos, likes and comments. Shared links to it will stop working.
      </ConfirmDialog>
    </section>
  );
}