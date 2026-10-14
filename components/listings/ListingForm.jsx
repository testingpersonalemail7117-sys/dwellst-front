"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch, errorMessage, unwrap } from "../../lib/api";
import { useToast } from "../../context/ToastContext";
import FormField from "../auth/FormField";
import Alert from "../ui/Alert";
import ImagePicker from "./ImagePicker";
import { btnOutline, btnPrimary } from "../ui/style";

const EMPTY = {
  title: "",
  description: "",
  propertyType: "room",
  monthlyRent: "",
  province: "",
  cityMunicipality: "",
  barangay: "",
  addressLine: "",
  latitude: "",
  longitude: "",
  bedrooms: "",
  bathrooms: "",
  availableUnits: "",
  amenities: [],
  availabilityStatus: "available",
  availableFrom: "",
};

const DETAIL_FIELDS = [
  ["bedrooms", "Bedrooms"],
  ["bathrooms", "Bathrooms"],
  ["availableUnits", "Available rooms or bedspaces"],
];

function toValues(l) {
  return {
    ...EMPTY,
    title: l.title,
    description: l.description,
    propertyType: l.propertyType ?? "room",
    monthlyRent: String(l.monthlyRent),
    province: l.province,
    cityMunicipality: l.city,
    barangay: l.barangay,
    addressLine: l.addressLine,
    latitude: l.latitude ?? "",
    longitude: l.longitude ?? "",
    bedrooms: l.bedrooms ?? "",
    bathrooms: l.bathrooms ?? "",
    availableUnits: l.availableUnits ?? "",
    amenities: l.amenities ?? [],
    availabilityStatus: l.status,
    availableFrom: l.availableFrom ?? "",
  };
}

const section = "space-y-4 rounded-xl border border-line bg-surface p-4 sm:p-6";
const legend = "px-2 text-base font-semibold text-ink";

// Create (no `listing`) or edit (`listing` given) form. `meta` comes from GET /api/v1/listings/meta.
export default function ListingForm({ meta, listing = null }) {
  const isEdit = Boolean(listing);
  const router = useRouter();
  const { toast } = useToast();
  const { limits } = meta;

  const [values, setValues] = useState(() => (listing ? toValues(listing) : EMPTY));
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [imageError, setImageError] = useState("");
  const [newFiles, setNewFiles] = useState([]);
  const [removedIds, setRemovedIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false); // blocks double submits before React re-renders
  const alertRef = useRef(null);
  const filesRef = useRef([]);

  useEffect(() => {
    filesRef.current = newFiles;
  }, [newFiles]);

  // Free the preview URLs when leaving the page.
  useEffect(() => () => filesRef.current.forEach((f) => URL.revokeObjectURL(f.preview)), []);

  const existing = listing?.images ?? [];
  const keptCount = existing.length - removedIds.length;
  const rules = meta.propertyTypes.find((t) => t.value === values.propertyType)?.fields ?? {};

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  function toggleAmenity(value) {
    setValues((v) => ({
      ...v,
      amenities: v.amenities.includes(value) ? v.amenities.filter((a) => a !== value) : [...v.amenities, value],
    }));
  }

  // ----- images -----
  function addFiles(list) {
    setImageError("");
    const accepted = [];
    let message = "";
    let slots = limits.maxImages - (keptCount + newFiles.length);
    const same = (a, b) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

    for (const file of list) {
      if (!limits.allowedMimeTypes.includes(file.type)) {
        message = `"${file.name}" is not a JPEG, PNG or WebP image.`;
        continue;
      }
      if (file.size > limits.maxImageSizeMb * 1024 * 1024) {
        message = `"${file.name}" is larger than ${limits.maxImageSizeMb} MB.`;
        continue;
      }
      if (newFiles.some((f) => same(f.file, file)) || accepted.some((f) => same(f.file, file))) continue;
      if (slots <= 0) {
        message = `You can add up to ${limits.maxImages} photos.`;
        break;
      }

      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
        file,
        preview: URL.createObjectURL(file),
      });
      slots -= 1;
    }

    if (accepted.length) setNewFiles((prev) => [...prev, ...accepted]);
    if (message) setImageError(message);
  }

  function removeNew(key) {
    setNewFiles((prev) => {
      const target = prev.find((f) => f.key === key);
      if (target) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.key !== key);
    });
    setImageError("");
  }

  function toggleExisting(id) {
    setRemovedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    setImageError("");
  }

  // ----- validation and submit -----
  function validate() {
    const e = {};
    const rent = Number(values.monthlyRent);

    if (values.title.trim().length < 5) e.title = "Enter a title of at least 5 characters";
    if (values.description.trim().length < 20) e.description = "Describe the place in at least 20 characters";

    if (values.monthlyRent === "" || !Number.isInteger(rent) || rent < 1) {
      e.monthlyRent = "Enter the monthly rent in whole pesos";
    } else if (rent > limits.maxMonthlyRent) {
      e.monthlyRent = `Monthly rent can be at most ₱${limits.maxMonthlyRent.toLocaleString("en-PH")}`;
    }

    if (values.province.trim().length < 2) e.province = "Enter the province";
    if (values.cityMunicipality.trim().length < 2) e.cityMunicipality = "Enter the city or municipality";

    for (const [field, label] of DETAIL_FIELDS) {
      if (rules[field] === "required" && String(values[field]).trim() === "") e[field] = `${label} is required`;
    }

    const hasLat = String(values.latitude).trim() !== "";
    const hasLng = String(values.longitude).trim() !== "";
    if (hasLat !== hasLng) e[hasLat ? "longitude" : "latitude"] = "Enter both coordinates, or neither";

    return e;
  }

  function buildFormData() {
    const fd = new FormData();

    ["title", "description", "propertyType", "monthlyRent", "province", "cityMunicipality", "barangay", "addressLine", "latitude", "longitude", "availabilityStatus", "availableFrom"].forEach((key) =>
      fd.append(key, String(values[key]).trim())
    );

    // Fields that don't apply to the chosen type are not sent (the server ignores them anyway).
    DETAIL_FIELDS.forEach(([key]) => {
      if (rules[key] !== "none") fd.append(key, String(values[key]).trim());
    });

    // An empty "amenities" value tells the server to clear the list when editing.
    if (values.amenities.length) values.amenities.forEach((a) => fd.append("amenities", a));
    else fd.append("amenities", "");

    newFiles.forEach((f) => fd.append("images", f.file, f.file.name));
    removedIds.forEach((id) => fd.append("removeImageIds", id));
    return fd;
  }

  function showError(message) {
    setFormError(message);
    setTimeout(() => alertRef.current?.focus(), 0);
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (submittingRef.current) return;

    const errors = validate();
    setFieldErrors(errors);
    setImageError("");

    const photos = keptCount + newFiles.length;
    let photoMessage = "";
    if (photos < limits.minImages) {
      photoMessage = `Add at least ${limits.minImages} photo${limits.minImages === 1 ? "" : "s"}.`;
      setImageError(photoMessage);
    }

    if (Object.keys(errors).length > 0 || photoMessage) {
      showError("Please fix the highlighted problems and try again.");
      return;
    }

    setFormError("");
    submittingRef.current = true;
    setSubmitting(true);
    let succeeded = false;

    try {
      const body = unwrap(
        await apiFetch(isEdit ? `/listings/${listing.id}` : "/listings", {
          method: isEdit ? "PATCH" : "POST",
          body: buildFormData(),
        })
      );

      succeeded = true;
      toast(isEdit ? "Listing updated" : "Your room is now posted", "success");
      router.push(`/listings/${body.id}`);
    } catch (err) {
      if (err.details?.length) {
        setFieldErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
        showError("Please fix the highlighted problems and try again.");
      } else {
        showError(errorMessage(err));
      }
    } finally {
      if (!succeeded) {
        submittingRef.current = false;
        setSubmitting(false);
      }
    }
  }

  const err = (name) => fieldErrors[name];

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      <div ref={alertRef} tabIndex={-1} className="outline-none">
        {formError && <Alert variant="error">{formError}</Alert>}
      </div>

      <fieldset className={section} disabled={submitting}>
        <legend className={legend}>Basics</legend>
        <FormField id="title" label="Title" value={values.title} onChange={set("title")} error={err("title")} maxLength={120} placeholder="e.g. Bright room near the university" />
        <FormField as="select" id="propertyType" label="Property type" value={values.propertyType} onChange={set("propertyType")} error={err("propertyType")}>
          {meta.propertyTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </FormField>
        <FormField id="monthlyRent" label="Monthly rent (₱)" type="number" inputMode="numeric" min="1" step="1" value={values.monthlyRent} onChange={set("monthlyRent")} error={err("monthlyRent")} />
        <FormField
          as="textarea"
          id="description"
          label="Description"
          value={values.description}
          onChange={set("description")}
          error={err("description")}
          hint={`${values.description.length} / 5000 characters. Mention house rules, deposit, nearby places and what is included.`}
          maxLength={5000}
          rows={6}
        />
      </fieldset>

      <fieldset className={section} disabled={submitting}>
        <legend className={legend}>Location</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="province" label="Province" value={values.province} onChange={set("province")} error={err("province")} />
          <FormField id="cityMunicipality" label="City or municipality" value={values.cityMunicipality} onChange={set("cityMunicipality")} error={err("cityMunicipality")} />
          <FormField id="barangay" label="Barangay (optional)" value={values.barangay} onChange={set("barangay")} error={err("barangay")} />
          <FormField id="addressLine" label="Street or landmark (optional)" value={values.addressLine} onChange={set("addressLine")} error={err("addressLine")} />
          <FormField id="latitude" label="Latitude (optional)" type="number" step="any" inputMode="decimal" value={values.latitude} onChange={set("latitude")} error={err("latitude")} />
          <FormField id="longitude" label="Longitude (optional)" type="number" step="any" inputMode="decimal" value={values.longitude} onChange={set("longitude")} error={err("longitude")} />
        </div>
      </fieldset>

      {DETAIL_FIELDS.some(([key]) => rules[key] !== "none") && (
        <fieldset className={section} disabled={submitting}>
          <legend className={legend}>Property details</legend>
          <div className="grid gap-4 sm:grid-cols-3">
            {DETAIL_FIELDS.map(([key, label]) =>
              rules[key] === "none" ? null : (
                <FormField
                  key={key}
                  id={key}
                  label={rules[key] === "required" ? `${label} (required)` : `${label} (optional)`}
                  type="number"
                  inputMode="numeric"
                  min={key === "availableUnits" ? 1 : 0}
                  step="1"
                  value={values[key]}
                  onChange={set(key)}
                  error={err(key)}
                />
              )
            )}
          </div>
        </fieldset>
      )}

      <fieldset className={section} disabled={submitting}>
        <legend className={legend}>Amenities</legend>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 md:grid-cols-3">
          {meta.amenities.map((a) => (
            <label key={a.value} className="flex min-h-11 items-center gap-3 text-sm text-ink">
              <input type="checkbox" checked={values.amenities.includes(a.value)} onChange={() => toggleAmenity(a.value)} className="h-5 w-5 accent-primary" />
              {a.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={section} disabled={submitting}>
        <legend className={legend}>Availability</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField as="select" id="availabilityStatus" label="Status" value={values.availabilityStatus} onChange={set("availabilityStatus")} error={err("availabilityStatus")}>
            {meta.availabilityStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </FormField>
          <FormField id="availableFrom" label="Available from (optional)" type="date" value={values.availableFrom} onChange={set("availableFrom")} error={err("availableFrom")} />
        </div>
      </fieldset>

      <ImagePicker
        existing={existing}
        removedIds={removedIds}
        newFiles={newFiles}
        onAdd={addFiles}
        onRemoveNew={removeNew}
        onToggleExisting={toggleExisting}
        limits={limits}
        error={imageError}
        disabled={submitting}
      />

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={submitting} className={btnPrimary}>
          {submitting ? (isEdit ? "Saving…" : "Publishing…") : isEdit ? "Save changes" : "Publish listing"}
        </button>
        <Link href={isEdit ? `/listings/${listing.id}` : "/owner/listings"} className={btnOutline}>
          Cancel
        </Link>
      </div>
    </form>
  );
}