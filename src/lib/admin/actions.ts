"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/dal";
import { createAdminClient } from "@/lib/supabase/admin";
import { paypalConfigured, paypalFetch } from "@/lib/paypal/client";

type Result = { ok?: true; error?: string };

export type CouponInput = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_amount: number;
  max_uses: number | null;
  applies_to: "all" | "packages" | "subscription";
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
};

// ─── Coupons ─────────────────────────────────────────────────────────────────
export async function createCoupon(input: CouponInput): Promise<Result> {
  const admin = await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("coupons").insert({
    code: input.code.trim().toUpperCase(),
    type: input.type,
    value: input.value,
    min_amount: input.min_amount || 0,
    max_uses: input.max_uses,
    applies_to: input.applies_to,
    starts_at: input.starts_at,
    expires_at: input.expires_at,
    active: input.active,
    created_by: admin.id,
  });
  if (error) {
    return { error: error.code === "23505" ? "الكود موجود بالفعل" : "تعذّر إنشاء الكوبون" };
  }
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function updateCoupon(id: string, input: CouponInput): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("coupons")
    .update({
      code: input.code.trim().toUpperCase(),
      type: input.type,
      value: input.value,
      min_amount: input.min_amount || 0,
      max_uses: input.max_uses,
      applies_to: input.applies_to,
      starts_at: input.starts_at,
      expires_at: input.expires_at,
      active: input.active,
    })
    .eq("id", id);
  if (error) return { error: "تعذّر تحديث الكوبون" };
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function toggleCoupon(id: string, active: boolean): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("coupons").update({ active }).eq("id", id);
  if (error) return { error: "تعذّر التغيير" };
  revalidatePath("/admin/coupons");
  return { ok: true };
}

export async function deleteCoupon(id: string): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("coupons").delete().eq("id", id);
  if (error) return { error: "تعذّر الحذف" };
  revalidatePath("/admin/coupons");
  return { ok: true };
}

// ─── Subscriptions ───────────────────────────────────────────────────────────
export async function extendSubscription(id: string, days: number): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { data: sub } = await db
    .from("subscriptions")
    .select("current_period_end")
    .eq("id", id)
    .maybeSingle();

  const base =
    sub?.current_period_end && new Date(sub.current_period_end) > new Date()
      ? new Date(sub.current_period_end)
      : new Date();
  base.setDate(base.getDate() + days);

  const { error } = await db
    .from("subscriptions")
    .update({ current_period_end: base.toISOString(), status: "active" })
    .eq("id", id);
  if (error) return { error: "تعذّر التمديد" };
  revalidatePath("/admin/subscriptions");
  return { ok: true };
}

export async function adminCancelSubscription(id: string): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();

  const { data: sub } = await db
    .from("subscriptions")
    .select("paypal_subscription_id")
    .eq("id", id)
    .maybeSingle();

  // Cancel the real PayPal subscription too (skip test/simulated ones).
  const payId = sub?.paypal_subscription_id;
  if (payId && !payId.startsWith("TEST-") && paypalConfigured()) {
    await paypalFetch(`/v1/billing/subscriptions/${payId}/cancel`, {
      method: "POST",
      json: { reason: "Cancelled by admin" },
    }).catch(() => undefined);
  }

  const { error } = await db
    .from("subscriptions")
    .update({ status: "canceled", canceled_at: new Date().toISOString(), cancel_at_period_end: true })
    .eq("id", id);
  if (error) return { error: "تعذّر الإلغاء" };
  revalidatePath("/admin/subscriptions");
  return { ok: true };
}

/** Unbind the device so the customer can re-activate AdaaX on a new machine. */
export async function rebindDevice(subscriptionId: string): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("license_devices")
    .delete()
    .eq("subscription_id", subscriptionId);
  if (error) return { error: "تعذّر فك الربط" };
  revalidatePath("/admin/subscriptions");
  return { ok: true };
}

// ─── Users ───────────────────────────────────────────────────────────────────
export async function setUserBanned(id: string, banned: boolean): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("profiles").update({ banned }).eq("id", id);
  if (error) return { error: "تعذّر التغيير" };
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserRole(id: string, role: "user" | "admin"): Promise<Result> {
  const me = await requireAdmin();
  if (me.id === id && role !== "admin") {
    return { error: "مينفعش تنزّل صلاحية نفسك" };
  }
  const db = createAdminClient();
  const { error } = await db.from("profiles").update({ role }).eq("id", id);
  if (error) return { error: "تعذّر التغيير" };
  revalidatePath("/admin/users");
  return { ok: true };
}

// ─── Settings (pricing) ───────────────────────────────────────────────────────
export async function updatePricing(input: {
  monthly_usd: number;
  yearly_usd: number;
  yearly_discount_pct: number;
}): Promise<Result> {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("app_settings")
    .update({
      value: {
        currency: "USD",
        monthly_usd: input.monthly_usd,
        yearly_usd: input.yearly_usd,
        yearly_discount_pct: input.yearly_discount_pct,
      },
    })
    .eq("key", "adaax_pricing");
  if (error) return { error: "تعذّر حفظ الأسعار" };
  revalidatePath("/admin/settings");
  revalidatePath("/adaax");
  return { ok: true };
}
