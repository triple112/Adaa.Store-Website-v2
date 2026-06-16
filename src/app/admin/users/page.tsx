import { createAdminClient } from "@/lib/supabase/admin";
import { UsersTable, type AdminUser } from "@/components/admin/UsersTable";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const db = createAdminClient();
  const { data } = await db
    .from("profiles")
    .select("id, email, display_name, role, banned, created_at")
    .order("created_at", { ascending: false })
    .returns<AdminUser[]>();

  return <UsersTable users={data ?? []} />;
}
