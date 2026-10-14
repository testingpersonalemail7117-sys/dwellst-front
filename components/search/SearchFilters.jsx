import { PROPERTY_TYPES } from "../../lib/constants";
import { btnPrimary } from "../ui/style";

const input = "h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-primary";
const label = "mb-1 block text-xs font-medium text-muted";

// Plain GET form: the filters live in the URL, so results can be bookmarked and shared.
export default function SearchFilters({ values }) {
  return (
    <form action="/search" method="get" role="search" className="grid gap-3 rounded-xl border border-line bg-surface p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-6 lg:items-end">
      <div className="lg:col-span-2">
        <label htmlFor="f-city" className={label}>Location</label>
        <input id="f-city" name="city" type="text" defaultValue={values.city ?? ""} placeholder="City, municipality or province" className={input} />
      </div>

      <div>
        <label htmlFor="f-type" className={label}>Property type</label>
        <select id="f-type" name="type" defaultValue={values.type ?? ""} className={input}>
          <option value="">All types</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="f-min" className={label}>Min rent (₱)</label>
        <input id="f-min" name="minRent" type="number" inputMode="numeric" min="0" step="100" defaultValue={values.minRent ?? ""} className={input} />
      </div>

      <div>
        <label htmlFor="f-max" className={label}>Max rent (₱)</label>
        <input id="f-max" name="maxRent" type="number" inputMode="numeric" min="0" step="100" defaultValue={values.maxRent ?? ""} className={input} />
      </div>

      <div>
        <label htmlFor="f-sort" className={label}>Sort by</label>
        <select id="f-sort" name="sort" defaultValue={values.sort ?? "newest"} className={input}>
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>

      <label className="flex min-h-11 items-center gap-3 text-sm text-ink sm:col-span-2 lg:col-span-4">
        <input type="checkbox" name="availability" value="available" defaultChecked={values.availability === "available"} className="h-5 w-5 accent-primary" />
        Show available rooms only
      </label>

      <button type="submit" className={`${btnPrimary} sm:col-span-2 lg:col-span-2`}>
        Search
      </button>
    </form>
  );
}