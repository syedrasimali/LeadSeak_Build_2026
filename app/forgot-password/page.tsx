"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { AuthShell } from "@/components/layout/auth-shell";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks/use-auth";

export default function ForgotPasswordPage() {
  const { state, submit } = useResetPassword();

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    if (!email) return;
    await submit(email);
  }

  const success = state.status === "idle" && state.message !== "";

  return (
    <AuthShell
      title="Reset your password"
      description="Enter your email and we'll send you a reset link."
      footer={
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 font-medium text-electric-400 underline-offset-4 hover:text-electric-300 hover:underline"
        >
          <ArrowLeft className="size-3.5" />
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            disabled={state.status === "loading" || success}
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

        {success && (
          <p
            role="status"
            className="rounded-md border border-success/28 bg-success/[0.08] px-3 py-2 text-caption text-success-soft"
          >
            {state.message}
          </p>
        )}

        <Button
          type="submit"
          fullWidth
          size="lg"
          className="mt-1 shimmer-btn"
          loading={state.status === "loading"}
          disabled={success}
        >
          {success ? "Link sent" : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
