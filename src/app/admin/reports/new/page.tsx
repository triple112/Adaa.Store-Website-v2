import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { CreateReportForm, type OrderOption } from "@/components/admin/CreateReportForm";

export const dynamic = "force-dynamic";

export default async function NewReportPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, order_number, email, name, items, type, status")
    .in("type", ["package", "service"])
    .order("order_number", { ascending: false })
    .limit(500);

  const orders: OrderOption[] = (data ?? []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    email: o.email,
    name: o.name,
    items: ((o.items as { name?: string }[] | null) ?? [])
      .map((i) => i.name)
      .filter(Boolean)
      .join(" + "),
    installed: o.status === "installed",
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-white">إنشاء تقرير عملية تركيب</h2>
        <Link href="/admin/reports" className="text-sm font-semibold text-muted hover:text-white">
          ← رجوع
        </Link>
      </div>
      <CreateReportForm orders={orders} />
    </div>
  );
}
