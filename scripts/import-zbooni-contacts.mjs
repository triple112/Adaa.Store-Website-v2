/**
 * Import old "Zbooni" payment-gateway customers into `external_contacts`
 * (contacts-only — these are NOT website orders). Shown in the admin contacts
 * page with the "زبوني" source label.
 *
 *   node --env-file=.env.local scripts/import-zbooni-contacts.mjs           # dry run
 *   ZBOONI_CONFIRM=1 node --env-file=.env.local scripts/import-zbooni-contacts.mjs   # execute
 *
 * Idempotent: upserts on (source, lower(email)).
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const CSV = "scripts/data/zbooni_parsed_customers.csv";
const CONFIRM = process.env.ZBOONI_CONFIRM === "1";

/** Convert Arabic-Indic / Eastern-Arabic digits to Latin 0-9. */
function toLatinDigits(s) {
  if (!s) return s;
  return s.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

function parseCsv(text) {
  const rows = [];
  let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else q = false; }
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") {}
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function cleanPhone(p) {
  if (!p) return null;
  const v = toLatinDigits(String(p)).replace(/[^\d+]/g, "").trim();
  return v || null;
}

function parseValue(v) {
  if (!v) return null;
  const n = Number(toLatinDigits(String(v)).replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function parseDate(d) {
  if (!d || d.trim() === "-") return null;
  const t = new Date(d.trim());
  return Number.isNaN(t.getTime()) ? null : t.toISOString();
}

const text = readFileSync(CSV, "utf8").replace(/^﻿/, "");
const rows = parseCsv(text);
rows.shift(); // header: الاسم,الايميل,الرقم,تاريخ آخر عملية,قيمة الطلب بالدولار

const seen = new Set();
const contacts = [];
for (const r of rows) {
  if (!r[0] && !r[1]) continue;
  const email = (r[1] || "").trim().toLowerCase() || null;
  if (!email) continue;
  if (seen.has(email)) continue; // de-dupe within file
  seen.add(email);
  contacts.push({
    source: "zbooni",
    name: (r[0] || "").trim() || null,
    email,
    phone: cleanPhone(r[2]),
    last_order_at: parseDate(r[3]),
    order_value: parseValue(r[4]),
  });
}

console.log(`Parsed ${contacts.length} zbooni contacts.`);
console.log("Sample:", JSON.stringify(contacts[1], null, 2));

if (!CONFIRM) {
  console.log("\nDRY RUN. Re-run with ZBOONI_CONFIRM=1 to upsert into external_contacts.");
  process.exit(0);
}

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

const { error } = await db
  .from("external_contacts")
  .upsert(contacts, { onConflict: "source,email", ignoreDuplicates: false });
if (error) { console.error("✖ upsert failed:", error.message); process.exit(1); }
console.log(`✓ Imported ${contacts.length} zbooni contacts into external_contacts.`);
