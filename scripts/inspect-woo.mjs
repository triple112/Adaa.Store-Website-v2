/**
 * Inspect the WooCommerce migration CSV: parse rows + line items and print the
 * distinct product_id → name map, status values, and a few sanity stats.
 *   node scripts/inspect-woo.mjs
 */
import { readFileSync } from "node:fs";

const CSV = "scripts/data/filtered_orders_for_migration.csv";

/** Minimal RFC-4180 CSV parser (handles quoted fields + "" escapes + newlines). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
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
  if (!s) return null;
  const get = (k) => {
    const m = s.match(new RegExp(`(?:^|\\|)${k}:([^|]*)`));
    return m ? m[1] : "";
  };
  return {
    name: get("name").trim(),
    product_id: get("product_id"),
    quantity: Number(get("quantity") || "1"),
    total: Number(get("total") || "0"),
    sub_total: Number(get("sub_total") || "0"),
  };
}

const rows = parseCsv(readFileSync(CSV, "utf8"));
const header = rows.shift();
console.log("columns:", header.length, header.join(" | "));
console.log("data rows:", rows.length);

const products = new Map(); // product_id -> { name, count }
const statuses = new Map();
let totalItems = 0;

for (const r of rows) {
  if (!r[0]) continue;
  statuses.set(r[2], (statuses.get(r[2]) || 0) + 1);
  for (let c = 6; c <= 11; c++) {
    const li = parseLineItem(r[c]);
    if (!li || !li.name) continue;
    totalItems++;
    const key = li.product_id;
    if (!products.has(key)) products.set(key, { name: li.name, count: 0 });
    products.get(key).count++;
  }
}

console.log("\nstatuses:", Object.fromEntries(statuses));
console.log("\ndistinct products (product_id → name × count):");
for (const [pid, { name, count }] of [...products.entries()].sort((a, b) => b[1].count - a[1].count)) {
  console.log(`  ${pid.padStart(5)} ×${String(count).padStart(3)}  ${name}`);
}
console.log("\ntotal line items:", totalItems);
