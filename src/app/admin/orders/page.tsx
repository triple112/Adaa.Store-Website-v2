import { createAdminClient } from "@/lib/supabase/admin";
import { OrdersTable, type AdminOrder } from "@/components/admin/OrdersTable";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("orders")
    .select("id, order_number, type, items, amount, currency, status, created_at, email, name, provider")
    .order("order_number", { ascending: false })
    .limit(2000)
    .returns<AdminOrder[]>();

  const orders = data ?? [];

  return (
    <div className="space-y-4">
      <h2 className="font-display text-lg font-bold text-white">الطلبات ({orders.length})</h2>
      <OrdersTable orders={orders} />
    </div>
  );
}
