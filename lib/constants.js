// Display helpers. The rules for which fields apply to which property type, the amenity list and the
// upload limits come from the API (GET /api/v1/listings/meta), so the backend stays the source of truth.

// Home-page shortcuts. "value" is sent as ?type=<value>.
export const PROPERTY_TYPES = [
  { value: "room", label: "Rooms for rent", blurb: "A private room in a shared home", icon: "🚪" },
  { value: "bedspace", label: "Bedspaces", blurb: "A shared room, one bed at a time", icon: "🛏️" },
  { value: "boardinghouse", label: "Boardinghouses", blurb: "Rooms with shared facilities", icon: "🏘️" },
  { value: "apartment", label: "Apartments & studios", blurb: "A whole unit of your own", icon: "🏢" },
  { value: "dormitory", label: "Dormitories", blurb: "Managed shared housing", icon: "🎓" },
  { value: "house", label: "Houses & townhouses", blurb: "Whole-home rentals", icon: "🏠" },
];

export const propertyTypeLabel = (value) =>
  PROPERTY_TYPES.find((t) => t.value === value)?.label ?? (value ? String(value).replace(/[-_]/g, " ") : "");

export const AVAILABILITY_LABELS = {
  available: "Available",
  occupied: "Rented / fully occupied",
  unavailable: "Temporarily closed",
};

export function unitsLabel(type, n) {
  const noun = type === "bedspace" ? "bedspace" : "room";
  return `${n} ${noun}${n === 1 ? "" : "s"} available`;
}

export const humanize = (key) => String(key).replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());