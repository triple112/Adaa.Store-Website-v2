/**
 * Bulk-upload the old Canva installation-report PDFs into the private
 * `installation-reports` Supabase Storage bucket + index them in `legacy_reports`.
 * Filenames are the customers' Discord nicknames (the searchable key).
 *
 *   node --env-file=.env.local scripts/import-legacy-reports.mjs                 # dry run
 *   LEGACY_REPORTS_CONFIRM=1 node --env-file=.env.local scripts/import-legacy-reports.mjs   # execute
 *
 * Idempotent: wipes the `legacy/` prefix + all legacy_reports rows, then re-imports.
 * Admin-only archive — NOT linked to customer accounts.
 */
import { readFileSync, readdirSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const DIR = process.env.LEGACY_DIR || "E:\\كل شي يخص adaa\\ملفات pdf العملاء";
const BUCKET = "installation-reports";
const CONFIRM = process.env.LEGACY_REPORTS_CONFIRM === "1";

const files = readdirSync(DIR).filter(
  (f) => /\.pdf$/i.test(f) && !f.startsWith("~$"),
);

console.log(`Folder: ${DIR}`);
console.log(`PDF files found: ${files.length}`);
console.log("Sample:", files.slice(0, 8));

if (!CONFIRM) {
  console.log("\nDRY RUN. Re-run with LEGACY_REPORTS_CONFIRM=1 to upload.");
  process.exit(0);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Ensure the (private) bucket exists.
const { error: bucketErr } = await admin.storage.createBucket(BUCKET, { public: false });
if (bucketErr && !/exists/i.test(bucketErr.message)) {
  console.error("✖ bucket:", bucketErr.message);
  process.exit(1);
}

// ── Idempotent reset ──
const { data: existing } = await admin.storage.from(BUCKET).list("legacy", { limit: 2000 });
if (existing?.length) {
  await admin.storage.from(BUCKET).remove(existing.map((f) => `legacy/${f.name}`));
}
await admin.from("legacy_reports").delete().not("id", "is", null);

let ok = 0;
const insertRows = [];
for (const name of files) {
  const nickname = name.replace(/\.pdf$/i, "");
  const buf = readFileSync(`${DIR}\\${name}`);
  const path = `legacy/${randomUUID()}.pdf`;
  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: "application/pdf", upsert: true });
  if (error) {
    console.error(`✖ upload "${name}":`, error.message);
    continue;
  }
  insertRows.push({ nickname, storage_path: path, file_size: buf.length });
  ok++;
}

for (let i = 0; i < insertRows.length; i += 200) {
  const { error } = await admin.from("legacy_reports").insert(insertRows.slice(i, i + 200));
  if (error) {
    console.error("✖ insert:", error.message);
    process.exit(1);
  }
}

console.log(`✓ Uploaded + indexed ${ok}/${files.length} legacy reports.`);
