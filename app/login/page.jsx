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

function LoginForm() {
  const { user, login } = useAuth();
  const router = useRouter();
  const next = safeNext(useSearchParams().get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already signed in? Skip the form.
  useEffect(() => {
    if (user) router.replace(next);
  }, [user, next, router]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace(next);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Log in to save favorites and contact owners."
      footer={
        <>
          New to Dwellst?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className={linkClass}>
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <FormField id="email" label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormField id="password" label="Password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />

        <div className="text-right">
          <Link href="/forgot-password" className="text-sm text-primary underline hover:text-primary-hover">
            Forgot password?
          </Link>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <button type="submit" disabled={submitting} className={`${btnPrimary} w-full`}>
          {submitting ? "Logging in…" : "Log in"}
        </button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}