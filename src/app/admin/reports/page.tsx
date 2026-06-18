import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportsTable, type AdminReport } from "@/components/admin/ReportsTable";
import { LegacyReportsTable, type LegacyReport } from "@/components/admin/LegacyReportsTable";

export const dynamic = "force-dynamic";

type CreatedRow = {
  id: string;
  customer_name: string | null;
  discord_username: string | null;
  discord_nickname: string | null;
  cpu_model: string | null;
  created_at: string;
  order: { order_number: number; email: string | null; name: string | null }[] | { order_number: number; email: string | null; name: string | null } | null;
};

export default async function AdminReportsPage() {
  const db = createAdminClient();

  const [{ data: created }, { data: legacy }] = await Promise.all([
    db
      .from("installation_reports")
      .select(
        "id, customer_name, discord_username, discord_nickname, cpu_model, created_at, order:orders(order_number, email, name)",
      )
      .order("created_at", { ascending: false })
      .limit(1000)
      .returns<CreatedRow[]>(),
    db
      .from("legacy_reports")
      .select("id, nickname, discord_username, file_size, created_at")
      .order("nickname", { ascending: true })
      .limit(2000),
  ]);

  const reports: AdminReport[] = (created ?? []).map((r) => {
    const o = Array.isArray(r.order) ? r.order[0] : r.order;
    return {
      id: r.id,
      customerName: r.customer_name,
      discordUsername: r.discord_username,
      discordNickname: r.discord_nickname,
      cpuModel: r.cpu_model,
      createdAt: r.created_at,
      orderNumber: o?.order_number ?? null,
      email: o?.email ?? null,
    };
  });

  const legacyRows: LegacyReport[] = (legacy ?? []).map((r) => ({
    id: r.id,
    nickname: r.nickname,
    discordUsername: r.discord_username,
    fileSize: r.file_size,
    createdAt: r.created_at,
  }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-white">تقارير عملية التركيب</h2>
        <Link
          href="/admin/reports/new"
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-light"
        >
          + إنشاء تقرير
        </Link>
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-muted">التقارير المُنشأة ({reports.length})</h3>
        <ReportsTable reports={reports} />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-bold text-muted">الأرشيف القديم ({legacyRows.length})</h3>
        <p className="text-xs text-faint">
          تقارير قديمة (Canva) للأرشيف والبحث فقط — غير مربوطة بحسابات العملاء.
        </p>
        <LegacyReportsTable reports={legacyRows} />
      </section>
    </div>
  );
}
