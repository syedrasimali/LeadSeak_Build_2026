import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export async function proxy(request: NextRequest) {
  // When Supabase credentials are not configured we let every request through
  // so the UI remains usable in development. Auth is only enforced when the
  // project is wired up to a real Supabase instance.
  if (!isSupabaseConfigured()) {
    return NextResponse.next();
  }

  // Refresh the session so downstream code sees a current user. This also
  // writes any refreshed auth cookies onto the response.
  const { response, supabase } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Protect every route under /dashboard. The proxy only performs a redirect —
  // the actual session is validated again server-side by createClient() inside
  // the route, so a stale cookie cannot grant access.
  if (pathname.startsWith("/dashboard")) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
