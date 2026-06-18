import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { ReportView } from "@/components/reports/ReportView";
import { PrintButton } from "@/components/reports/PrintButton";
import type { InstallationReport } from "@/lib/reports/types";

export const metadata: Metadata = { title: "تقرير عملية التركيب" };
export const dynamic = "force-dynamic";

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Reachable by its unguessable report UUID (same access model as /order/[id]).
  const admin = createAdminClient();
  const { data } = await admin
    .from("installation_reports")
    .select(
      "id, order_id, created_by, customer_name, discord_username, discord_nickname, cpu_model, gpu_model, metrics, notes, created_at, updated_at, order:orders(order_number, created_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const order = Array.isArray(data.order) ? data.order[0] : data.order;
  if (!order) notFound();

  const report = data as unknown as InstallationReport;

  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-28 sm:pt-32">
      <div className="mb-6 flex justify-center print:hidden">
        <PrintButton />
      </div>
      <ReportView report={report} order={order} />
    </section>
  );
}
