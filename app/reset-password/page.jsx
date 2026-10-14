"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AuthCard from "../../components/auth/AuthCard";
import FormField from "../../components/auth/FormField";
import Alert from "../../components/ui/Alert";
import { btnPrimary } from "../../components/ui/style";
import { apiFetch, errorMessage } from "@/lib/api";

function ResetForm() {
  const token = useSearchParams().get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError("Passwords don't match");
    setSubmitting(true);
    try {
      await apiFetch("/auth/reset-password", { method: "POST", body: { token, password } });
      setDone(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="Invalid reset link"
        footer={<Link href="/forgot-password" className="font-semibold text-primary underline hover:text-primary-hover">Request a new link</Link>}
      >
        <p className="text-sm text-muted">This link is missing its reset token.</p>
      </AuthCard>
    );
  }

  if (done) {
    return (
      <AuthCard title="Password updated" subtitle="You can now log in with your new password.">
        <Link href="/login" className={`${btnPrimary} w-full`}>
          Go to log in
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choose a new password">
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField id="password" label="New password" type="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
        <FormField id="confirm" label="Confirm new password" type="password" autoComplete="new-password" required value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {error && <Alert variant="error">{error}</Alert>}
        <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
          {submitting ? "Saving…" : "Update password"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}