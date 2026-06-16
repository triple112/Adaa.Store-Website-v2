import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSubscription, paypalFetch } from "@/lib/paypal/client";

/**
 * PayPal webhook receiver. Keeps the subscriptions table in sync with PayPal:
 * activations, renewals (extend period), cancellations, expiries, suspensions.
 *
 * Security: every event is verified against PayPal using PAYPAL_WEBHOOK_ID before
 * we touch the DB. Unverified/forged events are rejected. This route is excluded
 * from the auth proxy (see proxy.ts matcher).
 */
export async function POST(request: Request) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // Can't verify authenticity without the webhook id — refuse to process.
    return NextResponse.json({ error: "webhook_unconfigured" }, { status: 503 });
  }

  type WebhookEvent = {
    event_type?: string;
    resource?: {
      id?: string;
      status?: string;
      billing_info?: { next_billing_time?: string };
      billing_agreement_id?: string;
      amount?: { total?: string; currency?: string };
    };
  };

  const raw = await request.text();
  let event: WebhookEvent;
  try {
    event = JSON.parse(raw) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // ── Verify signature with PayPal ──
  const h = request.headers;
  const verifyRes = await paypalFetch("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    json: {
      auth_algo: h.get("paypal-auth-algo"),
      cert_url: h.get("paypal-cert-url"),
      transmission_id: h.get("paypal-transmission-id"),
      transmission_sig: h.get("paypal-transmission-sig"),
      transmission_time: h.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event,
    },
  });
  const verify = await verifyRes.json().catch(() => ({}));
  if (verify?.verification_status !== "SUCCESS") {
    return NextResponse.json({ error: "verification_failed" }, { status: 400 });
  }

  const admin = createAdminClient();
  const type: string = event.event_type ?? "";
  const resource: NonNullable<WebhookEvent["resource"]> = event.resource ?? {};

  try {
    switch (type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.RE-ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED": {
        await admin
          .from("subscriptions")
          .update({
            status: "active",
            current_period_end: resource?.billing_info?.next_billing_time ?? null,
            cancel_at_period_end: false,
          })
          .eq("paypal_subscription_id", resource.id);
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        await admin
          .from("subscriptions")
          .update({ status: "canceled", canceled_at: new Date().toISOString() })
          .eq("paypal_subscription_id", resource.id);
        break;
      }

      case "BILLING.SUBSCRIPTION.EXPIRED": {
        await admin
          .from("subscriptions")
          .update({ status: "expired" })
          .eq("paypal_subscription_id", resource.id);
        break;
      }

      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        await admin
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("paypal_subscription_id", resource.id);
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        // Recurring renewal payment. resource.billing_agreement_id = subscription id.
        const subId: string | undefined = resource.billing_agreement_id;
        if (subId) {
          // Refresh the subscription to get the new next_billing_time.
          let nextBilling: string | null = null;
          try {
            const sub = await getSubscription(subId);
            nextBilling = sub?.billing_info?.next_billing_time ?? null;
          } catch {
            /* keep null */
          }

          const { data: subRow } = await admin
            .from("subscriptions")
            .update({
              status: "active",
              current_period_end: nextBilling,
            })
            .eq("paypal_subscription_id", subId)
            .select("id, user_id, plan")
            .maybeSingle();

          if (subRow) {
            await admin.from("orders").upsert(
              {
                user_id: subRow.user_id,
                type: "subscription",
                items: [{ name: "تجديد اشتراك AdaaX" }],
                amount: Number(resource?.amount?.total ?? 0),
                currency: resource?.amount?.currency ?? "USD",
                status: "paid",
                provider: "paypal",
                paypal_order_id: resource.id, // sale id — unique per payment
              },
              { onConflict: "paypal_order_id" },
            );
          }
        }
        break;
      }

      default:
        // Unhandled event types are acknowledged so PayPal stops retrying.
        break;
    }
  } catch {
    // Returning 500 makes PayPal retry later.
    return NextResponse.json({ error: "processing_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
