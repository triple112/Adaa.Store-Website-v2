/**
 * Verifies Hostinger SMTP end-to-end by sending one test email.
 *   node --env-file=.env.local scripts/test-email.mjs you@example.com
 */
import nodemailer from "nodemailer";

const to = process.argv[2] || process.env.SMTP_USER;
const port = Number(process.env.SMTP_PORT || 465);

const t = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

try {
  await t.verify();
  console.log("✓ SMTP connection + auth OK");
  const info = await t.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject: "اختبار بريد أداء ✅",
    text: "ده اختبار من نظام أداء. لو وصلك في الـ inbox يبقى كله تمام.",
    html: `<div dir="rtl" style="font-family:Tahoma,Arial;font-size:16px;color:#374151">
      <p>ده اختبار من نظام <b style="color:#508d4e">أداء</b> ✅</p>
      <p>لو وصلك في الـ inbox يبقى الإعداد سليم.</p></div>`,
  });
  console.log("✓ sent:", info.messageId, "->", to);
} catch (e) {
  console.error("✖", e.message);
  process.exit(1);
}
