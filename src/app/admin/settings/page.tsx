import { getAdaaxPricing } from "@/lib/settings";
import { PricingForm } from "@/components/admin/PricingForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const pricing = await getAdaaxPricing();
  return (
    <PricingForm
      monthly={pricing.monthly_usd}
      yearly={pricing.yearly_usd}
      discount={pricing.yearly_discount_pct}
    />
  );
}
