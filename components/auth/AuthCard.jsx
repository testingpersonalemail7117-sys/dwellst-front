export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {subtitle && <p className="mt-2 text-sm text-muted">{subtitle}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </div>
    </div>
  );
}