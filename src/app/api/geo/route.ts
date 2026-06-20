import { NextResponse } from "next/server";

/**
 * Best-effort country detection for the visitor, used to pre-select the checkout
 * country. Tries the platform's geo headers first (Cloudflare / Vercel / proxy),
 * then geolocates the forwarded IP via a free service. Returns `{ country }`
 * (ISO-2) or `{ country: null }` when it can't tell (e.g. local dev).
 */
export const dynamic = "force-dynamic";

function isPublicIp(ip: string): boolean {
  if (!ip) return false;
  if (ip === "::1" || ip.startsWith("127.") || ip.startsWith("10.")) return false;
  if (ip.startsWith("192.168.") || ip.startsWith("::ffff:127.")) return false;
  if (ip.startsWith("169.254.") || ip.startsWith("fc") || ip.startsWith("fd")) return false;
  const m = ip.match(/^172\.(\d+)\./);
  if (m && +m[1] >= 16 && +m[1] <= 31) return false;
  return true;
}

export async function GET(request: Request) {
  const h = request.headers;

  // 1) Platform geo headers (no external call needed).
  const fromHeader = (
    h.get("x-vercel-ip-country") ||
    h.get("cf-ipcountry") ||
    h.get("x-country-code") ||
    ""
  ).toUpperCase();
  if (/^[A-Z]{2}$/.test(fromHeader) && fromHeader !== "XX") {
    return NextResponse.json({ country: fromHeader });
  }

  // 2) Geolocate the forwarded client IP.
  const ip = (h.get("x-forwarded-for") || h.get("x-real-ip") || "").split(",")[0].trim();
  if (isPublicIp(ip)) {
    try {
      const res = await fetch(`https://get.geojs.io/v1/ip/country/${ip}.json`, {
        cache: "no-store",
        signal: AbortSignal.timeout(2500),
      });
      if (res.ok) {
        const data = (await res.json()) as { country?: string };
        const code = (data.country || "").toUpperCase();
        if (/^[A-Z]{2}$/.test(code)) return NextResponse.json({ country: code });
      }
    } catch {
      /* network/timeout — fall through */
    }
  }

  return NextResponse.json({ country: null });
}
