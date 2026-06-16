import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getSubscription,
  paypalConfigured,
  planFromPayPalId,
} from "@/lib/paypal/client";
import { getAdaaxPricing } from "@/lib/settings";

/**
 * Called by the PayPal subscription button's onApprove. Verifies the subscription
 * server-side with PayPal, then records it against the logged-in user.
 * The source of truth stays in our DB; webhooks keep it updated afterwards.
 */
export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "payments_unconfigured" }, { status: 503 });
  }

  // Must be signed in (we link the subscription to this user).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { subscriptionId } = (await request.json().catch(() => ({}))) as {
    subscriptionId?: string;
  };
  if (!subscriptionId) {
    return NextResponse.json({ error: "missing_subscription_id" }, { status: 400 });
  }

  // Verify with PayPal.
  type PayPalSub = {
    status?: string;
    plan_id?: string;
    billing_info?: {
      next_billing_time?: string;
      last_payment?: { amount?: { value?: string } };
    };
  };
  let sub: PayPalSub;
  try {
    sub = (await getSubscription(subscriptionId)) as PayPalSub;
  } catch {
    return NextResponse.json({ error: "verify_failed" }, { status: 502 });
  }

  const status: string = sub?.status ?? "";
  if (!["ACTIVE", "APPROVED", "APPROVAL_PENDING"].includes(status)) {
    return NextResponse.json({ error: "not_active", status }, { status: 409 });
  }

  const plan = planFromPayPalId(sub?.plan_id ?? "") ?? "monthly";
  const periodEnd: string | null = sub?.billing_info?.next_billing_time ?? null;
  const pricing = await getAdaaxPricing();
  const chargedAmount = Number(
    sub?.billing_info?.last_payment?.amount?.value ??
      (plan === "yearly" ? pricing.yearly_usd : pricing.monthly_usd),
  );

  // Write with service role (bypasses RLS) after verifying identity above.
  const admin = createAdminClient();

  const { data: subscriptionRow, error: upsertErr } = await admin
    .from("subscriptions")
    .upsert(
      {
        user_id: user.id,
        plan,
        status: status === "ACTIVE" ? "active" : "pending",
        provider: "paypal",
        paypal_subscription_id: subscriptionId,
        current_period_end: periodEnd,
      },
      { onConflict: "paypal_subscription_id" },
    )
    .select("id")
    .single();

  if (upsertErr) {
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // Record the purchase in history (idempotent on paypal_order_id = subscription id).
  const { data: orderRow } = await admin
    .from("orders")
    .upsert(
      {
        user_id: user.id,
        type: "subscription",
        items: [{ name: `اشتراك AdaaX (${plan === "yearly" ? "سنوي" : "شهري"})` }],
        amount: chargedAmount,
        currency: "USD",
        status: status === "ACTIVE" ? "paid" : "pending",
        provider: "paypal",
        paypal_order_id: subscriptionId,
      },
      { onConflict: "paypal_order_id" },
    )
    .select("id")
    .maybeSingle();

  return NextResponse.json({
    ok: true,
    subscriptionId: subscriptionRow?.id,
    orderId: orderRow?.id,
  });
}
