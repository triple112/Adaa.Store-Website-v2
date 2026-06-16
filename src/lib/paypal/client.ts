import "server-only";

/**
 * Minimal PayPal REST helper (server-only). We talk to the REST API directly
 * with fetch — no deprecated SDK. Used for subscriptions, orders, and webhook
 * signature verification.
 */

export const PAYPAL_BASE =
  process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";

function clientId(): string {
  // The client id is public; reuse the front-end one if a server-specific one isn't set.
  return (
    process.env.PAYPAL_CLIENT_ID ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    ""
  );
}

export function paypalConfigured(): boolean {
  return Boolean(clientId() && process.env.PAYPAL_CLIENT_SECRET);
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value;
  }

  const auth = Buffer.from(
    `${clientId()}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const res = await fetch(`${PAYPAL_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`PayPal token request failed (${res.status})`);
  }

  const data = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

type PayPalFetchInit = Omit<RequestInit, "body"> & { json?: unknown; body?: BodyInit };

/** Authenticated call against the PayPal REST API. Returns the raw Response. */
export async function paypalFetch(
  path: string,
  init: PayPalFetchInit = {},
): Promise<Response> {
  const token = await getAccessToken();
  const { json, headers, ...rest } = init;

  return fetch(`${PAYPAL_BASE}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(headers as Record<string, string> | undefined),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
    cache: "no-store",
  });
}

/** GET a subscription's current state from PayPal. */
export async function getSubscription(subscriptionId: string) {
  const res = await paypalFetch(`/v1/billing/subscriptions/${subscriptionId}`);
  if (!res.ok) {
    throw new Error(`PayPal getSubscription failed (${res.status})`);
  }
  return res.json();
}

/** Map a PayPal plan id back to our internal plan name using env config. */
export function planFromPayPalId(planId: string): "monthly" | "yearly" | null {
  if (planId && planId === process.env.PAYPAL_PLAN_ID_MONTHLY) return "monthly";
  if (planId && planId === process.env.PAYPAL_PLAN_ID_YEARLY) return "yearly";
  return null;
}
