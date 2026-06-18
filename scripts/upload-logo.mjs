/**
 * Uploads an image to a public Supabase Storage bucket and prints its public URL.
 *   node --env-file=.env.local scripts/upload-logo.mjs <localPath> <destName>
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "email-assets";
const localPath = process.argv[2];
const destName = process.argv[3];

if (!localPath || !destName) {
  console.error("usage: upload-logo.mjs <localPath> <destName>");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

// Ensure a public bucket (ignore "already exists").
const { error: bucketErr } = await admin.storage.createBucket(BUCKET, {
  public: true,
});
if (bucketErr && !/exists/i.test(bucketErr.message)) {
  console.error("✖ bucket:", bucketErr.message);
  process.exit(1);
}

const file = readFileSync(localPath);
const { error } = await admin.storage
  .from(BUCKET)
  .upload(destName, file, { contentType: "image/png", upsert: true });
if (error) {
  console.error("✖ upload:", error.message);
  process.exit(1);
}

const { data } = admin.storage.from(BUCKET).getPublicUrl(destName);
console.log("✓ PUBLIC URL:", data.publicUrl);
