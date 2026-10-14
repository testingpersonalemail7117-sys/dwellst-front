"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, errorMessage, unwrap } from "../lib/api";
import { describeNotification } from "../lib/notifications";
import { formatDateTime } from "../lib/format";
import { useNotifications } from "../context/NotificationsContext";
import { useToast } from "../context/ToastContext";
import Alert from "../components/ui/Alert";
import EmptyState from "../components/ui/EmptyState";
import { btnOutline } from "../components/ui/styles";

const PAGE_SIZE = 20;

export default function NotificationList() {
  const { toast } = useToast();
  const { unreadCount, setCount, refresh } = useNotifications();

  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [loadingMore, setLoadingMore] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async (before) => {
    const qs = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (before) qs.set("before", before);
    return apiFetch(`/notifications?${qs}`);
  }, []);

  useEffect(() => {
    let active = true;
    load()
      .then((body) => {
        if (!active) return;
        setItems(body.data ?? []);
        setCursor(body.pagination?.nextCursor ?? null);
        setCount(body.pagination?.unreadCount ?? 0);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, [load, setCount]);

  async function loadMore() {
    setLoadingMore(true);
    try {
      const body = await load(cursor);
      setItems((prev) => {
        const seen = new Set(prev.map((n) => n.id));
        return [...prev, ...(body.data ?? []).filter((n) => !seen.has(n.id))];
      });
      setCursor(body.pagination?.nextCursor ?? null);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setLoadingMore(false);
    }
  }

  // Opening a notification marks it as read (the link still works if this request fails).
  async function markRead(n) {
    if (n.read) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    try {
      const result = unwrap(await apiFetch(`/notifications/${n.id}/read`, { method: "PATCH" }));
      setCount(result.unreadCount);
    } catch {
      refresh();
    }
  }

  async function markAllRead() {
    setMarkingAll(true);
    try {
      await apiFetch("/notifications/read-all", { method: "POST" });
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setCount(0);
    } catch (err) {
      toast(errorMessage(err), "error");
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-ink">Notifications</h1>
        {unreadCount > 0 && (
          <button type="button" onClick={markAllRead} disabled={markingAll} className={btnOutline}>
            {markingAll ? "Working…" : `Mark all as read (${unreadCount})`}
          </button>
        )}
      </div>
      <p className="mt-2 text-sm text-muted">Updates about visits: new bookings, cancellations and whether a visit happened.</p>

      <div className="mt-6">
        {status === "loading" && <p className="text-sm text-muted">Loading…</p>}
        {status === "error" && <Alert variant="error">We couldn&apos;t load your notifications. Please refresh the page.</Alert>}

        {status === "ready" && items.length === 0 && (
          <EmptyState title="No notifications yet">When someone books a visit, or the status of your visit changes, you&apos;ll see it here.</EmptyState>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className="space-y-3">
            {items.map((n) => {
              const { title, body, href } = describeNotification(n);

              const content = (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-semibold text-ink">{title}</p>
                    {!n.read && <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-white">New</span>}
                  </div>
                  {body && <p className="mt-1 text-sm text-muted">{body}</p>}
                  <p className="mt-2 text-xs text-muted">{formatDateTime(n.createdAt)}</p>
                </>
              );

              const box = `block rounded-xl border p-4 shadow-sm ${n.read ? "border-line bg-surface" : "border-primary bg-primary-light/50"}`;

              return (
                <li key={n.id}>
                  {href ? (
                    <Link href={href} onClick={() => markRead(n)} className={`${box} hover:bg-primary-light`}>
                      {content}
                    </Link>
                  ) : (
                    <div className={box}>
                      {content}
                      {!n.read && (
                        <button type="button" onClick={() => markRead(n)} className="mt-2 text-xs font-semibold text-primary underline">
                          Mark as read
                        </button>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {status === "ready" && cursor && (
          <div className="mt-6 text-center">
            <button type="button" onClick={loadMore} disabled={loadingMore} className={btnOutline}>
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}