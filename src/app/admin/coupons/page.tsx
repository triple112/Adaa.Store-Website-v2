import { createAdminClient } from "@/lib/supabase/admin";
import { CouponManager, type Coupon } from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("coupons")
    .select(
      "id, code, type, value, min_amount, max_uses, used_count, applies_to, active, starts_at, expires_at",
    )
    .order("created_at", { ascending: false })
    .returns<Coupon[]>();

  return <CouponManager coupons={data ?? []} />;
}
