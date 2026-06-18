import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSubscriptionActive } from "@/lib/subscriptions/status";
import { verifyLicenseToken } from "@/lib/license/jwt";

export type ValidateReason =
  | "token_invalid"
  | "hwid_mismatch"
  | "device_unbound"
  | "no_subscription"
  | "subscription_expired"
  | "banned";

export type ValidateResult = {
  valid: boolean;
  reason?: ValidateReason;
  admin?: boolean;
  plan?: string | null;
  currentPeriodEnd?: string | null;
};

type SubRow = { id: string; plan: string; status: string; current_period_end: string | null };

/**
 * Find the user's currently-active subscription (the one with the furthest
 * future period end). Returns null if none is active. A user can have stale
 * expired rows, so we can't just take "the latest".
 */
export async function resolveActiveSubscription(
  db: SupabaseClient,
  userId: string,
): Promise<SubRow | null> {
  const { data } = await db
    .from("subscriptions")
    .select("id, plan, status, current_period_end")
    .eq("user_id", userId)
    .returns<SubRow[]>();
  const active = (data ?? [])
    .filter((s) => isSubscriptionActive(s))
    .sort(
      (a, b) =>
        new Date(b.current_period_end ?? 0).getTime() -
        new Date(a.current_period_end ?? 0).getTime(),
    );
  return active[0] ?? null;
}

/**
 * Validate a device license token against the live source of truth.
 * Called on every app launch. The token is only a credential — access is decided
 * here by the live subscription + device row, so revocation (admin rebind / cancel)
 * takes effect on the next launch.
 */
export async function validateLicenseToken(
  token: string,
  hwid: string,
  meta?: { ip?: string | null },
): Promise<ValidateResult> {
  const claims = await verifyLicenseToken(token);
  if (!claims) return { valid: false, reason: "token_invalid" };
  if (claims.hwid !== hwid) return { valid: false, reason: "hwid_mismatch" };

  const db = createAdminClient();

  // Admin/owner bypass — licensed as long as the account is still an admin.
  if (claims.role === "admin") {
    const { data: profile } = await db
      .from("profiles")
      .select("role, banned")
      .eq("id", claims.sub)
      .maybeSingle();
    if (!profile || profile.role !== "admin") {
      return { valid: false, reason: "no_subscription" };
    }
    if (profile.banned) return { valid: false, reason: "banned" };
    return { valid: true, admin: true };
  }

  // Subscriber: the bound device row must still exist + match, sub must be active.
  if (!claims.did || !claims.sid) return { valid: false, reason: "token_invalid" };

  const { data: device } = await db
    .from("license_devices")
    .select("id, hwid_hash, subscription_id")
    .eq("id", claims.did)
    .maybeSingle();
  if (!device) return { valid: false, reason: "device_unbound" };
  if (device.hwid_hash !== hwid) return { valid: false, reason: "hwid_mismatch" };

  const { data: sub } = await db
    .from("subscriptions")
    .select("id, plan, status, current_period_end")
    .eq("id", device.subscription_id)
    .maybeSingle<SubRow>();

  if (!isSubscriptionActive(sub)) {
    return {
      valid: false,
      reason: sub ? "subscription_expired" : "no_subscription",
      plan: sub?.plan ?? null,
      currentPeriodEnd: sub?.current_period_end ?? null,
    };
  }

  // Heartbeat — record last seen for the admin panel.
  await db
    .from("license_devices")
    .update({ last_seen_at: new Date().toISOString(), last_ip: meta?.ip ?? null })
    .eq("id", device.id);

  return { valid: true, plan: sub!.plan, currentPeriodEnd: sub!.current_period_end };
}
