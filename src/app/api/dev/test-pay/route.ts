import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdaaxPricing } from "@/lib/settings";

/**
 * ⚠️ TEST-ONLY payment simulator. Lets us exercise the full post-payment flow
 * without the real PayPal widget (which is blocked on some networks/regions).
 *
 * Gated by NEXT_PUBLIC_ENABLE_TEST_PAY — set it to "" / remove it (and delete this
 * folder + the "تجربة الدفع" buttons) to fully disable before going live.
 */
function testPayEnabled() {
  return process.env.NEXT_PUBLIC_ENABLE_TEST_PAY === "true";
}

export async function POST(request: Request) {
  if (!testPayEnabled()) {
    return NextResponse.json({ error: "disabled" }, { status: 404 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = (await request.json().catch(() => ({}))) as {
    kind?: string;
    plan?: string;
    items?: unknown[];
    amount?: number;
    currency?: string;
    couponId?: string;
  };
  const admin = createAdminClient();

  // ── Simulate an AdaaX subscription payment ──
  if (body.kind === "subscription") {
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const end = new Date();
    if (plan === "yearly") end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);

    const pricing = await getAdaaxPricing();
    const testId = `TEST-${user.id}`; // one test subscription per user (idempotent)

    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan,
        status: "active",
        provider: "test",
        paypal_subscription_id: testId,
        current_period_end: end.toISOString(),
        cancel_at_period_end: false,
        canceled_at: null,
      },
      { onConflict: "paypal_subscription_id" },
    );
    if (error) {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    const { data: orderRow } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        type: "subscription",
        items: [
          { name: `اشتراك AdaaX (${plan === "yearly" ? "سنوي" : "شهري"}) — تجربة` },
        ],
        amount: plan === "yearly" ? pricing.yearly_usd : pricing.monthly_usd,
        currency: "USD",
        status: "paid",
        provider: "test",
        paypal_order_id: `TEST-SUB-${user.id}-${Date.now()}`,
      })
      .select("id")
      .single();

    return NextResponse.json({ ok: true, orderId: orderRow?.id });
  }

  // ── Simulate a one-time package/cart payment ──
  if (body.kind === "order") {
    let orderId: string | undefined;
    if (user) {
      const { data: orderRow } = await admin
        .from("orders")
        .insert({
          user_id: user.id,
          type: "package",
          items: Array.isArray(body.items) ? body.items : [],
          amount: Number(body.amount) || 0,
          currency: body.currency || "USD",
          status: "paid",
          provider: "test",
          paypal_order_id: `TEST-ORD-${user.id}-${Date.now()}`,
          coupon_id: body.couponId ?? null,
        })
        .select("id")
        .single();
      orderId = orderRow?.id;

      // Record coupon redemption + bump usage (low-concurrency read-modify-write).
      if (orderId && body.couponId) {
        await admin.from("coupon_redemptions").insert({
          coupon_id: body.couponId,
          user_id: user.id,
          order_id: orderId,
        });
        const { data: c } = await admin
          .from("coupons")
          .select("used_count")
          .eq("id", body.couponId)
          .maybeSingle();
        if (c) {
          await admin
            .from("coupons")
            .update({ used_count: (c.used_count ?? 0) + 1 })
            .eq("id", body.couponId);
        }
      }
    }
    // Succeed regardless so the success screen shows even for guest checkout.
    return NextResponse.json({ ok: true, orderId });
  }

  return NextResponse.json({ error: "bad_kind" }, { status: 400 });
}
