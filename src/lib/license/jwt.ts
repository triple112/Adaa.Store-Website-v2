import "server-only";
import { SignJWT, jwtVerify } from "jose";

/**
 * Signed license tokens for the AdaaX desktop app.
 *
 * HS256 (symmetric) is intentional: the token is ONLY ever verified server-side
 * (in /api/app/validate), so there's no public key to ship in the client. The
 * token is just a device credential — actual access is re-checked live against
 * the subscription + device row on every launch, so a leaked/forged token still
 * can't unlock an inactive subscription.
 */
const ISSUER = "adaa-store";
const AUDIENCE = "adaax-app";

function secretKey(): Uint8Array {
  const s = process.env.LICENSE_JWT_SECRET;
  if (!s) throw new Error("LICENSE_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
}

export function licenseConfigured(): boolean {
  return Boolean(process.env.LICENSE_JWT_SECRET);
}

export type LicenseClaims = {
  /** user_id (auth.users.id / profiles.id) */
  sub: string;
  /** SHA-256 HWID hash bound to this token */
  hwid: string;
  /** subscription_id — present for subscriber tokens */
  sid?: string;
  /** license_devices.id — present for subscriber tokens */
  did?: string;
  /** "admin" for owner/admin tokens (no subscription required) */
  role?: "admin";
};

/** Sign a long-lived device token. Validity is gated live server-side, not by exp. */
export async function signLicenseToken(claims: LicenseClaims): Promise<string> {
  return new SignJWT({ hwid: claims.hwid, sid: claims.sid, did: claims.did, role: claims.role })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime("400d")
    .sign(secretKey());
}

/** Verify signature + iss/aud. Returns claims or null (never throws). */
export async function verifyLicenseToken(
  token: string,
): Promise<LicenseClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (!payload.sub || typeof payload.hwid !== "string") return null;
    return {
      sub: payload.sub,
      hwid: payload.hwid,
      sid: typeof payload.sid === "string" ? payload.sid : undefined,
      did: typeof payload.did === "string" ? payload.did : undefined,
      role: payload.role === "admin" ? "admin" : undefined,
    };
  } catch {
    return null;
  }
}
