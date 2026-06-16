import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdaaxPricing = {
  monthly_usd: number;
  yearly_usd: number;
  yearly_discount_pct: number;
  currency: string;
};

const DEFAULT_PRICING: AdaaxPricing = {
  monthly_usd: 10,
  yearly_usd: 96,
  yearly_discount_pct: 20,
  currency: "USD",
};

/**
 * AdaaX subscription pricing from app_settings (admin-editable), with safe
 * fallback defaults. app_settings is publicly readable, so this works for anon.
 */
export async function getAdaaxPricing(): Promise<AdaaxPricing> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", "adaax_pricing")
      .maybeSingle();

    return { ...DEFAULT_PRICING, ...((data?.value as Partial<AdaaxPricing>) ?? {}) };
  } catch {
    return DEFAULT_PRICING;
  }
}
