import { createAdminClient } from "@/lib/supabase/admin";
import {
  SubscriptionsTable,
  type AdminSubscription,
} from "@/components/admin/SubscriptionsTable";

export const dynamic = "force-dynamic";

export default async function AdminSubscriptionsPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("subscriptions")
    .select(
      "id, plan, status, current_period_end, cancel_at_period_end, paypal_subscription_id, profiles(email, display_name), license_devices(id, hwid_hash, bound_at)",
    )
    .order("created_at", { ascending: false })
    .returns<AdminSubscription[]>();

  return <SubscriptionsTable subscriptions={data ?? []} />;
}
