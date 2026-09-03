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
import { friendlyError } from "@/hooks/use-auth";

type Status = "idle" | "loading" | "error";

export default function SignupPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<Status>("idle");
  const [message, setMessage] = React.useState("");

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

        <p className="text-caption text-content-muted">
          By creating an account you agree to the Terms of Service and Privacy
          Policy.
        </p>
      </form>
    </AuthShell>
  );
}
