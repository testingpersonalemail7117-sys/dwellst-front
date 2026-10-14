// Shared button styles: 44px tall tap targets, one radius, visible focus (global :focus-visible).
const base =
  "inline-flex h-11 items-center justify-center rounded-lg px-4 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const btnPrimary = `${base} bg-primary text-white hover:bg-primary-hover`;
export const btnOutline = `${base} border border-line bg-surface text-ink hover:bg-primary-light`;
export const btnDanger = `${base} bg-error text-white hover:opacity-90`;