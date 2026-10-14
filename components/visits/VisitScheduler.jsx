"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, errorMessage, unwrap } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { formatVisitDay, formatVisitRange, formatVisitTime } from "../../lib/format";
import Alert from "../ui/Alert";
import ConfirmDialog from "../ui/ConfirmDialog";
import { btnOutline, btnPrimary } from "../ui/style";

// Visitors pick one of the owner's open time slots. A slot is held only while the visit is scheduled:
// cancelling, or not showing up, frees it again.
export default function VisitScheduler({ listingId }) {
  const router = useRouter();
  const { user, loading: authLoading, requireLogin } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [reloadKey, setReloadKey] = useState(0);
  const [date, setDate] = useState(null);
  const [slot, setSlot] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [booking, setBooking] = useState(false);
  const bookingRef = useRef(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    let active = true;

    apiFetch(`/listings/${listingId}/visit-slots`)
      .then((body) => {
        if (!active) return;
        const result = unwrap(body);
        setData(result);
        setStatus("ready");

        const firstOpen = result.slots.find((s) => s.available);
        setDate((current) => (current && result.slots.some((s) => s.date === current) ? current : firstOpen?.date ?? null));
        setSlot(null);
      })
      .catch(() => active && setStatus("error"));

    return () => {
      active = false;
    };
  }, [authLoading, user?.id, listingId, reloadKey]);

  // Days that have slots, with how many are still free
  const days = useMemo(() => {
    const map = new Map();
    for (const s of data?.slots ?? []) {
      if (!map.has(s.date)) map.set(s.date, { date: s.date, first: s.startsAt, slots: [], free: 0 });
      const day = map.get(s.date);
      day.slots.push(s);
      if (s.available) day.free += 1;
    }
    return [...map.values()];
  }, [data]);

  const selectedDay = days.find((d) => d.date === date);

  async function book() {
    if (!slot || bookingRef.current) return;
    bookingRef.current = true;
    setBooking(true);
    setError("");

    try {
      await apiFetch(`/listings/${listingId}/visits`, { method: "POST", body: { startsAt: slot, note } });
      toast("Visit scheduled. See you there!", "success");
      setNote("");
      setReloadKey((k) => k + 1);
      router.refresh(); // updates the visit counts on the page
    } catch (err) {
      setError(errorMessage(err));
      if (err.status === 409) setReloadKey((k) => k + 1); // somebody else took it: show fresh times
    } finally {
      bookingRef.current = false;
      setBooking(false);
    }
  }

  async function cancel() {
    setCancelling(true);
    try {
      await apiFetch(`/visits/${data.myVisit.id}`, { method: "PATCH", body: { status: "cancelled" } });
      toast("Visit cancelled. The time is open for others again.", "success");
      setConfirmCancel(false);
      setReloadKey((k) => k + 1);
      router.refresh();
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setCancelling(false);
    }
  }

  const graceHours = data ? Math.max(1, Math.round(data.rules.graceMinutes / 60)) : 2;

  return (
    <section aria-labelledby="visit-heading" className="rounded-xl border border-line bg-surface p-4 shadow-sm">
      <h2 id="visit-heading" className="font-semibold text-ink">
        Schedule a visit
      </h2>

      {status === "loading" && (
        <div aria-busy="true" className="mt-3 animate-pulse space-y-2">
          <span className="sr-only">Loading visit times…</span>
          <div className="h-9 rounded bg-line" />
          <div className="h-9 rounded bg-line" />
        </div>
      )}

      {status === "error" && (
        <div className="mt-3 space-y-3">
          <Alert variant="error">Visit times couldn&apos;t be loaded.</Alert>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)} className={btnOutline}>
            Try again
          </button>
        </div>
      )}

      {status === "ready" && data.myVisit && (
        <div className="mt-3 space-y-3">
          <p className="rounded-lg bg-primary-light px-3 py-3 text-sm text-ink">
            <span className="block text-xs font-semibold text-primary">Your visit</span>
            <span className="font-semibold">{formatVisitRange(data.myVisit.startsAt, data.myVisit.endsAt)}</span>
            {data.myVisit.note && <span className="mt-1 block text-muted">&ldquo;{data.myVisit.note}&rdquo;</span>}
          </p>
          <p className="text-xs text-muted">
            Can&apos;t make it? Cancel so someone else can take the time. If you don&apos;t show up, the visit is released automatically about {graceHours}{" "}
            {graceHours === 1 ? "hour" : "hours"} after it ends.
          </p>
          <button type="button" onClick={() => setConfirmCancel(true)} className={`${btnOutline} w-full`}>
            Cancel my visit
          </button>
        </div>
      )}

      {status === "ready" && !data.myVisit && !data.settings.bookable && (
        <p className="mt-3 text-sm text-muted">{data.settings.message}</p>
      )}

      {status === "ready" && !data.myVisit && data.settings.bookable && (
        <div className="mt-3 space-y-4">
          {days.length === 0 ? (
            <p className="text-sm text-muted">No visiting times are open in the next few weeks.</p>
          ) : (
            <>
              <div role="group" aria-label="Choose a day" className="flex gap-2 overflow-x-auto pb-1">
                {days.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => {
                      setDate(d.date);
                      setSlot(null);
                      setError("");
                    }}
                    aria-pressed={d.date === date}
                    className={`shrink-0 rounded-lg border px-3 py-2 text-left text-xs ${
                      d.date === date ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:bg-primary-light"
                    }`}
                  >
                    <span className="block font-semibold">{formatVisitDay(d.first)}</span>
                    <span className={d.date === date ? "text-white" : "text-muted"}>
                      {d.free === 0 ? "Fully booked" : `${d.free} open`}
                    </span>
                  </button>
                ))}
              </div>

              {selectedDay && (
                <div role="group" aria-label={`Times on ${formatVisitDay(selectedDay.first)}`} className="grid grid-cols-3 gap-2">
                  {selectedDay.slots.map((s) => (
                    <button
                      key={s.startsAt}
                      type="button"
                      disabled={!s.available}
                      onClick={() => {
                        setSlot(s.startsAt);
                        setError("");
                      }}
                      aria-pressed={slot === s.startsAt}
                      className={`h-11 rounded-lg border text-xs font-semibold disabled:cursor-not-allowed disabled:text-muted disabled:line-through ${
                        slot === s.startsAt ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink hover:bg-primary-light disabled:bg-line/40"
                      }`}
                    >
                      {formatVisitTime(s.startsAt)}
                      {!s.available && <span className="sr-only"> (booked)</span>}
                    </button>
                  ))}
                </div>
              )}

              {slot && (
                <div className="space-y-3">
                  <p className="text-sm text-ink">
                    Selected: <span className="font-semibold">{formatVisitRange(slot, data.slots.find((s) => s.startsAt === slot)?.endsAt)}</span>
                  </p>

                  <div>
                    <label htmlFor="visit-note" className="mb-1 block text-xs font-medium text-muted">
                      Note for the owner (optional)
                    </label>
                    <textarea
                      id="visit-note"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={data.rules.noteMaxLength}
                      rows={2}
                      placeholder="e.g. I'm bringing a friend"
                      className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary"
                    />
                  </div>

                  {error && <Alert variant="error">{error}</Alert>}

                  <button type="button" onClick={() => requireLogin(book)} disabled={booking} className={`${btnPrimary} w-full`}>
                    {booking ? "Booking…" : user ? "Confirm visit" : "Log in to book"}
                  </button>
                </div>
              )}

              {!slot && error && <Alert variant="error">{error}</Alert>}

              <p className="text-xs text-muted">
                You can hold one visit per place, up to {data.rules.maxActivePerVisitor} at a time. Times are shown in Philippine time.
              </p>
            </>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this visit?"
        confirmLabel="Cancel visit"
        busy={cancelling}
        onConfirm={cancel}
        onCancel={() => setConfirmCancel(false)}
      >
        The time will open up for other people. You can book another time afterwards.
      </ConfirmDialog>
    </section>
  );
}