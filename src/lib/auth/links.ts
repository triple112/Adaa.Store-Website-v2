import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://adaa.store";

/**
 * Mint a one-time auth link (magic login / password recovery) that we deliver
 * ourselves via Hostinger. Uses the token_hash + /auth/confirm flow so the
 * session is established server-side (cookies) — the reliable SSR pattern.
 */
export async function buildAuthConfirmLink(
  type: "magiclink" | "recovery",
  email: string,
  next: string,
): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.generateLink({
    type,
    email,
    options: { redirectTo: `${SITE}${next}` },
  });
  const tokenHash = data?.properties?.hashed_token;
  if (error || !tokenHash) return null;
  return `${SITE}/auth/confirm?token_hash=${tokenHash}&type=${type}&next=${encodeURIComponent(next)}`;
}
