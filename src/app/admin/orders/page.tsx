import { createAdminClient } from "@/lib/supabase/admin";
import { formatOrderNumber } from "@/lib/site-config";

export const dynamic = "force-dynamic";

type AdminOrder = {
  id: string;
  order_number: number;
  type: string;
  items: { name?: string }[] | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  profiles: { email: string | null } | null;
};

const STATUS_LABEL: Record<string, string> = {
  paid: "مدفوع",
  pending: "قيد المعالجة",
  failed: "فشل",
  refunded: "مسترد",
};

export default async function AdminOrdersPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, order_number, type, items, amount, currency, status, created_at, profiles(email)")
    .order("order_number", { ascending: false })
    .limit(100)
    .returns<AdminOrder[]>();

  const orders = data ?? [];

  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-white">الطلبات ({orders.length})</h2>
      {orders.length === 0 ? (
        <p className="text-sm text-muted">لا توجد طلبات.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {orders.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-primary-light">
                    {formatOrderNumber(o.order_number)}
                  </span>
                  <span className="truncate text-sm text-white">
                    {(o.items ?? []).map((i) => i.name).filter(Boolean).join(" + ") || o.type}
                  </span>
                </div>
                <p className="text-xs text-faint" dir="ltr">
                  {o.profiles?.email ?? "—"} · {o.created_at.slice(0, 10)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-primary-light" dir="ltr">
                  {o.currency === "USD" ? "$" : o.currency}
                  {o.amount}
                </span>
                <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
                  {STATUS_LABEL[o.status] ?? o.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
