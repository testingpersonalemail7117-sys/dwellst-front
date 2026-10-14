"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { btnOutline, btnPrimary } from "../ui/style";

// Header search (documentation 6.1): submits ?city=... to the search results page.
function HeaderSearch({ id, className = "" }) {
  return (
    <form action="/search" method="get" role="search" className={`flex ${className}`}>
      <label htmlFor={id} className="sr-only">Search by city or municipality</label>
      <input
        id={id}
        name="city"
        type="search"
        placeholder="Search by city or municipality"
        className="h-11 min-w-0 flex-1 rounded-l-lg border border-r-0 border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-primary"
      />
      <button type="submit" aria-label="Search" className="flex h-11 w-11 items-center justify-center rounded-r-lg bg-primary text-white hover:bg-primary-hover">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3.5-3.5" />
        </svg>
      </button>
    </form>
  );
}

const textLink = "px-2 text-sm font-semibold text-primary hover:text-primary-hover";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const firstName = user?.name?.split(" ")[0] ?? "there";

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  async function handleLogout() {
    close();
    await logout();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/95 backdrop-blur">
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Dwellst
        </Link>

        <HeaderSearch id="header-search" className="hidden max-w-md flex-1 md:flex" />

        <div className="ml-auto hidden items-center gap-3 md:flex">
          {user && (
            <>
              <Link href="/visits" className={textLink}>
                My visits
              </Link>
              <Link href="/owner/listings" className={textLink}>
                My listings
              </Link>
            </>
          )}

          <Link href="/owner/listings/new" className={btnOutline}>
            Post a room
          </Link>

          {loading ? (
            <div className="h-11 w-28" aria-hidden="true" />
          ) : user ? (
            <>
              <span className="text-sm font-medium text-ink">Hi, {firstName}</span>
              <button type="button" onClick={handleLogout} className={btnOutline}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={textLink}>
                Log in
              </Link>
              <Link href="/register" className={btnPrimary}>
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg text-ink hover:bg-primary-light md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {open && (
        <div id="mobile-menu" className="space-y-3 border-t border-line bg-surface px-4 pb-6 pt-4 md:hidden">
          <HeaderSearch id="mobile-search" className="w-full" />

          <Link href="/owner/listings/new" onClick={close} className={`${btnPrimary} w-full`}>
            Post a room
          </Link>

          {user && (
            <>
              <Link href="/owner/listings" onClick={close} className={`${btnOutline} w-full`}>
                My listings
              </Link>
              <Link href="/visits" onClick={close} className={`${btnOutline} w-full`}>
                My visits
              </Link>
            </>
          )}

          {!loading &&
            (user ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-ink">Hi, {firstName}</span>
                <button type="button" onClick={handleLogout} className={btnOutline}>
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" onClick={close} className={btnOutline}>
                  Log in
                </Link>
                <Link href="/register" onClick={close} className={btnOutline}>
                  Sign up
                </Link>
              </div>
            ))}
        </div>
      )}
    </header>
  );
}