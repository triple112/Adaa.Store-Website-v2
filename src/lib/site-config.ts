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
