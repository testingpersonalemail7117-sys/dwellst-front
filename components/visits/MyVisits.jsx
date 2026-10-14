"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, errorMessage, unwrap } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { formatVisitRange } from "../../lib/format";
import Alert from "../ui/Alert";
import EmptyState from "../ui/EmptyState";
import ConfirmDialog from "../ui/ConfirmDialog";
import VisitStatus from "./VisitStatus";
import { btnOutline, btnPrimary } from "../ui/style";

export default function MyVisits() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => setData(unwrap(await apiFetch("/visits/mine"))), []);

  useEffect(() => {
    let active = true;
    load()
      .then(() => active && setStatus("ready"))
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [load]);

  async function cancel() {
    setCancelling(true);
    try {
      await apiFetch(`/visits/${toCancel.id}`, { method: "PATCH", body: { status: "cancelled" } });
      toast("Visit cancelled. The time is open for others again.", "success");
      setToCancel(null);
      await load();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setCancelling(false);
    }
  }

  const row = (v, canCancel) => (
    <li key={v.id} className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={`/listings/${v.listingId}`} className="font-semibold text-ink hover:text-primary">
            {v.listing?.title}
          </Link>
          <p className="mt-1 text-sm text-muted">{formatVisitRange(v.startsAt, v.endsAt)}</p>
          {v.note && <p className="mt-1 text-sm text-ink">&ldquo;{v.note}&rdquo;</p>}
        </div>
        <VisitStatus status={v.status} cancelledBy={v.cancelledBy} />
      </div>

      {canCancel && new Date(v.startsAt) > new Date() && (
        <button type="button" onClick={() => setToCancel(v)} className={`${btnOutline} mt-3`}>
          Cancel visit
        </button>
      )}
    </li>
  );

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-ink">My visits</h1>
      <p className="mt-2 text-sm text-muted">
        Can&apos;t make a visit? Cancel it so someone else can take the time. Visits you don&apos;t attend are released automatically.
      </p>

      <div className="mt-6">
        {status === "loading" && <p className="text-sm text-muted">Loading…</p>}
        {status === "error" && <Alert variant="error">We couldn&apos;t load your visits. Please refresh the page.</Alert>}

        {status === "ready" && (
          <div className="space-y-8">
            <div>
              <h2 className="font-semibold text-ink">Upcoming ({data.upcoming.length})</h2>
              {data.upcoming.length === 0 ? (
                <div className="mt-3">
                  <EmptyState title="No visits scheduled">
                    <p>Find a place you like and pick a time to see it.</p>
                    <Link href="/search" className={`${btnPrimary} mt-4`}>
                      Search listings
                    </Link>
                  </EmptyState>
                </div>
              ) : (
                <ul className="mt-3 space-y-3">{data.upcoming.map((v) => row(v, true))}</ul>
              )}
            </div>

            {data.past.length > 0 && (
              <div>
                <h2 className="font-semibold text-ink">Past visits</h2>
                <ul className="mt-3 space-y-3">{data.past.map((v) => row(v, false))}</ul>
              </div>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog open={Boolean(toCancel)} title="Cancel this visit?" confirmLabel="Cancel visit" busy={cancelling} onConfirm={cancel} onCancel={() => setToCancel(null)}>
        The time will open up for other people. You can book another time afterwards.
      </ConfirmDialog>
    </section>
  );
}