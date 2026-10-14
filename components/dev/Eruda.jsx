"use client";

import { useEffect } from "react";

// Eruda: an on-screen console / network / elements inspector for mobile browsers.
// Runs in development, or in production only if NEXT_PUBLIC_ENABLE_ERUDA=true.
export default function Eruda() {
  useEffect(() => {
    const enabled = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_ENABLE_ERUDA === "true";
    if (!enabled || window.__erudaLoaded) return;
    window.__erudaLoaded = true;

    import("eruda").then(({ default: eruda }) => eruda.init());
  }, []);

  return null;
}