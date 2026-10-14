"use client";

import { useState } from "react";

// Image carousel: arrow buttons, left/right arrow keys, and a thumbnail strip.
export default function Gallery({ images, title, unavailable = false }) {
  const [index, setIndex] = useState(0);
  const count = images.length;

  if (count === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-xl border border-line bg-primary-light text-sm text-muted">
        No photos yet
      </div>
    );
  }

  const go = (i) => setIndex((i + count) % count);

  function onKeyDown(e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    }
  }

  const current = images[index];
  const arrow =
    "absolute top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 text-ink shadow-sm hover:bg-surface";

  return (
    <section aria-roledescription="carousel" aria-label={`Photos of ${title}`} onKeyDown={onKeyDown}>
      <div className="relative overflow-hidden rounded-xl border border-line bg-primary-light" tabIndex={0}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={`${title}, photo ${index + 1} of ${count}`}
          className={`aspect-[4/3] w-full object-cover ${unavailable ? "grayscale" : ""}`}
        />

        {count > 1 && (
          <>
            <button type="button" onClick={() => go(index - 1)} aria-label="Previous photo" className={`${arrow} left-3`}>
              <span aria-hidden="true">‹</span>
            </button>
            <button type="button" onClick={() => go(index + 1)} aria-label="Next photo" className={`${arrow} right-3`}>
              <span aria-hidden="true">›</span>
            </button>
            <p
              aria-live="polite"
              className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-medium text-white"
            >
              {index + 1} / {count}
            </p>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img.id} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                className={`block overflow-hidden rounded-lg border-2 ${i === index ? "border-primary" : "border-transparent"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.thumbUrl} alt="" loading="lazy" className="h-16 w-24 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}