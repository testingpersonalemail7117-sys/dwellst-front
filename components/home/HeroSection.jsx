import HeroCarousel from "./HeroCarousel";
import { HERO_IMAGES, HERO_INTERVAL_MS } from "../../lib/heroImages";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-primary";
const labelClass = "mb-1 block text-xs font-medium text-muted";

// Empty slots that show while you have not added any photos yet (development only).
const PLACEHOLDERS = [
  { placeholder: true, className: "from-primary to-primary-hover" },
  { placeholder: true, className: "from-primary-hover to-ink" },
  { placeholder: true, className: "from-ink to-primary" },
];

export default function HeroSection() {
  const isDev = process.env.NODE_ENV !== "production";
  const hasImages = HERO_IMAGES.length > 0;
  const slides = hasImages ? HERO_IMAGES : isDev ? PLACEHOLDERS : [];

  return (
    <HeroCarousel slides={slides} interval={HERO_INTERVAL_MS} showHint={isDev && !hasImages}>
      <div className="text-center">
        <span className="inline-block rounded-full bg-accent px-3 py-1 text-xs font-semibold text-ink">
          Long-term rentals in the Philippines
        </span>

        <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold tracking-tight text-white md:text-5xl">
          Find a place to live, <span className="text-accent">not just to stay</span>
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-base text-white/90 md:text-lg">
          Search rooms, bedspaces, boardinghouses, apartments and houses. Compare the full monthly cost before you reach out.
        </p>

        {/* Plain GET form (works without JavaScript). Params match GET /api/v1/listings. */}
        <form
          action="/search"
          method="get"
          role="search"
          className="mx-auto mt-8 grid max-w-4xl gap-3 rounded-xl border border-line bg-surface p-4 text-left shadow-md md:grid-cols-[1fr_9rem_9rem_auto] md:items-end"
        >
          <div>
            <label htmlFor="hero-city" className={labelClass}>Location</label>
            <input id="hero-city" name="city" type="text" placeholder="City or municipality, e.g. Davao City" className={inputClass} />
          </div>

          <div>
            <label htmlFor="hero-min" className={labelClass}>Min rent (₱/month)</label>
            <input id="hero-min" name="minRent" type="number" inputMode="numeric" min="0" step="100" placeholder="2000" className={inputClass} />
          </div>

          <div>
            <label htmlFor="hero-max" className={labelClass}>Max rent (₱/month)</label>
            <input id="hero-max" name="maxRent" type="number" inputMode="numeric" min="0" step="100" placeholder="8000" className={inputClass} />
          </div>

          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Search
          </button>
        </form>
      </div>
    </HeroCarousel>
  );
}