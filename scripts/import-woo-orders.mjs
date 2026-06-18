/**
 * One-time WooCommerce → Supabase order migration.
 *
 *   node --env-file=.env.local scripts/import-woo-orders.mjs            # dry run (prints plan)
 *   WOO_IMPORT_CONFIRM=1 node --env-file=.env.local scripts/import-woo-orders.mjs   # execute
 *
 * Behavior (per agreed decisions):
 *  - Preserves the original WooCommerce order numbers (#3141–#5105).
 *  - WIPES all existing (test) orders first, so run this ONCE before launch.
 *  - No accounts are created: orders are stored with the customer email (user_id
 *    NULL) and get auto-claimed when that email signs up / checks out again
 *    (handle_new_user trigger).
 *  - The 3 performance tiers get a V1/V2 suffix by date (cutoff 2026-04-01).
 *  - Totals recorded in USD; created_at = original order date.
 *  - Idempotent-ish: re-running wipes + reimports (only safe pre-launch).
 *
 * After running, also run scripts/post-woo-import.sql via the Supabase MCP/SQL
 * editor (bumps the order-number sequence to 5106 and claims existing profiles).
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const CSV = "scripts/data/filtered_orders_for_migration.csv";
const CONFIRM = process.env.WOO_IMPORT_CONFIRM === "1";
const V2_CUTOFF = Date.UTC(2026, 3, 1); // 2026-04-01: on/after → V2, before → V1

// product_id → canonical name. The 3 performance tiers get a V1/V2 suffix by date.
const PERF_TIERS = {
  "2924": "خدمة تحسين الأداء — الألتميت",
  "2601": "خدمة تحسين الأداء — البريميم",
  "2593": "خدمة تحسين الأداء — العادية",
};
const OTHER_PRODUCTS = {
  "2628": "خدمة فورمات النظام",
  "2640": "خدمة تفعيل النظام",
  "2638": "خدمة كسر سرعة اليد",
  "3675": "خدمة الفحص الشامل للجهاز",
  "3671": "خدمة تحديث البايوس",
  "3773": "تجميع كمبيوتر مخصص",
  "4957": "رسوم معالجة الدفع",
  "0": "جرافكس فرعون v17",
};

/** Minimal RFC-4180 CSV parser (quoted fields + "" escapes + embedded newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* skip */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function parseLineItem(s) {
  if (!s || !s.trim()) return null;
  const get = (k) => {
    const m = s.match(new RegExp(`(?:^|\\|)${k}:([^|]*)`));
    return m ? m[1] : "";
  };
  const product_id = get("product_id").trim();
  const qty = Math.max(1, Number(get("quantity") || "1"));
  const total = Number(get("total") || "0");
  return { product_id, qty, total, rawName: get("name").trim() };
}

function cleanPhone(p) {
  if (!p) return null;
  const v = String(p).replace(/^'+/, "").replace(/"/g, "").trim();
  return v || null;
}

function itemName(li, isV2) {
  if (li.product_id in PERF_TIERS) {
    return `${PERF_TIERS[li.product_id]} ${isV2 ? "V2" : "V1"}`;
  }
  return OTHER_PRODUCTS[li.product_id] || li.rawName || "منتج";
}

const rows = parseCsv(readFileSync(CSV, "utf8"));
const header = rows.shift();
if (header[0] !== "order_id") throw new Error("unexpected CSV header: " + header.join(","));

const orders = [];
const emailSet = new Set();
const phoneSet = new Set();
let v1 = 0, v2 = 0;

for (const r of rows) {
  if (!r[0]) continue;
  const [orderId, orderDate, , billEmail, billPhone, orderTotal] = r;
  const email = (billEmail || "").trim().toLowerCase() || null;
  const phone = cleanPhone(billPhone);
  const isV2 = new Date(orderDate.replace(" ", "T") + "Z").getTime() >= V2_CUTOFF;

  const items = [];
  let hasPerf = false;
  for (let c = 6; c <= 11; c++) {
    const li = parseLineItem(r[c]);
    if (!li) continue;
    if (li.product_id in PERF_TIERS) { hasPerf = true; isV2 ? v2++ : v1++; }
    items.push({
      name: itemName(li, isV2),
      qty: li.qty,
      price: Number((li.total / li.qty).toFixed(2)),
      currency: "$",
    });
  }

  if (email) emailSet.add(email);
  if (phone) phoneSet.add(phone);

  orders.push({
    user_id: null,
    email,
    phone,
    type: hasPerf ? "package" : "service",
    items,
    amount: Number(orderTotal) || 0,
    currency: "USD",
    status: "paid",
    provider: "woocommerce",
    paypal_order_id: `WOO-${orderId}`,
    order_number: Number(orderId),
    created_at: new Date(orderDate.replace(" ", "T") + "Z").toISOString(),
  });
}

const nums = orders.map((o) => o.order_number);
console.log(`Parsed ${orders.length} orders (#${Math.min(...nums)}–#${Math.max(...nums)})`);
console.log(`Unique emails: ${emailSet.size} · unique phones: ${phoneSet.size}`);
console.log(`Performance line items → V1: ${v1} · V2: ${v2}`);

if (!CONFIRM) {
  console.log("\nDRY RUN. Sample order:", JSON.stringify(orders[0], null, 2));
  console.log("\nRe-run with WOO_IMPORT_CONFIRM=1 to wipe existing orders and import.");
  process.exit(0);
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Wipe existing (test) orders — pre-launch only.
const { count: before } = await db.from("orders").select("*", { count: "exact", head: true });
console.log(`\nExisting orders to delete: ${before ?? "?"}`);
const { error: delErr } = await db.from("orders").delete().gt("order_number", 0);
if (delErr) { console.error("✖ delete failed:", delErr.message); process.exit(1); }

// Insert in chunks.
let inserted = 0;
for (let i = 0; i < orders.length; i += 100) {
  const chunk = orders.slice(i, i + 100);
  const { error } = await db.from("orders").insert(chunk);
  if (error) { console.error("✖ insert failed:", error.message); process.exit(1); }
  inserted += chunk.length;
}
console.log(`✓ Imported ${inserted} orders.`);
console.log("Next: run scripts/post-woo-import.sql (sequence bump + claim existing profiles).");
