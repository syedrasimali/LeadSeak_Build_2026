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
import { useSignIn } from "@/hooks/use-auth";

function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const { state, submit } = useSignIn(redirectTo);

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
        disabled
        title="Social login arrives in a later phase"
      >
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
