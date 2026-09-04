"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Mail } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useSignIn, useGoogleAuth } from "@/hooks/use-auth";

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const { state, submit } = useSignIn(redirectTo);
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) return;
    await submit(email, password);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <Field label="Work email" htmlFor="email">
        <Input
          id="email"
          name="email"
          type="email"
          required
          placeholder="you@company.com"
          autoComplete="email"
          leadingIcon={<Mail />}
          invalid={state.status === "error"}
          disabled={state.status === "loading"}
        />
      </Field>

      <Field label="Password" htmlFor="password">
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="••••••••••"
          autoComplete="current-password"
          leadingIcon={<Lock />}
          invalid={state.status === "error"}
          disabled={state.status === "loading"}
        />
      </Field>

      {state.status === "error" && state.message && (
        <p
          role="alert"
          className="rounded-md border border-danger/28 bg-danger/[0.08] px-3 py-2 text-caption text-danger-soft"
        >
          {state.message}
        </p>
      )}

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-caption text-content-secondary">
          <input
            type="checkbox"
            name="remember"
            className="size-3.5 rounded-xs border-line-strong bg-surface accent-electric-500"
          />
          Remember me
        </label>
        <Link
          href="/forgot-password"
          className="text-caption font-medium text-electric-400 underline-offset-4 hover:underline"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        fullWidth
        size="lg"
        className="mt-1 shimmer-btn"
        loading={state.status === "loading"}
      >
        Sign in
      </Button>

      <div className="flex items-center gap-3 py-1">
        <Separator />
        <span className="shrink-0 text-caption text-content-muted">or</span>
        <Separator />
      </div>

      <Button
        type="button"
        variant="secondary"
        fullWidth
        size="lg"
        onClick={signInWithGoogle}
        loading={googleLoading}
      >
        <svg aria-hidden className="size-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in to LeadSeak"
      description="Pick up where your pipeline left off."
      footer={
        <>
          New to LeadSeak?{" "}
          <Link
            href="/signup"
            className="font-medium text-electric-400 underline-offset-4 hover:text-electric-300 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <Suspense>
        <SignInForm />
      </Suspense>
    </AuthShell>
  );
}
