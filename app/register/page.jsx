"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthCard from "../../components/auth/AuthCard";
import FormField from "../../components/auth/FormField";
import Alert from "../../components/ui/Alert";
import { btnPrimary } from "../../components/ui/style";
import { useAuth } from "../../context/AuthContext";
import { errorMessage } from "../../lib/api";
import { safeNext } from "../../lib/safe-next";

const linkClass = "font-semibold text-primary underline hover:text-primary-hover";

function RegisterForm() {
  const { user, register } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register(form.name, form.email, form.password);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="You'll need an account to save favorites and send inquiries."
      footer={
        <>
          Already have an account?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className={linkClass}>
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField id="name" label="Full name" autoComplete="name" required value={form.name} onChange={set("name")} />
        <FormField id="email" label="Email" type="email" autoComplete="email" required value={form.email} onChange={set("email")} />
        <FormField id="password" label="Password" type="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters" value={form.password} onChange={set("password")} />

        {error && <Alert variant="error">{error}</Alert>}

        <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
          {submitting ? "Creating account…" : "Sign up"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}