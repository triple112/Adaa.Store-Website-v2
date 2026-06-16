import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Validates a coupon code against an amount (server-side; coupons aren't publicly
 * readable). Returns the discount + final amount. Does NOT redeem — redemption is
 * recorded when the order is actually paid.
 */
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export async function POST(request: Request) {
  const { code, amount, appliesTo } = (await request.json().catch(() => ({}))) as {
    code?: string;
    amount?: number;
    appliesTo?: string;
  };

  if (!code || typeof amount !== "number") {
    return NextResponse.json({ valid: false, message: "بيانات ناقصة" }, { status: 400 });
  }

  const db = createAdminClient();
  const { data: coupon } = await db
    .from("coupons")
    .select("id, type, value, min_amount, max_uses, used_count, applies_to, active, starts_at, expires_at")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();

  if (!coupon || !coupon.active) {
    return NextResponse.json({ valid: false, message: "كود غير صالح" });
  }

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return NextResponse.json({ valid: false, message: "الكود لسه مابدأش" });
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return NextResponse.json({ valid: false, message: "انتهت صلاحية الكود" });
  }
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, message: "تم استهلاك الكود" });
  }
  if (coupon.applies_to !== "all" && coupon.applies_to !== appliesTo) {
    return NextResponse.json({ valid: false, message: "الكود مش مطبّق على دي" });
  }
  if (amount < Number(coupon.min_amount)) {
    return NextResponse.json({
      valid: false,
      message: `الحد الأدنى للطلب $${coupon.min_amount}`,
    });
  }

  const discount =
    coupon.type === "percent"
      ? round2((amount * Number(coupon.value)) / 100)
      : Math.min(Number(coupon.value), amount);
  const finalAmount = Math.max(0, round2(amount - discount));

  return NextResponse.json({
    valid: true,
    couponId: coupon.id,
    discount,
    finalAmount,
  });
}
