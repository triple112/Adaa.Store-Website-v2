import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteConfig, formatOrderNumber, formatDate } from "@/lib/site-config";
import { CopyButton } from "@/components/order/CopyButton";
import { CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "تفاصيل الطلب" };
export const dynamic = "force-dynamic";

type OrderItem = {
  name?: string;
  price?: number;
  qty?: number;
  currency?: string;
};

type Order = {
  id: string;
  order_number: number;
  type: string;
  items: OrderItem[] | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "مدفوع",
  installed: "تم التركيب",
  pending: "قيد المعالجة",
  failed: "فشل",
  refunded: "مسترد",
};

function money(amount: number, currency: string) {
  return `${currency === "USD" ? "$" : currency}${amount}`;
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Confirmation pages are reachable by their unguessable order UUID — this lets
  // freshly-created guest accounts (not yet signed in) see their order. The UUID
  // acts as the access token (standard order-confirmation-link pattern).
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, type, items, amount, currency, status, created_at")
    .eq("id", id)
    .maybeSingle<Order>();

  if (!order) notFound();

  // Installation report (if the engineer has filed one for this order).
  const { data: report } = await admin
    .from("installation_reports")
    .select("id")
    .eq("order_id", order.id)
    .maybeSingle<{ id: string }>();

  const isSubscription = order.type === "subscription";
  const isInstalled = order.status === "installed";
  const orderNo = formatOrderNumber(order.order_number);

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:pt-32">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 shadow-[0_8px_30px_rgba(80,141,78,0.25)]">
          <CheckIcon className="h-10 w-10 text-primary-light" />
        </div>
        <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
          {isInstalled ? "تم تركيب خدمتك بنجاح!" : "تم الدفع بنجاح!"}
        </h1>
        <p className="mt-3 max-w-lg leading-relaxed text-muted">
          {isInstalled
            ? "ألف مبروك 🎉 خلّصنا تحسين أداء جهازك. تقدر تشوف تقرير التركيب بالنتائج قبل وبعد."
            : isSubscription
              ? "ألف مبروك 🎉 اشتراكك في AdaaX اتفعّل. حمّل البرنامج وسجّل دخول بنفس حسابك."
              : "ألف مبروك 🎉 طلبك وصل للسيستم وجاهز للتنفيذ. تواصل معنا برقم الطلب عشان نبدأ."}
        </p>
      </div>

      {report && (
        <div className="mt-8 flex flex-col items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center sm:flex-row sm:justify-between sm:text-right">
          <div>
            <h2 className="font-display text-lg font-bold text-white">تقرير عملية التركيب جاهز ✅</h2>
            <p className="mt-0.5 text-sm text-muted">شوف نتائج تحسين الأداء (قبل / بعد) وحمّل التقرير PDF.</p>
          </div>
          <Link
            href={`/report/${report.id}`}
            className="shrink-0 rounded-xl bg-primary px-6 py-3 font-display font-bold text-white transition-colors hover:bg-primary-light"
          >
            📄 عرض التقرير
          </Link>
        </div>
      )}

      {/* Two-column: action side + steps */}
      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Action side */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-surface p-7">
          <h2 className="font-display text-lg font-bold text-white">
            {isSubscription ? "ابدأ استخدام AdaaX" : "تواصل معنا لتنفيذ الخدمة"}
          </h2>
          {isSubscription ? (
            <>
              {siteConfig.adaaxDownloadUrl ? (
                <a
                  href={siteConfig.adaaxDownloadUrl}
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-display font-bold text-white transition-colors hover:bg-primary-light"
                >
                  ⬇ تحميل AdaaX
                </a>
              ) : (
                <span className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-elevated px-6 py-3.5 font-display font-bold text-faint">
                  رابط التحميل قريباً
                </span>
              )}
              <Link
                href="/account"
                className="text-center text-sm font-semibold text-primary-light hover:underline"
              >
                إدارة اشتراكي
              </Link>
            </>
          ) : (
            <>
              <a
                href={siteConfig.discordUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-6 py-3.5 font-display font-bold text-white transition-all hover:brightness-110"
              >
                <DiscordIcon className="h-5 w-5" />
                فتح تذكرة عبر ديسكورد
              </a>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 font-display font-bold text-white transition-all hover:brightness-110"
              >
                <WhatsappIcon className="h-5 w-5" />
                تواصل عبر واتساب
              </a>
            </>
          )}
        </div>

        {/* Steps card */}
        <div className="rounded-2xl border border-white/10 bg-surface p-7">
          <h2 className="mb-5 font-display text-lg font-bold text-white">
            {isSubscription ? "خطوات التفعيل" : "الخطوات المطلوبة"}
          </h2>
          <ol className="space-y-5">
            {(isSubscription
              ? [
                  ["حمّل البرنامج", "اضغط زر تحميل AdaaX وثبّته على جهازك."],
                  ["سجّل الدخول", "افتح البرنامج وسجّل دخول بنفس إيميل/حساب الموقع."],
                  ["اشتراكك جاهز", "هيتفعّل تلقائياً على جهازك مربوط باشتراكك."],
                ]
              : [
                  ["اختر منصة التواصل", "اضغط ديسكورد أو واتساب حسب الأسهل ليك."],
                  ["ابعت رقم الطلب", `انسخ رقم الطلب ${orderNo} من الفاتورة تحت وابعتهولنا.`],
                  ["تحديد الموعد", "المهندس هيحدد معاك أنسب ميعاد لضبط الجهاز."],
                ]
            ).map(([title, desc], i) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-primary/50 font-bold text-primary-light">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-sm font-bold text-white">{title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Invoice */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-surface p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-lg font-bold text-white">الفاتورة</h2>
            <span className="rounded-lg bg-primary/10 px-2.5 py-1 font-mono text-sm font-bold text-primary-light">
              {orderNo}
            </span>
            <CopyButton value={String(order.order_number)} label="نسخ الرقم" />
          </div>
          <span className="text-xs text-faint">{formatDate(order.created_at)}</span>
        </div>

        <ul className="divide-y divide-white/5">
          {(order.items ?? []).map((item, i) => (
            <li key={i} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm text-white">
                {item.name ?? "عنصر"}
                {item.qty && item.qty > 1 ? (
                  <span className="text-faint"> × {item.qty}</span>
                ) : null}
              </span>
              {typeof item.price === "number" && (
                <span className="text-sm font-semibold text-muted" dir="ltr">
                  {money((item.price ?? 0) * (item.qty ?? 1), item.currency ?? order.currency)}
                </span>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <span className="text-sm text-muted">
            الإجمالي ·{" "}
            <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs">
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </span>
          <span className="font-display text-2xl font-bold text-white" dir="ltr">
            {money(order.amount, order.currency)}
          </span>
        </div>
      </div>
    </section>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.317 4.369A19.79 19.79 0 0 0 16.558 3c-.2.36-.43.84-.59 1.23a18.27 18.27 0 0 0-3.937 0A12.6 12.6 0 0 0 11.44 3a19.74 19.74 0 0 0-3.76 1.369C2.84 9.06 2.08 13.64 2.43 18.15a19.9 19.9 0 0 0 6.063 3.06c.49-.67.927-1.38 1.305-2.13-.717-.27-1.4-.604-2.046-.99.171-.126.34-.258.5-.39 3.927 1.83 8.18 1.83 12.06 0 .163.135.332.267.5.39-.647.39-1.332.72-2.05.99.38.75.816 1.46 1.305 2.13a19.84 19.84 0 0 0 6.064-3.06c.41-5.23-.78-9.77-3.314-13.78ZM9.55 15.33c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.33-.96 2.41-2.16 2.41Zm4.9 0c-1.18 0-2.15-1.08-2.15-2.41 0-1.33.95-2.42 2.15-2.42 1.21 0 2.18 1.1 2.16 2.42 0 1.33-.95 2.41-2.16 2.41Z" />
    </svg>
  );
}

function WhatsappIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 0 1 8.413 3.488 11.82 11.82 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24Zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.748-.207Zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414Z" />
    </svg>
  );
}
