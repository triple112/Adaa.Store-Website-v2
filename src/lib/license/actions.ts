"use server";

import { requireUser } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveActiveSubscription } from "@/lib/license/validate";

export type ApproveReason =
  | "invalid_code"
  | "expired"
  | "already_used"
  | "no_subscription"
  | "another_device"
  | "banned"
  | "db_error";

export type ApproveResult = { ok?: true; reason?: ApproveReason };

/**
 * Step 2 of the device-link flow: the logged-in user approves binding a device.
 * Runs as a Server Action on the website (authenticated). We don't issue the
 * token here — the desktop app polls /api/app/poll for it after approval (proving
 * HWID possession). We do the "one device per subscription" conflict pre-check
 * here so the user sees a clear error on the page.
 */
export async function approveDeviceLink(code: string): Promise<ApproveResult> {
  const user = await requireUser(`/link?code=${code}`);
  const db = createAdminClient();

  const { data: link } = await db
    .from("device_link_codes")
    .select("id, status, expires_at, hwid_hash")
    .eq("code", code)
    .maybeSingle();

  if (!link) return { reason: "invalid_code" };
  if (link.status === "consumed") return { reason: "already_used" };
  if (new Date(link.expires_at) < new Date()) {
    await db.from("device_link_codes").update({ status: "expired" }).eq("id", link.id);
    return { reason: "expired" };
  }

  const { data: profile } = await db
    .from("profiles")
    .select("role, banned")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.banned) return { reason: "banned" };
  const isAdmin = profile?.role === "admin";

  let subscriptionId: string | null = null;
  if (!isAdmin) {
    const sub = await resolveActiveSubscription(db, user.id);
    if (!sub) return { reason: "no_subscription" };
    subscriptionId = sub.id;

    // One device per subscription: reject if a *different* HWID is already bound.
    const { data: existing } = await db
      .from("license_devices")
      .select("hwid_hash")
      .eq("subscription_id", subscriptionId)
      .maybeSingle();
    if (existing && existing.hwid_hash !== link.hwid_hash) {
      return { reason: "another_device" };
    }
  }

  const { error } = await db
    .from("device_link_codes")
    .update({ status: "approved", user_id: user.id, subscription_id: subscriptionId })
    .eq("id", link.id);
  if (error) return { reason: "db_error" };

  return { ok: true };
}
