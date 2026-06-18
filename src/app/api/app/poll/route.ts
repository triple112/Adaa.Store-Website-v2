import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { signLicenseToken, licenseConfigured } from "@/lib/license/jwt";
import { isSubscriptionActive } from "@/lib/subscriptions/status";

/**
 * Step 3 of the device-link flow (polled by the desktop app after it opens the
 * browser). When the user has approved, we bind the device here — this is where
 * we know the device_label the app reports — sign the license token, and mark the
 * code consumed (single use). Requiring the matching HWID means a web visitor who
 * only saw the code can't retrieve the token.
 */
export const dynamic = "force-dynamic";

type PollResponse =
  | { status: "pending" }
  | { status: "expired" }
  | { status: "denied"; reason: string }
  | {
      status: "approved";
      token: string;
      admin?: boolean;
      plan?: string | null;
      currentPeriodEnd?: string | null;
    };

export async function POST(request: Request) {
  if (!licenseConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    code?: string;
    hwid?: string;
    deviceLabel?: string;
  };
  const code = (body.code || "").trim().toUpperCase();
  const hwid = (body.hwid || "").trim();
  if (!code || !hwid) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: link } = await db
    .from("device_link_codes")
    .select("id, status, expires_at, hwid_hash, user_id, subscription_id")
    .eq("code", code)
    .maybeSingle();

  if (!link) return json({ status: "expired" });
  if (link.status === "consumed") return json({ status: "expired" });
  if (new Date(link.expires_at) < new Date()) {
    await db.from("device_link_codes").update({ status: "expired" }).eq("id", link.id);
    return json({ status: "expired" });
  }
  if (link.status === "pending") return json({ status: "pending" });
  // status === "approved" past here.

  // The polling device must be the one that requested the code.
  if (link.hwid_hash !== hwid) return json({ status: "denied", reason: "hwid_mismatch" });
  if (!link.user_id) return json({ status: "denied", reason: "no_subscription" });

  const { data: profile } = await db
    .from("profiles")
    .select("role, banned")
    .eq("id", link.user_id)
    .maybeSingle();
  if (!profile || profile.banned) return json({ status: "denied", reason: "banned" });

  // ── Admin/owner token (no subscription, no device row) ──
  if (profile.role === "admin") {
    const token = await signLicenseToken({ sub: link.user_id, hwid, role: "admin" });
    await consume(db, link.id);
    return json({ status: "approved", token, admin: true });
  }

  // ── Subscriber: re-check the subscription is still active ──
  if (!link.subscription_id) return json({ status: "denied", reason: "no_subscription" });
  const { data: sub } = await db
    .from("subscriptions")
    .select("id, plan, status, current_period_end")
    .eq("id", link.subscription_id)
    .maybeSingle();
  if (!isSubscriptionActive(sub)) {
    return json({ status: "denied", reason: "subscription_expired" });
  }

  // Bind the device (one per subscription). Reuse the row if the same HWID re-links.
  const { data: existing } = await db
    .from("license_devices")
    .select("id, hwid_hash")
    .eq("subscription_id", link.subscription_id)
    .maybeSingle();

  let deviceId: string;
  if (existing) {
    if (existing.hwid_hash !== hwid) return json({ status: "denied", reason: "another_device" });
    await db
      .from("license_devices")
      .update({ device_label: body.deviceLabel ?? null, bound_at: new Date().toISOString() })
      .eq("id", existing.id);
    deviceId = existing.id;
  } else {
    const { data: inserted, error: insErr } = await db
      .from("license_devices")
      .insert({
        subscription_id: link.subscription_id,
        user_id: link.user_id,
        hwid_hash: hwid,
        device_label: body.deviceLabel ?? null,
      })
      .select("id")
      .single();
    if (insErr || !inserted) return json({ status: "denied", reason: "another_device" });
    deviceId = inserted.id;
  }

  const token = await signLicenseToken({
    sub: link.user_id,
    hwid,
    sid: link.subscription_id,
    did: deviceId,
  });
  await consume(db, link.id);

  return json({
    status: "approved",
    token,
    plan: sub!.plan,
    currentPeriodEnd: sub!.current_period_end,
  });
}

function json(r: PollResponse) {
  return NextResponse.json(r);
}

async function consume(db: ReturnType<typeof createAdminClient>, id: string) {
  await db.from("device_link_codes").update({ status: "consumed" }).eq("id", id);
}
