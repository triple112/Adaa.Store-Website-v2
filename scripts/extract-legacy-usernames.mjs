/**
 * Extract the Discord username from each legacy report PDF (it sits next to the
 * "يوزر العميل" label in the header row) and fill legacy_reports.discord_username.
 *
 *   node scripts/extract-legacy-usernames.mjs                                  # dry run (prints results)
 *   USERNAMES_CONFIRM=1 node --env-file=.env.local scripts/extract-legacy-usernames.mjs   # write to DB
 *
 * Heuristic: in the header band (top pills row) the Latin tokens are the username,
 * the package ("premium v2.5") and the date ("6/17/26"). We drop dates / versions /
 * package words and keep the username-like token (leftmost if several).
 */
import { readFileSync, readdirSync } from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const DIR = process.env.LEGACY_DIR || "E:\\كل شي يخص adaa\\ملفات pdf العملاء";
const CONFIRM = process.env.USERNAMES_CONFIRM === "1";
const BAND = [600, 640]; // y-range of the header pills row (both templates)

const AR = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
const isArabic = (s) => AR.test(s);
const isValue = (s) => !isArabic(s) && /[A-Za-z0-9]/.test(s.normalize("NFKC"));
const looksDate = (s) => /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(s.trim());

/**
 * The username sits in the header pill labelled "يوزر العميل" (template A) or
 * "اسم العميل" (template B) — always the value immediately LEFT of that label.
 * We never pick "مسئول التركيب" (engineer), "موعد التركيب" (date) or "نوع الباقة".
 */
async function extractUsername(path) {
  const data = new Uint8Array(readFileSync(path));
  const task = getDocument({ data, useSystemFonts: true });
  const doc = await task.promise;
  try {
    const page = await doc.getPage(1);
    const items = (await page.getTextContent()).items
      .filter((it) => it.str && it.str.trim())
      .map((it) => ({ raw: it.str, x: it.transform[4], y: it.transform[5] }))
      .filter((it) => it.y >= BAND[0] && it.y <= BAND[1]);

    // Build Arabic label clusters (group adjacent glyphs by x-gap).
    const glyphs = items.filter((it) => isArabic(it.raw)).sort((a, b) => a.x - b.x);
    const labels = [];
    for (const g of glyphs) {
      const last = labels[labels.length - 1];
      if (last && g.x - last.maxX <= 25) {
        last.items.push(g);
        last.maxX = g.x;
      } else {
        labels.push({ items: [g], minX: g.x, maxX: g.x });
      }
    }
    for (const L of labels) {
      L.minX = Math.min(...L.items.map((g) => g.x));
      L.y = L.items[0].y;
      L.text = L.items
        .slice()
        .sort((a, b) => b.x - a.x) // RTL
        .map((g) => g.raw)
        .join("")
        .normalize("NFKC");
      L.kind = L.text.includes("يوزر") ? "user" : L.text.includes("اسم") ? "name" : "other";
    }

    // Bucket each value token under the nearest label to its right (same row).
    const values = items.filter((it) => isValue(it.raw));
    const buckets = new Map();
    for (const v of values) {
      let best = -1;
      for (let i = 0; i < labels.length; i++) {
        const L = labels[i];
        if (L.minX > v.x && Math.abs(L.y - v.y) <= 8) {
          if (best === -1 || L.minX < labels[best].minX) best = i;
        }
      }
      if (best !== -1) (buckets.get(best) ?? buckets.set(best, []).get(best)).push(v);
    }

    const valueOf = (kind) => {
      for (let i = 0; i < labels.length; i++) {
        if (labels[i].kind === kind && buckets.get(i)?.length) {
          return buckets
            .get(i)
            .sort((a, b) => a.x - b.x)
            .map((t) => t.raw)
            .join(" ")
            .normalize("NFKC")
            .replace(/\s+/g, " ")
            .trim();
        }
      }
      return null;
    };

    let username = valueOf("user") || valueOf("name");
    if (username && (looksDate(username) || username.toLowerCase() === "triple")) username = null;
    return { username: username || null };
  } finally {
    try {
      await task.destroy();
    } catch {
      /* ignore teardown errors */
    }
  }
}

const files = readdirSync(DIR).filter((f) => /\.pdf$/i.test(f) && !f.startsWith("~$"));

const found = [];
const missing = [];
for (const name of files) {
  const nickname = name.replace(/\.pdf$/i, "");
  try {
    const { username } = await extractUsername(`${DIR}\\${name}`);
    if (username) found.push({ nickname, username });
    else missing.push(nickname);
  } catch (e) {
    missing.push(`${nickname}  (error: ${e.message})`);
  }
}

console.log(`\nExtracted ${found.length}/${files.length} usernames (${missing.length} missing).`);
console.log("\n── Sample ──");
for (const r of found.slice(0, 40)) {
  console.log(`  ${r.username}   ←  ${r.nickname}`);
}
if (missing.length) {
  console.log("\n── Not found (fill manually in admin) ──");
  for (const m of missing) console.log("  " + m);
}

if (!CONFIRM) {
  console.log("\nDRY RUN. Re-run with USERNAMES_CONFIRM=1 to write to the database.");
  process.exit(0);
}

const { createClient } = await import("@supabase/supabase-js");
const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

let ok = 0;
for (const r of found) {
  const { error } = await db
    .from("legacy_reports")
    .update({ discord_username: r.username })
    .eq("nickname", r.nickname);
  if (error) console.error(`✖ ${r.nickname}:`, error.message);
  else ok++;
}
console.log(`\n✓ Updated ${ok}/${found.length} legacy_reports rows.`);
process.exit(0);
