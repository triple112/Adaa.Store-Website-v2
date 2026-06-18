/** Inspect paypal_parsed_customers.csv: categorize items + check overlap with the
 *  already-imported WooCommerce orders. Read-only.  node scripts/inspect-paypal.mjs */
import { readFileSync } from "node:fs";

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

const onlyDigitsSlash = (s) => (s || "").replace(/[^\d/]/g, "");
function payDate(s) {
  const m = onlyDigitsSlash(s).match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return `${m[3]}-${m[2]}-${m[1]}`; // DD/MM/YYYY -> YYYY-MM-DD
}

function bucket(item) {
  const s = item || "";
  const has = (x) => s.includes(x);
  if (has("تحسين الاداء")) return "perf";
  if (has("الثالث") && (has("جرافيكس") || has("جرافكس"))) return "graphics_pkg3";
  if (has("جرافيكس الفرعون") || has("جرافكس الفرعون") || has("جرافيكس المرعون")) return "graphics_pkg";
  if (has("اعادة تركيب جرافيكس") || has("اعادة تركيب جرافكس")) return "graphics_reinstall";
  if (has("اعادة تركيب اصوات")) return "sounds_reinstall";
  if (has("تخطي البيومتر")) return "bypass_tool";
  if (has("تركيب سريع")) return "quick_install";
  if (has("المصورين")) return "photographers";
  if (has("الفحص الشامل")) return "svc_check";
  if (has("تفعيل النظام")) return "svc_activate";
  if (has("فورمات")) return "svc_format";
  if (has("كسر سرعة")) return "svc_overclock";
  if (has("تحديث البايوس")) return "svc_bios";
  if (has("تجميع")) return "svc_build";
  if (has("رسوم معالجة")) return "fee";
  if (/invoice|Betaling|فاتورة|دفعة/i.test(s)) return "invoice_generic";
  if (/^unknown$/i.test(s.trim())) return "unknown";
  return "other";
}

// Load woo orders (already imported) for overlap detection.
const woo = parseCsv(readFileSync("scripts/data/filtered_orders_for_migration.csv", "utf8"));
woo.shift();
const wooKey = new Set();      // email|date|amount
const wooEmailDate = new Set(); // email|date
for (const r of woo) {
  if (!r[0]) continue;
  const email = (r[3] || "").trim().toLowerCase();
  const date = (r[1] || "").slice(0, 10);
  const amt = Number(r[5]).toFixed(2);
  wooKey.add(`${email}|${date}|${amt}`);
  wooEmailDate.add(`${email}|${date}`);
}

const rows = parseCsv(readFileSync("scripts/data/paypal_parsed_customers.csv", "utf8"));
rows.shift();

const counts = {};
const perfStats = { total: 0, matchExact: 0, matchEmailDate: 0, noMatch: 0 };
const sample = {};
let perfNoMatchSamples = [];

for (const r of rows) {
  if (!r[1]) continue;
  const [name, email, , date, amount, item] = r;
  // A row can contain several comma-joined items; bucket by the first meaningful one.
  const firstItem = (item || "").split(",")[0].trim();
  const b = bucket(item); // bucket on whole string (perf/third detected anywhere)
  counts[b] = (counts[b] || 0) + 1;
  if (!sample[b]) sample[b] = firstItem || item;

  if (b === "perf" || b === "graphics_pkg3") {
    // (only perf is expected to overlap woo; pkg3 is Pharaoh-only)
  }
  if (b === "perf") {
    perfStats.total++;
    const e = (email || "").trim().toLowerCase();
    const d = payDate(date);
    const amt = Number(amount).toFixed(2);
    if (wooKey.has(`${e}|${d}|${amt}`)) perfStats.matchExact++;
    else if (wooEmailDate.has(`${e}|${d}`)) perfStats.matchEmailDate++;
    else { perfStats.noMatch++; if (perfNoMatchSamples.length < 12) perfNoMatchSamples.push(`${e} ${d} $${amt} :: ${firstItem}`); }
  }
}

console.log("Total paypal rows:", rows.filter((r) => r[1]).length);
console.log("\nCategory counts:");
for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${String(v).padStart(3)}  ${k.padEnd(18)} e.g. ${sample[k]}`);
}
console.log("\nPERF overlap vs WooCommerce import:", perfStats);
console.log("\nPERF rows with NO woo match (sample):");
perfNoMatchSamples.forEach((s) => console.log("  " + s));

// Unique emails overall
const emails = new Set(rows.filter((r) => r[1]).map((r) => r[1].trim().toLowerCase()));
console.log("\nUnique emails in paypal CSV:", emails.size);
