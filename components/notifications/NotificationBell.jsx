"use client";

import Link from "next/link";
import { useNotifications } from "../context/NotificationsContext";

export default function NotificationBell() {
  const { unreadCount } = useNotifications();

  return (
    <Link
      href="/notifications"
      aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
      className="relative flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-primary-light"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      {unreadCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-error px-1 text-[11px] font-bold leading-none text-white"
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}