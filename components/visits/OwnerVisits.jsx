"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, errorMessage, unwrap } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import { formatVisitRange } from "../../lib/format";
import FormField from "../auth/FormField";
import Alert from "../ui/Alert";
import EmptyState from "../ui/EmptyState";
import ConfirmDialog from "../ui/ConfirmDialog";
import VisitStatus from "./VisitStatus";
import { btnOutline, btnPrimary } from "../ui/style";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SLOT_LENGTHS = [15, 30, 45, 60, 90, 120];
const smallButton =
  "inline-flex h-9 items-center justify-center rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink hover:bg-primary-light disabled:opacity-60";

// Owner only. The API checks ownership again on every request.
export default function OwnerVisits({ listingId }) {
  const router = useRouter();
  const { toast } = useToast();

  const [settings, setSettings] = useState(null);
  const [visits, setVisits] = useState(null);
  const [status, setStatus] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [toCancel, setToCancel] = useState(null);
  const [working, setWorking] = useState(false);

  const load = useCallback(async () => {
    const [slots, list] = await Promise.all([apiFetch(`/listings/${listingId}/visit-slots`), apiFetch(`/listings/${listingId}/visits`)]);
    const s = unwrap(slots).settings;
    setSettings({ enabled: s.enabled, days: s.days, startTime: s.startTime, endTime: s.endTime, slotMinutes: s.slotMinutes });
    setVisits(unwrap(list));
  }, [listingId]);

  useEffect(() => {
    let active = true;
    load()
      .then(() => active && setStatus("ready"))
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [load]);

  const set = (name) => (e) => setSettings((s) => ({ ...s, [name]: e.target.value }));
  const toggleDay = (d) =>
    setSettings((s) => ({ ...s, days: s.days.includes(d) ? s.days.filter((x) => x !== d) : [...s.days, d].sort((a, b) => a - b) }));

  async function saveSettings(e) {
    e.preventDefault();
    setSaving(true);
    setSettingsError("");
    try {
      await apiFetch(`/listings/${listingId}/visit-settings`, {
        method: "PUT",
        body: { ...settings, slotMinutes: Number(settings.slotMinutes) },
      });
      toast("Visiting hours saved", "success");
      await load();
    } catch (err) {
      setSettingsError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function setVisitStatus(visit, next) {
    setWorking(true);
    try {
      await apiFetch(`/visits/${visit.id}`, { method: "PATCH", body: { status: next } });
      toast(next === "cancelled" ? "Visit cancelled" : next === "completed" ? "Marked as attended" : "Marked as not attended", "success");
      setToCancel(null);
      await load();
      router.refresh(); // updates the visit counts on the page
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setWorking(false);
    }
  }

  const started = (v) => new Date(v.startsAt) <= new Date();

  function renderVisit(v) {
    return (
      <li key={v.id} className="rounded-lg border border-line bg-surface p-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-ink">{v.visitor?.name}</p>
            <p className="text-sm text-muted">{formatVisitRange(v.startsAt, v.endsAt)}</p>
            {v.note && <p className="mt-1 text-sm text-ink">&ldquo;{v.note}&rdquo;</p>}
          </div>
          <VisitStatus status={v.status} cancelledBy={v.cancelledBy} />
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {v.status === "scheduled" && started(v) && (
            <>
              <button type="button" disabled={working} onClick={() => setVisitStatus(v, "completed")} className={smallButton}>
                Mark attended
              </button>
              <button type="button" disabled={working} onClick={() => setVisitStatus(v, "missed")} className={smallButton}>
                Didn&apos;t show up
              </button>
            </>
          )}
          {v.status === "scheduled" && (
            <button type="button" disabled={working} onClick={() => setToCancel(v)} className={smallButton}>
              Cancel visit
            </button>
          )}
          {v.status === "missed" && (
            <button type="button" disabled={working} onClick={() => setVisitStatus(v, "completed")} className={smallButton}>
              They did come: mark attended
            </button>
          )}
        </div>
      </li>
    );
  }

  return (
    <section aria-labelledby="owner-visits-heading" className="mt-8 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-6">
      <h2 id="owner-visits-heading" className="text-xl font-bold text-ink">
        Visits
      </h2>
      <p className="mt-1 text-sm text-muted">
        Choose when people can come and see the place. After a visit, mark whether the person came. Visits nobody confirms are released
        automatically a couple of hours after they end, and you can correct that for a few days.
      </p>

      {status === "loading" && <p className="mt-4 text-sm text-muted">Loading…</p>}
      {status === "error" && <div className="mt-4"><Alert variant="error">Visits couldn&apos;t be loaded. Please refresh the page.</Alert></div>}

      {status === "ready" && (
        <>
          <form onSubmit={saveSettings} className="mt-5 space-y-4">
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-ink">
              <input
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => setSettings((s) => ({ ...s, enabled: e.target.checked }))}
                className="h-5 w-5 accent-primary"
              />
              Let people book visits
            </label>

            <fieldset disabled={!settings.enabled || saving} className="space-y-4 disabled:opacity-60">
              <div>
                <legend className="mb-1 text-sm font-medium text-ink">Open days</legend>
                <div className="flex flex-wrap gap-2">
                  {DAY_LABELS.map((label, d) => (
                    <label
                      key={label}
                      className={`flex h-11 min-w-14 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm font-semibold ${
                        settings.days.includes(d) ? "border-primary bg-primary text-white" : "border-line bg-surface text-ink"
                      }`}
                    >
                      <input type="checkbox" checked={settings.days.includes(d)} onChange={() => toggleDay(d)} className="sr-only" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField id="visit-start" label="From" type="time" value={settings.startTime} onChange={set("startTime")} />
                <FormField id="visit-end" label="Until" type="time" value={settings.endTime} onChange={set("endTime")} />
                <FormField as="select" id="visit-slot" label="Length of each visit" value={settings.slotMinutes} onChange={set("slotMinutes")}>
                  {SLOT_LENGTHS.map((m) => (
                    <option key={m} value={m}>
                      {m} minutes
                    </option>
                  ))}
                </FormField>
              </div>
            </fieldset>

            {settingsError && <Alert variant="error">{settingsError}</Alert>}

            <button type="submit" disabled={saving} className={btnPrimary}>
              {saving ? "Saving…" : "Save visiting hours"}
            </button>
          </form>

          <div className="mt-8">
            <h3 className="font-semibold text-ink">Upcoming visits ({visits.upcoming.length})</h3>
            {visits.upcoming.length === 0 ? (
              <div className="mt-3">
                <EmptyState title="No visits scheduled">When someone books a time, it will show up here.</EmptyState>
              </div>
            ) : (
              <ul className="mt-3 space-y-3">{visits.upcoming.map(renderVisit)}</ul>
            )}
          </div>

          {visits.history.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-ink">Past visits</h3>
              <ul className="mt-3 space-y-3">{visits.history.map(renderVisit)}</ul>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(toCancel)}
        title="Cancel this visit?"
        confirmLabel="Cancel visit"
        busy={working}
        onConfirm={() => setVisitStatus(toCancel, "cancelled")}
        onCancel={() => setToCancel(null)}
      >
        {toCancel ? `${toCancel.visitor?.name}'s visit on ${formatVisitRange(toCancel.startsAt, toCancel.endsAt)} will be cancelled and the time opens up again.` : ""}
      </ConfirmDialog>
    </section>
  );
}