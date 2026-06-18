import { NextResponse } from "next/server";
import {
  orderConfirmationEmail,
  subscriptionConfirmationEmail,
  welcomeMagicLinkEmail,
  passwordResetEmail,
  subscriptionRenewalEmail,
  type EmailContent,
} from "@/lib/email/templates";
import { sendEmail } from "@/lib/email/mailer";
import { siteConfig } from "@/lib/site-config";

/**
 * ⚠️ DEV-ONLY email previewer (gated by NEXT_PUBLIC_ENABLE_TEST_PAY).
 *   /api/dev/preview-email?type=order|subscription|welcome|reset|renewal     → HTML preview
 *   /api/dev/preview-email?type=order&send=1&to=you@example.com              → send test
 */
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://adaa.store";

function sample(type: string): EmailContent {
  switch (type) {
    case "subscription":
      return subscriptionConfirmationEmail({
        orderNumber: 5007,
        planLabel: "شهري",
        amount: 10,
        currency: "USD",
        orderUrl: `${SITE}/order/sample`,
        downloadUrl: siteConfig.adaaxDownloadUrl,
        accountUrl: `${SITE}/account`,
      });
    case "welcome":
      return welcomeMagicLinkEmail({
        name: "محمد",
        magicLink: `${SITE}/auth/confirm?token_hash=sample&type=magiclink&next=/account`,
      });
    case "reset":
      return passwordResetEmail({
        resetLink: `${SITE}/auth/confirm?token_hash=sample&type=recovery&next=/reset-password`,
      });
    case "renewal":
      return subscriptionRenewalEmail({
        orderNumber: 5008,
        planLabel: "شهري",
        amount: 10,
        currency: "USD",
        periodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
        accountUrl: `${SITE}/account`,
      });
    default:
      return orderConfirmationEmail({
        orderNumber: 5006,
        items: [
          { name: "باقة بريميوم", price: 50, qty: 1, currency: "$" },
          { name: "باقة عادية", price: 35, qty: 1, currency: "$" },
        ],
        amount: 85,
        currency: "USD",
        orderUrl: `${SITE}/order/sample`,
        discordUrl: siteConfig.discordUrl,
        whatsappUrl: siteConfig.whatsappUrl,
      });
  }
}

export async function GET(request: Request) {
  if (process.env.NEXT_PUBLIC_ENABLE_TEST_PAY !== "true") {
    return NextResponse.json({ error: "disabled" }, { status: 404 });
  }
  const url = new URL(request.url);
  const type = url.searchParams.get("type") || "order";
  const content = sample(type);

  const to = url.searchParams.get("to");
  if (url.searchParams.get("send") === "1" && to) {
    const r = await sendEmail({ to, ...content });
    return NextResponse.json({ sent: r.ok, skipped: r.skipped, type, to });
  }

  return new NextResponse(content.html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
