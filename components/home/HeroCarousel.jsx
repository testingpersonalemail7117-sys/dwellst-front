"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// A full-width background carousel with the hero content (children) on top.
//   - changes by itself, with a cross-fade
//   - pauses on hover, while you use the search form, when the tab is hidden, or when you press Pause
//   - never autoplays for people who asked their device to reduce motion
//   - arrows, dots and swipe to change picture by hand
//
// slides: [{ src, alt, position }]  or placeholder slides: [{ placeholder: true, className }]
export default function HeroCarousel({ slides, interval = 5000, showHint = false, children }) {
  const count = slides.length;
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false); // the Pause button
  const [engaged, setEngaged] = useState(false); // mouse over the hero, or focus inside it
  const [tabHidden, setTabHidden] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [seen, setSeen] = useState(() => new Set([0, count > 1 ? 1 : 0])); // only load pictures that are about to show
  const touch = useRef(null);

  const playing = count > 1 && !paused && !engaged && !tabHidden && !reduceMotion;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const update = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // The timer restarts after every change, so a manual click never gets cut short.
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => setCurrent((c) => (c + 1) % count), interval);
    return () => clearTimeout(timer);
  }, [playing, current, count, interval]);

  useEffect(() => {
    setSeen((prev) => {
      const next = new Set(prev);
      next.add(current);
      next.add((current + 1) % count);
      return next;
    });
  }, [current, count]);

  const go = (index) => setCurrent((index + count) % count);

  function onTouchStart(e) {
    const t = e.touches[0];
    touch.current = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e) {
    if (!touch.current || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touch.current.x;
    const dy = t.clientY - touch.current.y;
    touch.current = null;
    // A clear sideways swipe (not a scroll)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(current + (dx < 0 ? 1 : -1));
  }

  const control = "flex h-11 w-11 items-center justify-center rounded-full text-white hover:bg-white/20";

  return (
    <section
      aria-label="Find a place to live"
      className="relative isolate overflow-hidden bg-primary"
      onPointerEnter={(e) => e.pointerType === "mouse" && setEngaged(true)}
      onPointerLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setEngaged(false);
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Pictures */}
      <div className="absolute inset-0 -z-10">
        {count === 0 ? (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-hover" />
        ) : (
          <div
            role="group"
            aria-roledescription="carousel"
            aria-label="Photos of places to rent"
            aria-live={playing ? "off" : "polite"}
            className="absolute inset-0"
          >
            {slides.map((slide, i) => (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${count}`}
                aria-hidden={i !== current}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out motion-reduce:transition-none ${
                  i === current ? "opacity-100" : "opacity-0"
                }`}
              >
                {slide.placeholder ? (
                  <div className={`h-full w-full bg-gradient-to-br ${slide.className}`}>
                    {showHint && (
                      <p className="absolute left-4 top-4 rounded-lg bg-surface/95 px-3 py-2 text-xs font-medium text-ink shadow-sm">
                        Vacant hero image {i + 1} of {count}. Add your photos in lib/heroImages.js (files go in public/hero/).
                      </p>
                    )}
                  </div>
                ) : (
                  seen.has(i) && <SlideImage slide={slide} eager={i === 0} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Darkens the picture so the white text stays easy to read on any photo */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/65 to-ink/80" />
      </div>

      {/* Hero content */}
      <div className="relative mx-auto flex min-h-[32rem] max-w-6xl flex-col justify-center px-4 pb-20 pt-12 sm:min-h-[36rem] lg:min-h-[42rem] lg:pb-24">
        {children}
      </div>

      {/* Controls */}
      {count > 1 && (
        <div className="absolute inset-x-0 bottom-4 flex justify-center px-4">
          <div role="group" aria-label="Photo controls" className="flex max-w-full flex-wrap items-center justify-center rounded-full bg-ink/60 px-1">
            <button type="button" onClick={() => go(current - 1)} aria-label="Previous photo" className={control}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <div className="flex items-center">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Show photo ${i + 1}`}
                  aria-current={i === current ? "true" : undefined}
                  className="flex h-11 w-6 items-center justify-center"
                >
                  <span className={`block rounded-full transition-all ${i === current ? "h-2.5 w-2.5 bg-white" : "h-2 w-2 bg-white/50"}`} />
                </button>
              ))}
            </div>

            <button type="button" onClick={() => go(current + 1)} aria-label="Next photo" className={control}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>

            {!reduceMotion && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? "Play slideshow" : "Pause slideshow"}
                aria-pressed={paused}
                className={control}
              >
                {paused ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

// Files in public/ use next/image (resized and compressed automatically).
// Full https:// links use a plain <img>, so no extra Next.js setup is needed for them.
function SlideImage({ slide, eager }) {
  const position = slide.position || "center";
  const isLocal = slide.src.startsWith("/") && !slide.src.startsWith("//");

  if (isLocal) {
    return (
      <Image
        src={slide.src}
        alt={slide.alt ?? ""}
        fill
        sizes="100vw"
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : "auto"}
        className="object-cover"
        style={{ objectPosition: position }}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={slide.src}
      alt={slide.alt ?? ""}
      loading={eager ? "eager" : "lazy"}
      className="absolute inset-0 h-full w-full object-cover"
      style={{ objectPosition: position }}
    />
  );
}