import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const db = createAdminClient();
  const nowIso = new Date().toISOString();

  const [usersRes, subsRes, ordersRes, paidRes, couponsRes] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }),
    db
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .gt("current_period_end", nowIso),
    db.from("orders").select("*", { count: "exact", head: true }),
    db.from("orders").select("amount").eq("status", "paid"),
    db.from("coupons").select("*", { count: "exact", head: true }).eq("active", true),
  ]);

  const revenue = (paidRes.data ?? []).reduce((s, o) => s + Number(o.amount ?? 0), 0);

  const stats = [
    { label: "المستخدمين", value: usersRes.count ?? 0, href: "/admin/users" },
    { label: "اشتراكات نشطة", value: subsRes.count ?? 0, href: "/admin/subscriptions" },
    { label: "إجمالي الطلبات", value: ordersRes.count ?? 0, href: "/admin/orders" },
    { label: "كوبونات فعّالة", value: couponsRes.count ?? 0, href: "/admin/coupons" },
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-surface p-7">
        <p className="text-sm text-muted">إجمالي الإيرادات (طلبات مدفوعة)</p>
        <p className="mt-1 font-display text-4xl font-bold text-primary-light" dir="ltr">
          ${revenue.toFixed(2)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="rounded-2xl border border-white/10 bg-surface p-5 transition-colors hover:border-primary/30"
          >
            <p className="text-xs text-faint">{s.label}</p>
            <p className="mt-1 font-display text-2xl font-bold text-white">{s.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
