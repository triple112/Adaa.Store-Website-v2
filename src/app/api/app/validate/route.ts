import { NextResponse } from "next/server";
import { licenseConfigured } from "@/lib/license/jwt";
import { validateLicenseToken } from "@/lib/license/validate";

/**
 * Called by the AdaaX desktop app on every launch. Verifies the device token
 * against the live subscription + device row. Network failure on the app side =
 * treat as locked (strict online), so this only ever returns the server verdict.
 */
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!licenseConfigured()) {
    return NextResponse.json({ valid: false, reason: "not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    token?: string;
    hwid?: string;
  };
  const token = (body.token || "").trim();
  const hwid = (body.hwid || "").trim();
  if (!token || !hwid) {
    return NextResponse.json({ valid: false, reason: "token_invalid" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;

  const result = await validateLicenseToken(token, hwid, { ip });
  return NextResponse.json(result);
}
