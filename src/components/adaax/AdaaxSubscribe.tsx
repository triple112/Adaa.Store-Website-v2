/**
 * AdaaxSubscribe — the subscription section. Presentational only; all data
 * (pricing, auth state, active subscription) is fetched on the server in
 * /adaax/page.tsx and passed in. Wraps the existing <SubscribeButtons /> and
 * preserves the full PayPal subscription flow untouched.
 */
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckIcon } from "@/components/ui/icons";
import { SubscribeButtons } from "@/components/subscribe/SubscribeButtons";

const INCLUDED = [
  "تحسينات أداء متقدمة للـ CPU و GPU والذاكرة",
  "ضبط إعدادات الويندوز والطاقة للألعاب",
  "إزالة البرامج الزائدة وتسريع الإقلاع",
  "نقاط استعادة آمنة قبل أي تعديل",
  "تحديثات وأدوات جديدة باستمرار",
  "ترخيص لجهاز واحد مربوط بحسابك",
];

export function AdaaxSubscribe({
  hasActive,
  isLoggedIn,
  clientId,
  planMonthly,
  planYearly,
  monthlyUsd,
  yearlyUsd,
  yearlyDiscountPct,
}: {
  hasActive: boolean;
  isLoggedIn: boolean;
  clientId: string;
  planMonthly: string;
  planYearly: string;
  monthlyUsd: number;
  yearlyUsd: number;
  yearlyDiscountPct: number;
}) {
  return (
    <Section id="subscribe">
      <Container>
        <SectionHeading
          eyebrow="الاشتراك"
          title={
            <>
              فعّل كامل قوة جهازك <span className="text-gradient">مع AdaaX</span>
            </>
          }
          subtitle="اختر الخطة المناسبة لك — يتفعّل البرنامج تلقائياً على جهازك بعد الاشتراك."
        />

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-2">
          {/* What's included */}
          <div className="rounded-2xl border border-white/10 bg-surface p-7">
            <h3 className="font-display text-xl font-bold text-white">المميزات</h3>
            <ul className="mt-5 space-y-3.5">
              {INCLUDED.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-muted">
                  <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-light">
                    <CheckIcon className="h-3.5 w-3.5" />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Subscribe card */}
          <div className="relative overflow-hidden rounded-2xl border border-primary/25 bg-surface p-7 shadow-[0_8px_50px_rgba(80,141,78,0.12)]">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full bg-primary/15 blur-3xl"
            />
            {hasActive ? (
              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <p className="text-lg font-bold text-primary-light">عندك اشتراك نشط بالفعل ✅</p>
                <Link
                  href="/account"
                  className="mt-5 inline-flex items-center rounded-xl border border-primary/40 px-6 py-3 font-display font-bold text-primary-light transition-colors hover:bg-primary/10"
                >
                  إدارة اشتراكك
                </Link>
              </div>
            ) : (
              <div className="relative">
                <h3 className="font-display text-xl font-bold text-white">ابدأ اشتراكك</h3>
                <p className="mb-6 mt-1 text-sm text-muted">اختر الخطة المناسبة لك.</p>
                <SubscribeButtons
                  clientId={clientId}
                  planMonthly={planMonthly}
                  planYearly={planYearly}
                  monthlyUsd={monthlyUsd}
                  yearlyUsd={yearlyUsd}
                  yearlyDiscountPct={yearlyDiscountPct}
                  isLoggedIn={isLoggedIn}
                />
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}
