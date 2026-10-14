// Input, textarea or select with a label, optional hint and an accessible error message.
//   <FormField id="title" label="Title" error={errors.title} />
//   <FormField as="select" id="type" label="Type"><option>…</option></FormField>
export default function FormField({ label, id, hint, error, as: Tag = "input", children, className = "", ...props }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  const size = Tag === "textarea" ? "min-h-32 py-2" : "h-11";

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-ink">
        {label}
      </label>
      <Tag
        id={id}
        name={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-primary ${size} ${
          error ? "border-error" : "border-line"
        }`}
        {...props}
      >
        {children}
      </Tag>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-error">
          {error}
        </p>
      )}
    </div>
  );
}