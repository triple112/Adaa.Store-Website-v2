import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdaaxPricing } from "@/lib/settings";
import { finalizeGuestOrder } from "@/lib/orders/finalize";
import { sendSubscriptionConfirmation } from "@/lib/email/send";

/**
 * ⚠️ TEST-ONLY payment simulator. Lets us exercise the full post-payment flow
 * (orders, silent guest accounts, emails) without the real PayPal widget.
 *
 * Gated by NEXT_PUBLIC_ENABLE_TEST_PAY — unset it (and delete this folder + the
 * "تجربة الدفع" buttons) to fully disable before going live.
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
    email?: string;
    name?: string;
    phone?: string;
    couponId?: string;
  };

  // ── Simulate an AdaaX subscription payment (login required) ──
  if (body.kind === "subscription") {
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const plan = body.plan === "yearly" ? "yearly" : "monthly";
    const end = new Date();
    if (plan === "yearly") end.setFullYear(end.getFullYear() + 1);
    else end.setMonth(end.getMonth() + 1);

    const pricing = await getAdaaxPricing();
    const amount = plan === "yearly" ? pricing.yearly_usd : pricing.monthly_usd;
    const planLabel = plan === "yearly" ? "سنوي" : "شهري";
    const admin = createAdminClient();

    const { error: subErr } = await admin.from("subscriptions").upsert(
      {
        user_id: user.id,
        plan,
        status: "active",
        provider: "test",
        paypal_subscription_id: `TEST-${user.id}`,
        current_period_end: end.toISOString(),
        cancel_at_period_end: false,
        canceled_at: null,
      },
      { onConflict: "paypal_subscription_id" },
    );
    if (subErr) return NextResponse.json({ error: "db_error" }, { status: 500 });

    const { data: orderRow } = await admin
      .from("orders")
      .insert({
        user_id: user.id,
        email: user.email ?? null,
        name: (user.user_metadata?.full_name as string) ?? null,
        type: "subscription",
        items: [{ name: `اشتراك AdaaX (${planLabel}) — تجربة` }],
        amount,
        currency: "USD",
        status: "paid",
        provider: "test",
        paypal_order_id: `TEST-SUB-${user.id}-${Date.now()}`,
      })
      .select("id, order_number")
      .single();

    if (orderRow && user.email) {
      await sendSubscriptionConfirmation(user.email, {
        orderNumber: orderRow.order_number,
        orderId: orderRow.id,
        planLabel,
        amount,
        currency: "USD",
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, orderId: orderRow?.id });
  }

  // ── Simulate a one-time package/cart payment (guest checkout supported) ──
  if (body.kind === "order") {
    const email = user?.email || body.email;
    if (!email) {
      return NextResponse.json({ error: "email_required" }, { status: 400 });
    }
    const { orderId } = await finalizeGuestOrder({
      loggedInUserId: user?.id ?? null,
      email,
      name: body.name,
      phone: body.phone ?? null,
      items: (Array.isArray(body.items) ? body.items : []) as never[],
      amount: Number(body.amount) || 0,
      currency: body.currency || "USD",
      couponId: body.couponId ?? null,
      provider: "test",
      providerOrderId: `TEST-ORD-${crypto.randomUUID()}`,
    });
    return NextResponse.json({ ok: true, orderId });
  }

  return NextResponse.json({ error: "bad_kind" }, { status: 400 });
}
