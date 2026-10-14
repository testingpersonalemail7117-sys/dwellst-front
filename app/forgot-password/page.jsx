"use client";

import { useState } from "react";
import Link from "next/link";
import AuthCard from "../../components/auth/AuthCard";
import FormField from "../../components/auth/FormField";
import Alert from "../../components/ui/Alert";
import { btnPrimary } from "../../components/ui/style";
import { apiFetch, errorMessage, unwrap } from "../../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const d = unwrap(await apiFetch("/auth/forgot-password", { method: "POST", body: { email } }));
      setMessage(d?.message || "If that email is registered, a reset link has been sent.");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a link to reset it."
      footer={<Link href="/login" className="font-semibold text-primary underline hover:text-primary-hover">Back to log in</Link>}
    >
      {message ? (
        <Alert variant="success">{message}</Alert>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <FormField id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          {error && <Alert variant="error">{error}</Alert>}
          <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
            {submitting ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </AuthCard>
  );
}