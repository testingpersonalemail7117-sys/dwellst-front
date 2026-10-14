import { cache } from "react";
import { cookies } from "next/headers";
import { apiFetch, unwrap } from "./api";
import { normalizeListing } from "./listings";

// Server Components only (uses next/headers). cache() lets generateMetadata and the page share one request.
export const getListing = cache(async (id) => {
  const cookie = (await cookies()).toString();

  try {
    const body = await apiFetch(`/listings/${encodeURIComponent(id)}`, {
      cache: "no-store",
      headers: cookie ? { cookie } : undefined,
    });
    return normalizeListing(unwrap(body));
  } catch (err) {
    if (err.status === 404 || err.status === 400) return null;
    throw err;
  }
});