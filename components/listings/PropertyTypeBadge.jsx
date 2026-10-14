import { propertyTypeLabel } from "../../lib/constants";

export default function PropertyTypeBadge({ type }) {
  if (!type) return null;
  return (
    <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium capitalize text-ink">
      {propertyTypeLabel(type)}
    </span>
  );
}