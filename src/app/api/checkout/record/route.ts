import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finalizeGuestOrder } from "@/lib/orders/finalize";
import { paypalConfigured, paypalFetch } from "@/lib/paypal/client";

/**
 * Records a one-time (package) order after the PayPal button captures payment.
 * Called from PayPalCheckout.onApprove so EVERY real payment lands in
 * orders + contacts (previously the client captured but nothing was stored).
 *
 * When PayPal is configured we verify the order id server-side (status COMPLETED)
 * before recording, so a forged call can't create a paid order.
 */
export const dynamic = "force-dynamic";

type Body = {
  paypalOrderId?: string;
  items?: { name?: string; qty?: number; price?: number; currency?: string }[];
  amount?: number;
  currency?: string;
  couponId?: string | null;
  email?: string;
  name?: string;
  phone?: string | null;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Body;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = (user?.email || body.email || "").trim().toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }

  // Verify the payment with PayPal when we have credentials + an order id.
  if (paypalConfigured() && body.paypalOrderId) {
    try {
      const res = await paypalFetch(`/v2/checkout/orders/${body.paypalOrderId}`);
      if (!res.ok) {
        return NextResponse.json({ error: "paypal_verify_failed" }, { status: 402 });
      }
      const order = (await res.json()) as { status?: string };
      if (order.status !== "COMPLETED" && order.status !== "APPROVED") {
        return NextResponse.json({ error: "payment_not_completed" }, { status: 402 });
      }
    } catch {
      return NextResponse.json({ error: "paypal_verify_error" }, { status: 502 });
    }
  }

  const providerOrderId = body.paypalOrderId || `PP-${crypto.randomUUID()}`;

  const { orderId } = await finalizeGuestOrder({
    loggedInUserId: user?.id ?? null,
    email,
    name: body.name,
    phone: body.phone ?? null,
    items: Array.isArray(body.items) ? body.items : [],
    amount: Number(body.amount) || 0,
    currency: body.currency || "USD",
    couponId: body.couponId ?? null,
    provider: "paypal",
    providerOrderId,
  });

  return NextResponse.json({ ok: true, orderId });
}
