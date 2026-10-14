"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

// Wrap a page's content with this to make it login-only:
//   <RequireAuth> ...page... </RequireAuth>
export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [loading, user, router, pathname]);

  if (loading || !user) {
    return <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted">Loading…</div>;
  }
  return children;
}