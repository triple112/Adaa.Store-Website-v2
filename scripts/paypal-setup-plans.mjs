/**
 * One-time setup: creates the AdaaX PayPal product + monthly/yearly billing plans,
 * then prints the plan IDs to paste into .env.local.
 *
 * Run with Node 20+ (loads env from .env.local):
 *   node --env-file=.env.local scripts/paypal-setup-plans.mjs
 *
 * Prices default to $10/mo and $96/yr; override with ADAAX_MONTHLY_USD / ADAAX_YEARLY_USD.
 */

const BASE = process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com";
const CLIENT_ID =
  process.env.PAYPAL_CLIENT_ID || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const SECRET = process.env.PAYPAL_CLIENT_SECRET;

const MONTHLY = Number(process.env.ADAAX_MONTHLY_USD || 10);
const YEARLY = Number(process.env.ADAAX_YEARLY_USD || 96);

if (!CLIENT_ID || !SECRET) {
  console.error(
    "✖ Missing PayPal credentials. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID (or PAYPAL_CLIENT_ID) and PAYPAL_CLIENT_SECRET in .env.local.",
  );
  process.exit(1);
}

async function getToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString("base64");
  const res = await fetch(`${BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`token failed (${res.status}): ${await res.text()}`);
  return (await res.json()).access_token;
}

async function api(token, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`${path} failed (${res.status}): ${JSON.stringify(json)}`);
  }
  return json;
}

function planBody(productId, name, intervalUnit, price) {
  return {
    product_id: productId,
    name,
    status: "ACTIVE",
    billing_cycles: [
      {
        frequency: { interval_unit: intervalUnit, interval_count: 1 },
        tenure_type: "REGULAR",
        sequence: 1,
        total_cycles: 0, // 0 = infinite (recurring until cancelled)
        pricing_scheme: {
          fixed_price: { value: price.toFixed(2), currency_code: "USD" },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee_failure_action: "CONTINUE",
      payment_failure_threshold: 1,
    },
  };
}

async function main() {
  console.log(`→ Using ${BASE}`);
  const token = await getToken();

  const product = await api(token, "/v1/catalogs/products", {
    name: "AdaaX",
    description: "AdaaX — اشتراك أداة تحسين الأداء",
    type: "SERVICE",
    category: "SOFTWARE",
  });
  console.log(`✓ Product: ${product.id}`);

  const monthly = await api(
    token,
    "/v1/billing/plans",
    planBody(product.id, "AdaaX Monthly", "MONTH", MONTHLY),
  );
  const yearly = await api(
    token,
    "/v1/billing/plans",
    planBody(product.id, "AdaaX Yearly", "YEAR", YEARLY),
  );

  console.log("\n✅ Done. Paste these into .env.local:\n");
  console.log(`PAYPAL_PLAN_ID_MONTHLY=${monthly.id}`);
  console.log(`PAYPAL_PLAN_ID_YEARLY=${yearly.id}`);
  console.log("\n(then restart `npm run dev`)");
}

main().catch((err) => {
  console.error("✖", err.message);
  process.exit(1);
});
