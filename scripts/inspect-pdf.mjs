/**
 * Dump text items (with x/y positions) from one legacy report PDF, to discover
 * the "يوزر العميل" → username layout. Read-only inspection.
 *   node scripts/inspect-pdf.mjs
 */
import { readFileSync } from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const PATH =
  process.env.PDF_PATH || "E:\\كل شي يخص adaa\\ملفات pdf العملاء\\𝐑𝐁𝐙.pdf";

const data = new Uint8Array(readFileSync(PATH));
const doc = await getDocument({ data, useSystemFonts: true }).promise;
console.log("pages:", doc.numPages);

for (let p = 1; p <= doc.numPages; p++) {
  const page = await doc.getPage(p);
  const content = await page.getTextContent();
  console.log(`\n──── page ${p} (${content.items.length} items) ────`);
  for (const it of content.items) {
    if (!it.str || !it.str.trim()) continue;
    const x = Math.round(it.transform[4]);
    const y = Math.round(it.transform[5]);
    console.log(`[x=${x} y=${y}] "${it.str}"`);
  }
}
