import type { Metadata } from "next";
import { getUser } from "@/lib/auth/dal";
import { getAdaaxPricing } from "@/lib/settings";
import { createClient } from "@/lib/supabase/server";
import { AdaaxHero } from "@/components/adaax/AdaaxHero";
import { AdaaxFeatures } from "@/components/adaax/AdaaxFeatures";
import { AdaaxHowItWorks } from "@/components/adaax/AdaaxHowItWorks";
import { AdaaxSubscribe } from "@/components/adaax/AdaaxSubscribe";
import { AdaaxCta } from "@/components/adaax/AdaaxCta";
import { Seam } from "@/components/ui/Seam";

export const metadata: Metadata = {
  title: "AdaaX — برنامج تحسين الأداء",
  description:
    "AdaaX — تطبيق سطح المكتب لتحسين أداء جهازك لحظياً: ضبط المعالج وكرت الشاشة والرامات والويندوز للألعاب، بأمان وبتحديثات مستمرة مربوطة باشتراكك.",
};
export const dynamic = "force-dynamic";

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
    <>
      <AdaaxHero />
      <Seam tone="green" />
      <AdaaxFeatures />
      <Seam />
      <AdaaxHowItWorks />
      <Seam tone="green" />
      <AdaaxSubscribe
        hasActive={hasActive}
        isLoggedIn={Boolean(user)}
        clientId={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? ""}
        planMonthly={process.env.PAYPAL_PLAN_ID_MONTHLY ?? ""}
        planYearly={process.env.PAYPAL_PLAN_ID_YEARLY ?? ""}
        monthlyUsd={pricing.monthly_usd}
        yearlyUsd={pricing.yearly_usd}
        yearlyDiscountPct={pricing.yearly_discount_pct}
      />
      <Seam />
      <AdaaxCta />
    </>
  );
}
