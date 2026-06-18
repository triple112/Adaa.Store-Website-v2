/**
 * Public site configuration (contact channels + AdaaX download).
 * Values come from env so they can change without code edits; sensible defaults
 * match the brand's current channels.
 */
export const siteConfig = {
  discordUrl:
    process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/v9xMtJpA72",
  whatsappUrl:
    process.env.NEXT_PUBLIC_WHATSAPP_URL || "https://wa.me/message/6DHYVOGBIGQ3I1",
  adaaxDownloadUrl: process.env.NEXT_PUBLIC_ADAAX_DOWNLOAD_URL || "",
};

/** Display form for an order number, e.g. 5000 → "#5000". */
export function formatOrderNumber(n: number | null | undefined): string {
  return n ? `#${n}` : "—";
}

/** Convert Arabic-Indic / Eastern-Arabic digits to Latin 0-9. */
export function toLatinDigits(value: string | number | null | undefined): string {
  if (value == null) return "";
  return String(value).replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

// Arabic month/label text but with Latin digits (the brand wants Western numerals).
const AR_LATN = "ar-EG-u-nu-latn";

/** Date like "15 يونيو 2026" (Arabic words, Latin digits). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(AR_LATN, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/** Date + time with Latin digits. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleString(AR_LATN, {
    dateStyle: "short",
    timeStyle: "short",
  });
}
