import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { licenseConfigured } from "@/lib/license/jwt";

/**
 * Step 1 of the AdaaX device-link flow (called by the desktop app, no session).
 * Creates a short, single-use, time-limited code tied to the device's HWID hash,
 * and returns the browser URL the app should open for the user to approve.
 *
 * The HWID is the practical poll secret: it's stored here but never shown on the
 * approval page, so a web visitor who sees the code can't claim the token.
 */
export const dynamic = "force-dynamic";

// Unambiguous alphabet (no 0/O/1/I/L) → easy to read off the screen if needed.
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LEN = 8;
const TTL_MINUTES = 10;

function makeCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LEN; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://adaa.store";

export async function POST(request: Request) {
  if (!licenseConfigured()) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as { hwid?: string };
  const hwid = (body.hwid || "").trim();
  // getHardwareId() returns a 64-char SHA-256 hex; reject obviously bad input.
  if (!/^[a-f0-9]{32,128}$/i.test(hwid)) {
    return NextResponse.json({ error: "bad_hwid" }, { status: 400 });
  }

  const db = createAdminClient();

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeCode();
    const expiresAt = new Date(Date.now() + TTL_MINUTES * 60_000).toISOString();
    const { error } = await db.from("device_link_codes").insert({
      code,
      hwid_hash: hwid,
      status: "pending",
      expires_at: expiresAt,
    });

    if (!error) {
      return NextResponse.json({
        code,
        linkUrl: `${SITE}/link?code=${code}`,
        ttlSeconds: TTL_MINUTES * 60,
      });
    }
    // 23505 = unique violation on the code → retry with a fresh one.
    if (error.code !== "23505") {
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "code_collision" }, { status: 500 });
}
