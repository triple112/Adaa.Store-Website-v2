import "server-only";
import nodemailer from "nodemailer";

/**
 * Hostinger SMTP transport. Server-only. We send all customer emails ourselves
 * (branded HTML) instead of relying on Supabase's built-in mailer.
 */
let cached: nodemailer.Transporter | null = null;

export function emailConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS,
  );
}

function transporter(): nodemailer.Transporter {
  if (cached) return cached;
  const port = Number(process.env.SMTP_PORT || 465);
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cached;
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!emailConfigured()) {
    console.warn("[email] SMTP not configured — skipping send to", opts.to);
    return { ok: false, skipped: true };
  }
  try {
    await transporter().sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text,
      replyTo: process.env.EMAIL_REPLY_TO || undefined,
    });
    return { ok: true };
  } catch (err) {
    console.error("[email] send failed:", err);
    return { ok: false, error: err instanceof Error ? err.message : "send_failed" };
  }
}
