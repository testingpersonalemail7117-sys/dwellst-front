"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch, unwrap } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the session from the cookie on first load.
  useEffect(() => {
    let active = true;
    apiFetch("/auth/me")
      .then((d) => active && setUser(unwrap(d)?.user ?? null))
      .catch(() => active && setUser(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const u = unwrap(await apiFetch("/auth/login", { method: "POST", body: { email, password } })).user;
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const u = unwrap(await apiFetch("/auth/register", { method: "POST", body: { name, email, password } })).user;
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
      router.refresh();
    }
  }, [router]);

  // Wrap any action that needs an account (likes, comments, reports):
  //   <button onClick={() => requireLogin(() => doSomething())}>...</button>
  // Logged in -> runs the action. Logged out -> sends them to /login and back here afterwards.
  const requireLogin = useCallback(
    (action) => {
      if (loading) return; // session still being restored
      if (user) return action?.();
      router.push(`/login?next=${encodeURIComponent(pathname)}`);
    },
    [loading, user, pathname, router]
  );

  const value = useMemo(
    () => ({ user, loading, login, register, logout, requireLogin }),
    [user, loading, login, register, logout, requireLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}