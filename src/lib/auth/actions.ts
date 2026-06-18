"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildAuthConfirmLink } from "@/lib/auth/links";
import { sendPasswordReset } from "@/lib/email/send";

/** Sign the current user out and send them home. */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/**
 * Sends a branded password-reset email via Hostinger. Always reports success
 * (no account enumeration) even if the email isn't registered.
 */
export async function requestPasswordReset(email: string): Promise<{ ok: true }> {
  const clean = email.trim().toLowerCase();
  if (clean) {
    try {
      const link = await buildAuthConfirmLink("recovery", clean, "/reset-password");
      if (link) await sendPasswordReset(clean, link);
    } catch {
      /* swallow — never reveal whether the account exists */
    }
  }
  return { ok: true };
}
