import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * OAuth (Google/Discord) + email-confirmation redirect target.
 * Exchanges the `code` for a session cookie, then sends the user on.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // Only allow internal relative redirects to avoid open-redirect abuse.
  const raw = searchParams.get("redirect") ?? "/account";
  const redirectTo = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
