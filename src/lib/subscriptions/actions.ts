"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paypalConfigured, paypalFetch } from "@/lib/paypal/client";

/**
 * User-initiated cancellation. Stops auto-renew at PayPal but the user keeps
 * access until current_period_end (we only flag cancel_at_period_end).
 */
export async function cancelSubscription(): Promise<{ ok?: true; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "unauthorized" };

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("id, paypal_subscription_id")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sub?.paypal_subscription_id) return { error: "no_subscription" };

  // Test/simulated subscriptions have no real PayPal subscription to cancel.
  const isTest = sub.paypal_subscription_id.startsWith("TEST-");

  if (paypalConfigured() && !isTest) {
    const res = await paypalFetch(
      `/v1/billing/subscriptions/${sub.paypal_subscription_id}/cancel`,
      { method: "POST", json: { reason: "Cancelled by user" } },
    );
    // 204 = success. 422 = already cancelled/not active → treat as already done.
    if (!res.ok && res.status !== 422) {
      return { error: "paypal_cancel_failed" };
    }
  }

  const admin = createAdminClient();
  await admin
    .from("subscriptions")
    .update({ cancel_at_period_end: true, canceled_at: new Date().toISOString() })
    .eq("id", sub.id);

  revalidatePath("/account");
  return { ok: true };
}
