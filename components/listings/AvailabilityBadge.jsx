import { formatDate } from "../../lib/format";

// Status is always shown as text, never by color alone.
export default function AvailabilityBadge({ status = "available", availableFrom }) {
  if (status === "occupied") {
    return <span className="rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">Rented</span>;
  }

  if (status === "unavailable") {
    return (
      <span className="rounded-full border border-warning bg-surface px-3 py-1 text-xs font-medium text-warning">
        Temporarily closed
      </span>
    );
  }

  const from = availableFrom ? new Date(availableFrom) : null;
  if (from && !Number.isNaN(from.getTime()) && from > new Date()) {
    return (
      <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-ink">
        Available {formatDate(from, { month: "short", day: "numeric" })}
      </span>
    );
  }

  return <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">Available</span>;
}