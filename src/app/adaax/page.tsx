import type { Metadata } from "next";
import Link from "next/link";
import { getUser } from "@/lib/auth/dal";
import { getAdaaxPricing } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { SubscribeButtons } from "@/components/subscribe/SubscribeButtons";

export const metadata: Metadata = { title: "اشتراك AdaaX" };
export const dynamic = "force-dynamic";

const FEATURES = [
  "تحسينات أداء متقدمة للـ CPU و GPU والذاكرة",
  "ضبط دقيق لإعدادات الويندوز والطاقة للألعاب",
  "إزالة البرامج الزائدة (Debloat) وتسريع الإقلاع",
  "قفل دقّة المؤقّت (Timer Resolution) لأقل تأخير",
  "تحديثات مستمرة وأدوات جديدة باستمرار",
  "ترخيص لجهاز واحد مربوط بحسابك",
];

export default async function AdaaxPage() {
  const [pricing, user] = await Promise.all([getAdaaxPricing(), getUser()]);

  let hasActive = false;
  if (user) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("status", "active")
      .limit(1)
      .maybeSingle();
    hasActive = Boolean(data);
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-20 pt-28 sm:pt-32">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-white">اشتراك AdaaX</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          فعّل كامل قوة جهازك مع تحديثات مستمرة. اشترك من هنا ويتفعّل البرنامج تلقائياً على جهازك.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* المميزات */}
        <div className="rounded-2xl border border-white/10 bg-surface p-7">
          <h2 className="font-display text-xl font-bold text-white">المميزات</h2>
          <ul className="mt-5 space-y-3">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm text-muted">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-light">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* الاشتراك */}
        <div className="rounded-2xl border border-primary/20 bg-surface p-7 shadow-[0_8px_40px_rgba(80,141,78,0.08)]">
          {hasActive ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="text-lg font-bold text-primary-light">عندك اشتراك نشط بالفعل ✅</p>
              <Link
                href="/account"
                className="mt-5 inline-flex items-center rounded-xl border border-primary/40 px-6 py-3 font-display font-bold text-primary-light transition-colors hover:bg-primary/10"
              >
                إدارة اشتراكك
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-xl font-bold text-white">ابدأ اشتراكك</h2>
              <p className="mt-1 mb-6 text-sm text-muted">اختر الخطة المناسبة لك.</p>
              <SubscribeButtons
                clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
                planMonthly={process.env.PAYPAL_PLAN_ID_MONTHLY ?? ""}
                planYearly={process.env.PAYPAL_PLAN_ID_YEARLY ?? ""}
                monthlyUsd={pricing.monthly_usd}
                yearlyUsd={pricing.yearly_usd}
                yearlyDiscountPct={pricing.yearly_discount_pct}
                isLoggedIn={Boolean(user)}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
}
