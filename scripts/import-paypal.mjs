/**
 * Import PayPal-invoice customers (merged Adaa + Pharaoh-graphics data).
 *
 *   node --env-file=.env.local scripts/import-paypal.mjs              # dry run
 *   PAYPAL_CONFIRM=1 node --env-file=.env.local scripts/import-paypal.mjs   # execute
 *
 * Rules (per user):
 *  - "تحسين الأداء" rows → ORDERS (v1 before 2026-04-01, v2 after). Skip the ones that
 *    exact-match an already-imported WooCommerce order (email+date+amount).
 *  - Pharaoh "الباقة الثالثة" (graphics + perf premium) → ORDERS as
 *    "خدمة تحسين الاداء البرميم v2 (باقة ثالثة)".
 *  - These order rows use provider='paypal_invoice' and a SEPARATE number band (90001+),
 *    so they don't touch the live order sequence.
 *  - Everyone else → contacts only (external_contacts) with a paypal_* source:
 *    graphics → paypal_graphics · reinstall → paypal_reinstall · rest → paypal_other.
 *  - ALL rows become contacts (order rows surface as contacts automatically).
 *
 * Idempotent: clears prior paypal_invoice orders + paypal_* external rows, then re-imports.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const PAYPAL_CSV = "scripts/data/paypal_parsed_customers.csv";
const WOO_CSV = "scripts/data/filtered_orders_for_migration.csv";
const CONFIRM = process.env.PAYPAL_CONFIRM === "1";
const V2_CUTOFF = Date.UTC(2026, 3, 1); // 2026-04-01
const ORDER_BAND = 90001; // separate historical-invoice number band

function parseCsv(text) {
  const rows = []; let row = [], f = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\r") {}
    else if (c === "\n") { row.push(f); rows.push(row); row = []; f = ""; }
    else f += c;
  }
  if (f.length || row.length) { row.push(f); rows.push(row); }
  return rows;
}

const toLatin = (s) => (s || "").replace(/[٠-٩۰-۹]/g, (d) => {
  const c = d.charCodeAt(0); return String(c >= 0x06f0 ? c - 0x06f0 : c - 0x0660);
});
function payDate(s) {
  const m = (s || "").replace(/[^\d/]/g, "").match(/(\d{2})\/(\d{2})\/(\d{4})/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null; // DD/MM/YYYY -> YYYY-MM-DD
}
function cleanPhone(p) {
  const v = toLatin(String(p || "")).replace(/[^\d+]/g, "").trim();
  return v || null;
}

/** Category by the FIRST (primary) item in the row. */
function bucket(firstItem) {
  const s = firstItem || "";
  const has = (x) => s.includes(x);
  if (has("تحسين الاداء") || has("تحسين الأداء")) return "perf";
  if (has("الثالث") && (has("فرعون") || has("جرافيكس") || has("جرافكس"))) return "pkg3";
  if (has("اعادة تركيب جرافيكس") || has("اعادة تركيب جرافكس")) return "reinstall";
  if (has("فرعون") || has("جرافيكس") || has("جرافكس")) return "graphics";
  return "other";
}

function perfTier(item) {
  const has = (x) => item.includes(x);
  if (has("الالتميت") || has("الألتميت") || has("الاونلاين") || has("الأونلاين") || has("الاونلاىن")) return "الألتميت";
  if (has("البرميم") || has("البريميوم") || has("البريميم")) return "البريميم";
  if (has("العادية")) return "العادية";
  return null;
}

// ── Build woo dedup key set (email|date|amount) ──
const woo = parseCsv(readFileSync(WOO_CSV, "utf8")); woo.shift();
const wooKey = new Set();
for (const r of woo) {
  if (!r[0]) continue;
  wooKey.add(`${(r[3] || "").trim().toLowerCase()}|${(r[1] || "").slice(0, 10)}|${Number(r[5]).toFixed(2)}`);
}

// ── Parse PayPal rows ──
const rows = parseCsv(readFileSync(PAYPAL_CSV, "utf8")); rows.shift();

const orderRows = [];           // perf (new) + pkg3
const externalMap = new Map();  // `${cat}|${email}` -> aggregated contact
let perfDup = 0, perfNew = 0, pkg3 = 0;

function addExternal(cat, { name, email, phone, amount, date }) {
  const source = `paypal_${cat}`;
  const key = `${source}|${email}`;
  let e = externalMap.get(key);
  if (!e) { e = { source, name: null, email, phone: null, order_value: 0, last_order_at: null }; externalMap.set(key, e); }
  if (!e.name && name) e.name = name;
  if (!e.phone && phone) e.phone = phone;
  e.order_value += amount || 0;
  if (date && (!e.last_order_at || date > e.last_order_at)) e.last_order_at = date;
}

for (const r of rows) {
  if (!r[1]) continue;
  const [name0, email0, phone0, date0, amount0, item0] = r;
  const email = (email0 || "").trim().toLowerCase();
  if (!email) continue;
  const name = (name0 || "").trim() || null;
  const phone = cleanPhone(phone0);
  const date = payDate(date0);
  const amount = Number(amount0) || 0;
  const firstItem = (item0 || "").split(",")[0].trim();
  const cat = bucket(firstItem);

  if (cat === "perf") {
    const key = `${email}|${date}|${amount.toFixed(2)}`;
    if (wooKey.has(key)) { perfDup++; continue; } // already imported from woo
    perfNew++;
    const v = (date && new Date(date + "T00:00:00Z").getTime() >= V2_CUTOFF) ? "V2" : "V1";
    const tier = perfTier(item0);
    orderRows.push({
      email, name, phone, date, amount,
      itemName: `خدمة تحسين الأداء${tier ? " — " + tier : ""} ${v}`,
    });
  } else if (cat === "pkg3") {
    pkg3++;
    // The order represents the perf-premium part ($50); the rest paid was the graphics price.
    orderRows.push({
      email, name, phone, date, amount: 50,
      itemName: "خدمة تحسين الاداء البرميم v2 (باقة ثالثة)",
    });
  } else {
    addExternal(cat, { name, email, phone, amount, date });
  }
}

// Sort order rows chronologically and assign the separate number band.
orderRows.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
const orders = orderRows.map((o, i) => ({
  user_id: null,
  email: o.email,
  name: o.name,
  phone: o.phone,
  type: "package",
  items: [{ name: o.itemName, qty: 1, price: o.amount, currency: "$" }],
  amount: o.amount,
  currency: "USD",
  status: "paid",
  provider: "paypal_invoice",
  paypal_order_id: `PPINV-${ORDER_BAND + i}`,
  order_number: ORDER_BAND + i,
  created_at: o.date ? new Date(o.date + "T12:00:00Z").toISOString() : new Date().toISOString(),
}));

const externals = [...externalMap.values()].map((e) => ({
  ...e, order_value: Math.round(e.order_value * 100) / 100,
}));

const catCounts = externals.reduce((m, e) => ((m[e.source] = (m[e.source] || 0) + 1), m), {});
console.log(`PayPal rows: ${rows.filter((r) => r[1]).length}`);
console.log(`Perf → orders: ${perfNew} new (skipped ${perfDup} woo-duplicates) · pkg3 → orders: ${pkg3}`);
console.log(`Order rows to insert: ${orders.length} (#${ORDER_BAND}–#${ORDER_BAND + orders.length - 1})`);
console.log(`External contacts:`, catCounts, `(total ${externals.length})`);
console.log("Sample order:", JSON.stringify(orders[0], null, 2));
console.log("Sample external:", JSON.stringify(externals[0], null, 2));

if (!CONFIRM) {
  console.log("\nDRY RUN. Re-run with PAYPAL_CONFIRM=1 to import.");
  process.exit(0);
}

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// Idempotent reset of prior paypal import.
await db.from("orders").delete().eq("provider", "paypal_invoice");
await db.from("external_contacts").delete().like("source", "paypal_%");

for (let i = 0; i < orders.length; i += 100) {
  const { error } = await db.from("orders").insert(orders.slice(i, i + 100));
  if (error) { console.error("✖ orders insert:", error.message); process.exit(1); }
}
for (let i = 0; i < externals.length; i += 200) {
  const { error } = await db.from("external_contacts").insert(externals.slice(i, i + 200));
  if (error) { console.error("✖ external insert:", error.message); process.exit(1); }
}
console.log(`✓ Imported ${orders.length} paypal_invoice orders + ${externals.length} external contacts.`);
