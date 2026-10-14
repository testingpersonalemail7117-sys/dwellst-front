export function formatDate(value, options = { year: "numeric", month: "short", day: "numeric" }) {
  if (!value) return "";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-PH", options);
}

export function formatDateTime(value) {
  return formatDate(value, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

// Visit times are shown in the property's local time, whatever the viewer's device clock says.
export const SITE_TIME_ZONE = "Asia/Manila";

export function formatVisitDay(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-PH", { timeZone: SITE_TIME_ZONE, weekday: "short", month: "short", day: "numeric" });
}

export function formatVisitTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleTimeString("en-PH", { timeZone: SITE_TIME_ZONE, hour: "numeric", minute: "2-digit" });
}

export function formatVisitRange(startsAt, endsAt) {
  return `${formatVisitDay(startsAt)} · ${formatVisitTime(startsAt)} – ${formatVisitTime(endsAt)}`;
}