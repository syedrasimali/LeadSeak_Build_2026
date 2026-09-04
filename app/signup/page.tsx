"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, Lock, Mail, User } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { friendlyError, useGoogleAuth } from "@/hooks/use-auth";

type Status = "idle" | "loading" | "error";

export default function SignupPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState("");
  const { signInWithGoogle, loading: googleLoading } = useGoogleAuth();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("name") ?? "").trim();
    const company = String(form.get("company") ?? "").trim();

    if (!email || !password) return;

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setStatus("error");
      setMessage(
        "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-up."
      );
      return;
    }

    setStatus("loading");
    setMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName || null,
          company: company || null,
        },
      },
    });

    if (error) {
      setStatus("error");
      setMessage(friendlyError(error.message ?? ""));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const loading = status === "loading";

  return (
    <AuthShell
      title="Create your workspace"
      description="100 leads included. No card required."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-electric-400 underline-offset-4 hover:text-electric-300 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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

        <div className="flex items-center gap-3 py-1">
          <Separator className="flex-1" />
          <span className="shrink-0 text-caption text-content-muted">or</span>
          <Separator className="flex-1" />
        </div>

        <Field label="Full name" htmlFor="name">
          <Input
            id="name"
            name="name"
            placeholder="Alex Rivera"
            autoComplete="name"
            leadingIcon={<User />}
            disabled={loading}
          />
        </Field>

        <Field
          label="Company"
          htmlFor="company"
          hint="Used to name your workspace."
        >
          <Input
            id="company"
            name="company"
            placeholder="Northwind Studio"
            autoComplete="organization"
            leadingIcon={<Building2 />}
            disabled={loading}
          />
        </Field>

        <Field label="Work email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@company.com"
            autoComplete="email"
            leadingIcon={<Mail />}
            invalid={status === "error"}
            disabled={loading}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          hint="At least 6 characters, with uppercase, lowercase, and a number."
        >
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••••"
            autoComplete="new-password"
            leadingIcon={<Lock />}
            invalid={status === "error"}
            disabled={loading}
          />
        </Field>

        {status === "error" && message && (
          <p
            role="alert"
            className="rounded-md border border-danger/28 bg-danger/[0.08] px-3 py-2 text-caption text-danger-soft"
          >
            {message}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-1 shimmer-btn"
          loading={loading}
        >
          Create account
        </Button>

        <p className="text-caption text-content-muted">
          By creating an account you agree to the Terms of Service and Privacy
          Policy.
        </p>
      </form>
    </AuthShell>
  );
}
