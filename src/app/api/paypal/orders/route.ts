import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { paypalConfigured, paypalFetch } from "@/lib/paypal/client";

/**
 * Creates a PayPal order server-side for one-time (package/cart) checkout.
 *
 * Used by BOTH payment methods on the checkout page — the PayPal button and the
 * Advanced Checkout card fields (card fields require a server-created order id;
 * they can't use the client-side `actions.order.create`).
 *
 * The amount is computed here from the line items (not trusted from the client),
 * and any coupon is re-validated against that subtotal, so the charged total
 * can't be tampered with. The verified discount goes into the PayPal breakdown.
 */
export const dynamic = "force-dynamic";

const CURRENCY = "USD";

type Item = { name?: string; qty?: number; price?: number };

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Builds a PayPal `payer` object from the customer's site form, defensively —
 * each sub-field is included only when it's well-formed (so it pre-fills PayPal's
 * form without ever risking a 400 on order creation). Returns null if nothing usable.
 */
function buildPayer(input?: { name?: string; email?: string; phone?: string; country?: string }) {
  if (!input) return null;
  const payer: Record<string, unknown> = {};

  const name = (input.name ?? "").trim();
  if (name) {
    const parts = name.split(/\s+/);
    const given_name = parts[0].slice(0, 140);
    const surname = parts.slice(1).join(" ").slice(0, 140);
    payer.name = surname ? { given_name, surname } : { given_name };
  }

  const email = (input.email ?? "").trim();
  if (EMAIL_RE.test(email)) payer.email_address = email.slice(0, 254);

  const digits = (input.phone ?? "").replace(/[^\d]/g, "").slice(-14);
  if (digits.length >= 4) {
    payer.phone = { phone_type: "MOBILE", phone_number: { national_number: digits } };
  }

  const country = (input.country ?? "").trim().toUpperCase();
  if (/^[A-Z]{2}$/.test(country)) payer.address = { country_code: country };

  return Object.keys(payer).length ? payer : null;
}

export async function POST(request: Request) {
  if (!paypalConfigured()) {
    return NextResponse.json({ error: "paypal_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    items?: Item[];
    couponId?: string | null;
    payer?: { name?: string; email?: string; phone?: string; country?: string };
  };

  const rawItems = Array.isArray(body.items) ? body.items : [];
  if (rawItems.length === 0) {
    return NextResponse.json({ error: "empty_cart" }, { status: 400 });
  }

  const lineItems = rawItems.map((it) => ({
    name: String(it.name ?? "خدمة").slice(0, 127),
    qty: Math.max(1, Math.floor(Number(it.qty) || 1)),
    price: round2(Number(it.price) || 0),
  }));
  const subtotal = round2(lineItems.reduce((sum, it) => sum + it.price * it.qty, 0));
  if (subtotal <= 0) {
    return NextResponse.json({ error: "invalid_amount" }, { status: 400 });
  }

  // Re-validate the coupon (by id) against the server-computed subtotal.
  let discount = 0;
  let couponId: string | null = null;
  if (body.couponId) {
    const db = createAdminClient();
    const { data: c } = await db
      .from("coupons")
      .select(
        "id, type, value, min_amount, max_uses, used_count, applies_to, active, starts_at, expires_at",
      )
      .eq("id", body.couponId)
      .maybeSingle();
    const now = new Date();
    const valid =
      !!c &&
      c.active &&
      (!c.starts_at || new Date(c.starts_at) <= now) &&
      (!c.expires_at || new Date(c.expires_at) >= now) &&
      (c.max_uses == null || c.used_count < c.max_uses) &&
      (c.applies_to === "all" || c.applies_to === "packages") &&
      subtotal >= Number(c.min_amount);
    if (valid && c) {
      discount =
        c.type === "percent"
          ? round2((subtotal * Number(c.value)) / 100)
          : Math.min(Number(c.value), subtotal);
      couponId = c.id;
    }
  }

  const finalAmount = Math.max(0, round2(subtotal - discount));
  if (finalAmount <= 0) {
    return NextResponse.json({ error: "amount_too_low" }, { status: 400 });
  }

  const purchaseUnit: Record<string, unknown> = {
    amount: {
      currency_code: CURRENCY,
      value: finalAmount.toFixed(2),
      breakdown: {
        item_total: { currency_code: CURRENCY, value: subtotal.toFixed(2) },
        ...(discount > 0
          ? { discount: { currency_code: CURRENCY, value: discount.toFixed(2) } }
          : {}),
      },
    },
    items: lineItems.map((it) => ({
      name: it.name,
      quantity: String(it.qty),
      unit_amount: { currency_code: CURRENCY, value: it.price.toFixed(2) },
    })),
    // Stash the validated coupon so capture can record the redemption.
    ...(couponId ? { custom_id: couponId } : {}),
  };

  // Build a PayPal `payer` from the customer's site data so the hosted card /
  // checkout form is pre-filled (best-effort). Each field is added only when valid
  // so a malformed value can never break order creation.
  const payer = buildPayer(body.payer);

  const res = await paypalFetch("/v2/checkout/orders", {
    method: "POST",
    json: {
      intent: "CAPTURE",
      purchase_units: [purchaseUnit],
      ...(payer ? { payer } : {}),
      application_context: {
        brand_name: "Adaa",
        shipping_preference: "NO_SHIPPING",
        user_action: "PAY_NOW",
      },
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "create_failed" }, { status: 502 });
  }

  const data = (await res.json()) as { id?: string };
  if (!data.id) {
    return NextResponse.json({ error: "no_order_id" }, { status: 502 });
  }
  return NextResponse.json({ id: data.id });
}
