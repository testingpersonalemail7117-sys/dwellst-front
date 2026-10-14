// Short trust-and-safety explanation (documentation 6.1, item 6).
// No testimonials, counts or "verified" claims (documentation 1.4 and 6.1).
const points = [
  {
    icon: "💰",
    title: "Clear prices",
    text: "Each listing shows the monthly rent and any extra monthly fees the owner has listed, so you can compare the real cost.",
  },
  {
    icon: "🕒",
    title: "See how fresh it is",
    text: "Listings show when they were last updated, so you can tell if the details are recent.",
  },
  {
    icon: "🚩",
    title: "Report anything suspicious",
    text: "If a listing looks misleading or unsafe, use the report button on it and a moderator will review it.",
  },
];

export default function TrustSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12">
      <h2 className="text-2xl font-bold text-ink">Renting with confidence</h2>
      <p className="mt-2 max-w-2xl text-muted">
        Listing details are provided by owners and managers. Visit a place and confirm the details before you pay a deposit.
      </p>

      <ul className="mt-6 grid gap-4 md:grid-cols-3">
        {points.map((p) => (
          <li key={p.title} className="rounded-xl border border-line bg-surface p-6 shadow-sm">
            <span className="text-2xl" aria-hidden="true">{p.icon}</span>
            <h3 className="mt-3 font-semibold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-muted">{p.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}