// The status is always written out, never shown by color alone.
const STATUS = {
  scheduled: { label: "Scheduled", className: "bg-primary-light text-primary" },
  completed: { label: "Attended", className: "bg-primary text-white" },
  missed: { label: "Not attended", className: "border border-warning bg-surface text-warning" },
  cancelled: { label: "Cancelled", className: "bg-line text-ink" },
};

export default function VisitStatus({ status, cancelledBy }) {
  const s = STATUS[status] ?? { label: status, className: "bg-line text-ink" };
  const label = status === "cancelled" && cancelledBy ? `Cancelled by ${cancelledBy}` : s.label;

  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${s.className}`}>{label}</span>;
}