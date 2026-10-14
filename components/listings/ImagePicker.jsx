"use client";

import { btnOutline } from "../ui/style";

const smallButton =
  "mt-2 inline-flex h-11 w-full items-center justify-center rounded-lg border border-line bg-surface px-3 text-xs font-semibold text-ink hover:bg-primary-light disabled:opacity-60";

// Controlled by ListingForm: saved photos (edit), newly chosen photos with previews, and removal of either.
export default function ImagePicker({
  existing = [],
  removedIds,
  newFiles,
  onAdd,
  onRemoveNew,
  onToggleExisting,
  limits,
  error,
  disabled,
}) {
  const total = existing.length - removedIds.length + newFiles.length;
  const full = total >= limits.maxImages;

  return (
    <fieldset className="rounded-xl border border-line bg-surface p-4 sm:p-6">
      <legend className="px-2 text-base font-semibold text-ink">Photos</legend>

      <p id="photos-hint" className="text-sm text-muted">
        Add up to {limits.maxImages} photos (JPEG, PNG or WebP, {limits.maxImageSizeMb} MB each).{" "}
        <span aria-live="polite">
          {total} of {limits.maxImages} selected.
        </span>
      </p>

      {existing.length + newFiles.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {existing.map((img) => {
            const removed = removedIds.includes(img.id);
            return (
              <li key={img.id}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbUrl}
                  alt="Saved photo"
                  className={`aspect-[4/3] w-full rounded-lg object-cover ${removed ? "opacity-40" : ""}`}
                />
                {removed && <p className="mt-1 text-xs font-medium text-error">Will be removed when you save</p>}
                <button type="button" onClick={() => onToggleExisting(img.id)} disabled={disabled} className={smallButton}>
                  {removed ? "Undo remove" : "Remove"}
                  <span className="sr-only"> saved photo</span>
                </button>
              </li>
            );
          })}

          {newFiles.map((f, i) => (
            <li key={f.key}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={f.preview} alt={`New photo ${i + 1}`} className="aspect-[4/3] w-full rounded-lg object-cover" />
              <p className="mt-1 text-xs text-muted">New, not published yet</p>
              <button type="button" onClick={() => onRemoveNew(f.key)} disabled={disabled} className={smallButton}>
                Remove
                <span className="sr-only"> new photo {i + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <input
          id="photos"
          type="file"
          accept={limits.allowedMimeTypes.join(",")}
          multiple
          disabled={disabled || full}
          onChange={(e) => {
            onAdd(Array.from(e.target.files || []));
            e.target.value = "";
          }}
          aria-describedby="photos-hint"
          className="peer sr-only"
        />
        <label
          htmlFor="photos"
          className={`${btnOutline} cursor-pointer peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary peer-disabled:cursor-not-allowed peer-disabled:opacity-60`}
        >
          {full ? "Photo limit reached" : "Add photos"}
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm font-medium text-error">
          {error}
        </p>
      )}
    </fieldset>
  );
}