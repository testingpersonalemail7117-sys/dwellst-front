export default function ListingsSkeleton({ count = 3 }) {
  return (
    <div aria-busy="true" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <span className="sr-only">Loading listings…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-xl border border-line bg-surface">
          <div className="aspect-[4/3] bg-primary-light" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 rounded bg-line" />
            <div className="h-3 w-1/2 rounded bg-line" />
            <div className="h-5 w-1/3 rounded bg-line" />
          </div>
        </div>
      ))}
    </div>
  );
}