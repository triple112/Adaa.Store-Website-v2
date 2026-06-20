import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { finalizeGuestOrder } from "@/lib/orders/finalize";
import { paypalConfigured, paypalFetch } from "@/lib/paypal/client";

/**
 * Captures a PayPal order (created by /api/paypal/orders) and records it.
 *
 * Used by both the PayPal button and the card fields. The captured amount, line
 * items, and coupon id are read back from PayPal's verified response — never
 * trusted from the client — so the recorded order matches what was actually paid.
 */
export const dynamic = "force-dynamic";

type CaptureResponse = {
  status?: string;
  payer?: {
    email_address?: string;
    name?: { given_name?: string; surname?: string };
  };
  purchase_units?: {
    custom_id?: string;
    items?: { name?: string; quantity?: string; unit_amount?: { value?: string } }[];
    payments?: {
      captures?: { amount?: { value?: string; currency_code?: string } }[];
    };
  }[];
};

export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "paypal_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    orderID?: string;
    email?: string;
    name?: string;
    phone?: string | null;
  };
  if (!body.orderID) {
    return NextResponse.json({ error: "order_id_required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Idempotency: if this PayPal order was already recorded, return it instead of
  // capturing/recording twice.
  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("paypal_order_id", body.orderID)
    .maybeSingle();
  if (existing?.id) {
    return NextResponse.json({ ok: true, orderId: existing.id });
  }

  // Capture the payment.
  let order: CaptureResponse;
  try {
    const res = await paypalFetch(`/v2/checkout/orders/${body.orderID}/capture`, {
      method: "POST",
      json: {},
    });
    order = (await res.json().catch(() => ({}))) as CaptureResponse;
    if (!res.ok || (order.status !== "COMPLETED" && order.status !== "APPROVED")) {
      return NextResponse.json({ error: "capture_failed" }, { status: 402 });
    }
  } catch {
    return NextResponse.json({ error: "capture_error" }, { status: 502 });
  }

  const pu = order.purchase_units?.[0];
  const capture = pu?.payments?.captures?.[0];
  const amount = Number(capture?.amount?.value) || 0;
  const currency = capture?.amount?.currency_code || "USD";
  const couponId = pu?.custom_id || null;

  const payer = order.payer;
  const email = (user?.email || body.email || payer?.email_address || "")
    .trim()
    .toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }
  const name =
    body.name ||
    [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(" ") ||
    undefined;

  const items = (pu?.items ?? []).map((it) => ({
    name: it.name ?? "خدمة",
    qty: Number(it.quantity) || 1,
    price: Number(it.unit_amount?.value) || 0,
    currency,
  }));

  const { orderId } = await finalizeGuestOrder({
    loggedInUserId: user?.id ?? null,
    email,
    name,
    phone: body.phone ?? null,
    items,
    amount,
    currency,
    couponId,
    provider: "paypal",
    providerOrderId: body.orderID,
  });

  return NextResponse.json({ ok: true, orderId });
}
