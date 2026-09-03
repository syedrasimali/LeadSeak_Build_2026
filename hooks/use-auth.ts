"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/* Translate Supabase error messages into copy that a user can act on.
   The client surfaces raw strings like "Invalid login credentials" which are
   fine for engineers but not for the people using the product. */
function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "No account matches that email and password. Check what you typed, or sign up if you are new.";
  }
  if (m.includes("email not confirmed")) {
    return "Check your inbox — we sent a confirmation link when you signed up.";
  }
  if (m.includes("user already registered")) {
    return "An account with this email already exists. Try signing in instead.";
  }
  if (m.includes("weak_password") || m.includes("weak password")) {
    if (m.includes("uppercase") || m.includes("lowercase") || m.includes("0123456789")) {
      return "Password must include at least one uppercase letter, one lowercase letter, and one number.";
    }
    return "That password is too easy to guess. Mix uppercase, lowercase, and numbers.";
  }
  if (m.includes("password")) {
    if (m.includes("too short") || m.includes("length")) {
      return "Password must be at least 6 characters.";
    }
    if (m.includes("commonly used") || m.includes("pwned")) {
      return "That password appears in known breaches. Please pick a different one.";
    }
  }
  if (m.includes("invalid email") || m.includes("email address_invalid")) {
    return "That email address doesn't look right.";
  }
  if (m.includes("too many") || m.includes("over_email_send_rate_limit")) {
    return "Too many attempts. Wait a minute and try again.";
  }
  if (
    m.includes("fetch") ||
    m.includes("network") ||
    m.includes("failed to fetch")
  ) {
    return "Could not reach the server. Check your connection and try again.";
  }
  return message || "Something went wrong. Please try again.";
}

type Status = "idle" | "loading" | "error";

interface AuthState {
  status: Status;
  message: string;
}

const INITIAL: AuthState = { status: "idle", message: "" };

function useSignIn(redirectTo = "/dashboard") {
  const router = useRouter();
  const [state, setState] = React.useState<AuthState>(INITIAL);

  async function submit(email: string, password: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setState({
        status: "error",
        message:
          "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-in.",
      });
      return;
    }
    setState({ status: "loading", message: "" });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setState({ status: "error", message: friendlyError(error.message ?? "") });
      return;
    }
    setState(INITIAL);
    router.push(redirectTo);
    router.refresh();
  }

  return { state, submit };
}

function useSignUp(redirectTo = "/dashboard") {
  const router = useRouter();
  const [state, setState] = React.useState<AuthState>(INITIAL);

  async function submit(email: string, password: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setState({
        status: "error",
        message:
          "Authentication is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable sign-up.",
      });
      return;
    }
    setState({ status: "loading", message: "" });
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setState({ status: "error", message: friendlyError(error.message ?? "") });
      return;
    }
    setState(INITIAL);
    router.push(redirectTo);
    router.refresh();
  }

  return { state, submit };
}

function useSignOut() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  async function signOut() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setLoading(false);
    router.push("/login");
    router.refresh();
  }

  return { signOut, loading };
}

function useResetPassword() {
  const [state, setState] = React.useState<AuthState>(INITIAL);

  async function submit(email: string) {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setState({
        status: "error",
        message: "Authentication is not configured.",
      });
      return;
    }
    setState({ status: "loading", message: "" });
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) {
      setState({ status: "error", message: friendlyError(error.message ?? "") });
      return;
    }
    setState({ status: "idle", message: "Check your email for a reset link." });
  }

  return { state, submit };
}

export { useSignIn, useSignUp, useSignOut, useResetPassword, friendlyError };
