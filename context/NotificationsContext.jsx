"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch, unwrap } from "../lib/api";
import { describeNotification } from "../lib/notifications";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const NotificationsContext = createContext(null);
const POLL_MS = 60 * 1000;

// Checks for new notifications about once a minute while the page is visible, and again when you return to the tab.
// When something new arrives, a short toast announces it.
export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);
  const lastCount = useRef(null); // null until the first check, so opening the site never toasts old news

  const announceNewest = useCallback(async () => {
    try {
      const body = await apiFetch("/notifications?limit=1");
      const newest = body?.data?.[0];
      if (newest && !newest.read) {
        const { title } = describeNotification(newest);
        toast(title, "info");
      }
    } catch {
      /* the count is still correct, just no toast */
    }
  }, [toast]);

  const refresh = useCallback(async () => {
    try {
      const count = unwrap(await apiFetch("/notifications/unread-count")).unreadCount;
      const increased = lastCount.current !== null && count > lastCount.current;
      lastCount.current = count;
      setUnreadCount(count);
      if (increased) announceNewest();
    } catch {
      /* offline or signed out: keep the last number */
    }
  }, [announceNewest]);

  useEffect(() => {
    if (!user) {
      lastCount.current = null;
      setUnreadCount(0);
      return;
    }

    refresh();

    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, POLL_MS);
    const onVisible = () => document.visibilityState === "visible" && refresh();

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [user, refresh]);

  // The notifications page calls this after reading, so the bell updates immediately.
  const setCount = useCallback((n) => {
    lastCount.current = n;
    setUnreadCount(n);
  }, []);

  const value = useMemo(() => ({ unreadCount, refresh, setCount }), [unreadCount, refresh, setCount]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationsProvider>");
  return ctx;
}