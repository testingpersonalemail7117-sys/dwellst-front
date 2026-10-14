// One place for every request to the backend.
// - In the browser it calls the same origin (/api/v1/...), which next.config.mjs proxies to Express.
// - On the server (Server Components) it calls BACKEND_URL directly.

const BASE =
  typeof window === "undefined"
    ? (process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000")
        .replace(/\/api\/v1\/?$/, "")
        .replace(/\/$/, "")
    : "";

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function apiFetch(path, { method = "GET", body, headers, ...init } = {}) {
  // FormData (file uploads) is sent as-is so the browser sets the multipart boundary itself.
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const res = await fetch(`${BASE}/api/v1${path}`, {
    method,
    credentials: "include",
    headers: { ...(body && !isForm ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    ...init,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty (204) or non-JSON body */
  }

  if (!res.ok) {
    // Supports both { error: "text" } and the documented { error: { code, message } }
    const err = data?.error;
    const message = (typeof err === "string" ? err : err?.message) || data?.message || `Request failed (${res.status})`;
    throw new ApiError(message, res.status, data?.details ?? err?.details);
  }
  return data;
}

// Supports both { data: {...} } (listings API) and a bare { user, token } body (auth API).
export const unwrap = (body) => body?.data ?? body;

// Turns an ApiError into one readable line (includes field-level validation messages).
export function errorMessage(err) {
  if (err?.details?.length) return err.details.map((d) => d.message).join(" · ");
  return err?.message || "Something went wrong";
}