/**
 * Branded transactional email templates — light theme, green Adaa identity,
 * RTL, Cairo (with safe fallbacks), centered CTAs. Built table-based with inline
 * styles for maximum compatibility (Gmail web + app, Apple Mail, Outlook).
 * Every template returns { subject, html, text } (text part aids deliverability).
 */

const C = {
  green: "#508d4e",
  greenDark: "#3f6e3d",
  ink: "#14331f",
  text: "#3f4a44",
  muted: "#8a958f",
  bg: "#eef2f0",
  card: "#ffffff",
  border: "#e4e9e6",
  soft: "#eef4ee", // light green tint
};

const FONT = "'Cairo','Segoe UI',Tahoma,Arial,sans-serif";
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://adaa.store";
const LOGO = process.env.NEXT_PUBLIC_EMAIL_LOGO_URL || "";

export type EmailContent = { subject: string; html: string; text: string };

/** Convert Arabic-Indic / Eastern-Arabic digits to Latin (brand uses Western numerals). */
function latin(s: string): string {
  return s.replace(/[٠-٩۰-۹]/g, (d) => {
    const code = d.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

function esc(s: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
  };
  return s.replace(/[&<>"]/g, (c) => map[c] ?? c);
}

function money(amount: number, currency: string): string {
  return `${currency === "USD" ? "$" : currency}${amount}`;
}

/** Centered, bulletproof button. */
function button(href: string, label: string, bg = C.green): string {
  return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:6px auto"><tr>
<td align="center" bgcolor="${bg}" style="border-radius:10px">
<a href="${esc(href)}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 34px;font-family:${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:10px">${esc(label)}</a>
</td></tr></table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 12px;font-family:${FONT};font-size:24px;font-weight:700;color:${C.ink};text-align:center">${esc(text)}</h1>`;
}

function lead(html: string): string {
  return `<p style="margin:0 0 22px;font-family:${FONT};font-size:15px;line-height:1.8;color:${C.text};text-align:center">${html}</p>`;
}

function para(html: string): string {
  return `<p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.8;color:${C.text};text-align:right">${html}</p>`;
}

function orderBadge(orderNumber: number): string {
  return `<table role="presentation" align="center" cellpadding="0" cellspacing="0" border="0" style="margin:0 auto 22px"><tr>
<td align="center" bgcolor="${C.soft}" style="border:1px solid ${C.border};border-radius:12px;padding:10px 20px;font-family:${FONT};font-size:17px;font-weight:700;color:${C.greenDark}">
طلب رقم #${orderNumber}</td></tr></table>`;
}

/** Light bordered info box (RTL). */
function infoBox(inner: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 18px"><tr>
<td bgcolor="${C.soft}" style="border:1px solid ${C.border};border-radius:12px;padding:18px 20px">${inner}</td></tr></table>`;
}

function itemsTable(
  items: { name?: string; qty?: number; price?: number; currency?: string }[],
  total: number,
  currency: string,
): string {
  const rows = items
    .map((it) => {
      const line =
        typeof it.price === "number"
          ? money((it.price ?? 0) * (it.qty ?? 1), it.currency ?? currency)
          : "";
      const qty = it.qty && it.qty > 1 ? ` × ${it.qty}` : "";
      return `<tr>
<td style="padding:9px 0;border-bottom:1px solid ${C.border};font-family:${FONT};font-size:14px;color:${C.text};text-align:right">${esc(it.name ?? "عنصر")}${qty}</td>
<td style="padding:9px 0;border-bottom:1px solid ${C.border};font-family:${FONT};font-size:14px;color:${C.text};text-align:left" dir="ltr">${line}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${rows}
<tr><td style="padding:13px 0 0;font-family:${FONT};font-weight:700;font-size:15px;color:${C.ink};text-align:right">الإجمالي</td>
<td style="padding:13px 0 0;font-family:${FONT};font-weight:700;font-size:19px;color:${C.green};text-align:left" dir="ltr">${money(total, currency)}</td></tr></table>`;
}

function stepsList(steps: [string, string][]): string {
  const items = steps
    .map(
      ([t, d], i) => `<tr>
<td valign="top" width="40" style="padding:0 0 16px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" width="32" height="32" bgcolor="${C.soft}" style="border:2px solid ${C.green};border-radius:50%;font-family:${FONT};font-weight:700;font-size:14px;color:${C.greenDark}">${i + 1}</td></tr></table></td>
<td valign="top" style="padding:0 12px 16px 0;font-family:${FONT};text-align:right">
<div style="font-size:15px;font-weight:700;color:${C.ink}">${esc(t)}</div>
<div style="font-size:13px;line-height:1.7;color:${C.muted};margin-top:2px">${esc(d)}</div></td></tr>`,
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:6px 0 4px">${items}</table>`;
}

/** Full email shell: light bg, green header band with logo, white body, footer. */
function layout(opts: { title: string; preheader: string; body: string }): string {
  const logoImg = LOGO
    ? `<img src="${esc(LOGO)}" width="150" alt="أداء" style="display:block;margin:0 auto;width:150px;max-width:60%;height:auto;border:0" />`
    : `<div style="font-family:${FONT};font-size:28px;font-weight:800;color:#ffffff">أداء</div>`;

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="ar" dir="rtl" xmlns="https://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<title>${esc(opts.title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
  @media only screen and (max-width:600px){
    .container{width:100%!important}
    .px{padding-left:22px!important;padding-right:22px!important}
  }
  body{margin:0;padding:0;background:${C.bg};}
</style>
</head>
<body dir="rtl" style="margin:0;padding:0;background:${C.bg};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0">${esc(opts.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.bg}" style="background:${C.bg}">
<tr><td align="center" style="padding:30px 12px">
<table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px">
<!-- header band -->
<tr><td align="center" bgcolor="${C.green}" style="background:${C.green};padding:30px 24px;border-radius:16px 16px 0 0">${logoImg}</td></tr>
<!-- body -->
<tr><td class="px" bgcolor="${C.card}" style="background:${C.card};padding:38px 36px;border-left:1px solid ${C.border};border-right:1px solid ${C.border}">${opts.body}</td></tr>
<!-- footer -->
<tr><td class="px" bgcolor="${C.card}" style="background:${C.card};padding:0 36px 30px;border-radius:0 0 16px 16px;border-left:1px solid ${C.border};border-right:1px solid ${C.border};border-bottom:1px solid ${C.border}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:1px solid ${C.border};padding-top:20px;text-align:center;font-family:${FONT};font-size:12px;line-height:1.9;color:${C.muted}">
متجر أداء (Adaa.store) — خيارك الأول لأعلى جودة وأداء<br/>
<a href="${esc(SITE)}" style="color:${C.green};text-decoration:none">adaa.store</a> &nbsp;·&nbsp; رسالة آلية من no-reply@adaa.store
</td></tr></table>
</td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

// ─── Templates ──────────────────────────────────────────────────────────────

export function orderConfirmationEmail(d: {
  orderNumber: number;
  items: { name?: string; qty?: number; price?: number; currency?: string }[];
  amount: number;
  currency: string;
  orderUrl: string;
  discordUrl: string;
  whatsappUrl: string;
}): EmailContent {
  const body = `
${heading("تم استلام طلبك بنجاح! 🎉")}
${lead("شكراً لثقتك في <b>أداء</b>. ده تأكيد طلبك — احتفظ برقمه عشان تتواصل بينا بيه.")}
${orderBadge(d.orderNumber)}
${infoBox(itemsTable(d.items, d.amount, d.currency))}
${para("<b>الخطوة الجاية:</b> تواصل معانا عبر ديسكورد أو واتساب وابعت رقم الطلب، وهنبدأ تنفيذ الخدمة وتحديد الموعد.")}
${button(d.discordUrl, "تواصل عبر ديسكورد", "#5865F2")}
${button(d.whatsappUrl, "تواصل عبر واتساب", "#25D366")}
<p style="margin:18px 0 0;font-family:${FONT};font-size:13px;color:${C.muted};text-align:center">
تقدر تشوف تفاصيل طلبك من <a href="${esc(d.orderUrl)}" style="color:${C.green}">صفحة الطلب</a>.</p>`;
  return {
    subject: `تأكيد الطلب #${d.orderNumber} — أداء`,
    html: layout({ title: "تأكيد الطلب", preheader: `طلبك #${d.orderNumber} وصل بنجاح وجاهز للتنفيذ`, body }),
    text: `تم استلام طلبك #${d.orderNumber} بنجاح.\nالإجمالي: ${money(d.amount, d.currency)}\nتواصل معنا وابعت رقم الطلب:\nديسكورد: ${d.discordUrl}\nواتساب: ${d.whatsappUrl}\nتفاصيل الطلب: ${d.orderUrl}`,
  };
}

export function subscriptionConfirmationEmail(d: {
  orderNumber: number;
  planLabel: string;
  amount: number;
  currency: string;
  orderUrl: string;
  downloadUrl: string;
  accountUrl: string;
}): EmailContent {
  const download = d.downloadUrl
    ? button(d.downloadUrl, "⬇  تحميل AdaaX")
    : `<p style="margin:8px 0 14px;font-family:${FONT};font-size:14px;color:${C.muted};text-align:center">رابط تحميل البرنامج هيوصلك قريباً.</p>`;
  const body = `
${heading("تم تفعيل اشتراك AdaaX! 🎉")}
${lead(`أهلاً بيك في <b>AdaaX</b> — اشتراكك (${esc(d.planLabel)}) اتفعّل وجاهز.`)}
${orderBadge(d.orderNumber)}
${infoBox(stepsList([
  ["حمّل البرنامج", "اضغط زر تحميل AdaaX وثبّته على جهازك."],
  ["سجّل الدخول", "افتح البرنامج وسجّل دخول بنفس حساب الموقع."],
  ["اشتراكك جاهز", "هيتفعّل تلقائياً مربوط بجهازك."],
]))}
${download}
<p style="margin:18px 0 0;font-family:${FONT};font-size:13px;color:${C.muted};text-align:center">
<a href="${esc(d.accountUrl)}" style="color:${C.green}">إدارة اشتراكي</a> &nbsp;·&nbsp; <a href="${esc(d.orderUrl)}" style="color:${C.green}">تفاصيل الطلب</a></p>`;
  return {
    subject: `تفعيل اشتراك AdaaX #${d.orderNumber} — أداء`,
    html: layout({ title: "تفعيل الاشتراك", preheader: "اشتراك AdaaX اتفعّل — حمّل البرنامج وابدأ", body }),
    text: `تم تفعيل اشتراك AdaaX (${d.planLabel}) — طلب #${d.orderNumber}.\nحمّل البرنامج: ${d.downloadUrl || "(قريباً)"}\nسجّل دخول بنفس حساب الموقع وهيتفعّل تلقائياً.\nحسابك: ${d.accountUrl}`,
  };
}

export function welcomeMagicLinkEmail(d: { name?: string; magicLink: string }): EmailContent {
  const hi = d.name ? `أهلاً ${esc(d.name)} 👋` : "أهلاً بيك 👋";
  const body = `
${heading("حسابك في أداء جاهز ✅")}
${lead(`${hi}<br/>عملنالك حساب تلقائياً عشان تتابع طلباتك واشتراكاتك في أي وقت.`)}
${para("اضغط الزر عشان تدخل حسابك مباشرة بدون باسورد. تقدر تحدد كلمة مرور بعدين من إعدادات حسابك.")}
${button(d.magicLink, "الدخول إلى حسابي")}
<p style="margin:18px 0 0;font-family:${FONT};font-size:12px;color:${C.muted};text-align:center">
الرابط صالح لفترة محدودة ولمرة واحدة. لو ماطلبتش ده، تجاهل الرسالة.</p>`;
  return {
    subject: "حسابك في أداء جاهز — سجّل الدخول",
    html: layout({ title: "حسابك جاهز", preheader: "ادخل حسابك بضغطة واحدة بدون باسورد", body }),
    text: `${d.name ? `أهلاً ${d.name}،` : "أهلاً بيك،"}\nعملنالك حساب في أداء. ادخل حسابك من هنا (رابط لمرة واحدة):\n${d.magicLink}`,
  };
}

export function passwordResetEmail(d: { resetLink: string }): EmailContent {
  const body = `
${heading("إعادة تعيين كلمة المرور")}
${lead("استلمنا طلب لإعادة تعيين كلمة مرور حسابك.")}
${para("اضغط الزر لتعيين كلمة مرور جديدة:")}
${button(d.resetLink, "تعيين كلمة مرور جديدة")}
<p style="margin:18px 0 0;font-family:${FONT};font-size:12px;color:${C.muted};text-align:center">
الرابط صالح لفترة محدودة. لو ماطلبتش ده، تجاهل الرسالة وحسابك آمن.</p>`;
  return {
    subject: "إعادة تعيين كلمة المرور — أداء",
    html: layout({ title: "إعادة تعيين كلمة المرور", preheader: "تعيين كلمة مرور جديدة لحسابك في أداء", body }),
    text: `لإعادة تعيين كلمة المرور افتح الرابط:\n${d.resetLink}\nلو ماطلبتش ده تجاهل الرسالة.`,
  };
}

export function subscriptionRenewalEmail(d: {
  orderNumber: number;
  planLabel: string;
  amount: number;
  currency: string;
  periodEnd: string | null;
  accountUrl: string;
}): EmailContent {
  const until = d.periodEnd
    ? new Date(d.periodEnd).toLocaleDateString("ar-EG-u-nu-latn", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";
  const body = `
${heading("تم تجديد اشتراك AdaaX ✅")}
${lead(`اتجدّد اشتراكك (${esc(d.planLabel)}) بنجاح. شكراً لاستمرارك مع أداء.`)}
${orderBadge(d.orderNumber)}
${infoBox(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-family:${FONT}">
<tr><td style="padding:4px 0;font-size:14px;color:${C.text};text-align:right">المبلغ</td><td style="padding:4px 0;font-size:14px;font-weight:700;color:${C.ink};text-align:left" dir="ltr">${money(d.amount, d.currency)}</td></tr>
<tr><td style="padding:4px 0;font-size:14px;color:${C.text};text-align:right">ساري حتى</td><td style="padding:4px 0;font-size:14px;font-weight:700;color:${C.ink};text-align:left">${until}</td></tr>
</table>`)}
${button(d.accountUrl, "إدارة اشتراكي")}`;
  return {
    subject: `تجديد اشتراك AdaaX #${d.orderNumber} — أداء`,
    html: layout({ title: "تجديد الاشتراك", preheader: "تم تجديد اشتراك AdaaX بنجاح", body }),
    text: `تم تجديد اشتراك AdaaX (${d.planLabel}) — طلب #${d.orderNumber}.\nالمبلغ: ${money(d.amount, d.currency)}\nساري حتى: ${until}\nحسابك: ${d.accountUrl}`,
  };
}

type ReportMetric = { label: string; before?: string; after?: string; value?: string; unit?: string };

/** Render report metric rows. before→after reads right→left in this RTL cell
 * via a single LTR wrapper: "before → after" (arrow points to the new value). */
function metricsTable(metrics: ReportMetric[]): string {
  const rows = metrics
    .map((m) => {
      const unit = m.unit ? ` ${esc(m.unit)}` : "";
      let val: string;
      if (m.before || m.after) {
        val = `<span dir="ltr">${esc(latin(m.before ?? "—"))}${unit} &nbsp;→&nbsp; <b style="color:${C.green}">${esc(latin(m.after ?? "—"))}${unit}</b></span>`;
      } else {
        val = m.value
          ? `<span dir="ltr" style="font-weight:700;color:${C.ink}">${esc(latin(m.value))}${unit}</span>`
          : "—";
      }
      return `<tr>
<td style="padding:9px 0;border-bottom:1px solid ${C.border};font-family:${FONT};font-size:14px;color:${C.text};text-align:right">${esc(m.label)}</td>
<td style="padding:9px 0;border-bottom:1px solid ${C.border};font-family:${FONT};font-size:14px;text-align:left">${val}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>`;
}

export function installationReportEmail(d: {
  orderNumber: number;
  customerName?: string | null;
  cpuModel?: string | null;
  gpuModel?: string | null;
  metrics: ReportMetric[];
  tweaksCount?: number;
  reportUrl: string;
  discordUrl: string;
}): EmailContent {
  const hi = d.customerName ? `أهلاً ${esc(d.customerName)} 👋` : "أهلاً بيك 👋";
  const hw = [d.cpuModel ? `المعالج: ${esc(d.cpuModel)}` : "", d.gpuModel ? `كرت الشاشة: ${esc(d.gpuModel)}` : ""]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");
  const tweaks = d.tweaksCount && d.tweaksCount > 0
    ? para(`✅ تم تطبيق <b>${latin(String(d.tweaksCount))}</b> تعديلًا احترافيًا على جهازك (التفاصيل الكاملة في التقرير).`)
    : "";
  const body = `
${heading("تم تركيب خدمتك بنجاح ✅")}
${lead(`${hi}<br/>خلّصنا تحسين أداء جهازك، وده تقريرك المفصّل بالنتائج قبل وبعد.`)}
${orderBadge(d.orderNumber)}
${hw ? para(`<b>الجهاز:</b> ${hw}`) : ""}
${infoBox(metricsTable(d.metrics))}
${tweaks}
${button(d.reportUrl, "عرض تقرير التركيب الكامل")}
<p style="margin:18px 0 0;font-family:${FONT};font-size:13px;color:${C.muted};text-align:center">
لأي استفسار بعد الخدمة تواصل معانا عبر <a href="${esc(d.discordUrl)}" style="color:${C.green}">ديسكورد</a>.</p>`;
  return {
    subject: `تقرير تركيب خدمتك جاهز #${d.orderNumber} — أداء`,
    html: layout({ title: "تقرير عملية التركيب", preheader: "تم تركيب خدمتك — شوف نتائج الأداء قبل وبعد", body }),
    text: `تم تركيب خدمتك بنجاح (طلب #${d.orderNumber}).\n${d.cpuModel ? "المعالج: " + d.cpuModel + "\n" : ""}شوف تقرير التركيب الكامل: ${d.reportUrl}\nلأي استفسار: ${d.discordUrl}`,
  };
}
