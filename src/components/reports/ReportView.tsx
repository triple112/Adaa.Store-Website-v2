import { toLatinDigits, formatDate, formatOrderNumber } from "@/lib/site-config";
import type { InstallationReport, ReportMetric } from "@/lib/reports/types";

type OrderInfo = { order_number: number; created_at: string };

function MetricValue({ m }: { m: ReportMetric }) {
  const unit = m.unit ? ` ${m.unit}` : "";
  if (m.before || m.after) {
    return (
      <span dir="ltr" className="inline-flex items-center gap-2 whitespace-nowrap">
        <span className="text-gray-400 line-through decoration-gray-300">
          {toLatinDigits(m.before ?? "—")}
          {unit}
        </span>
        <span className="text-[#508d4e]">←</span>
        <span className="font-bold text-[#3f6e3d]">
          {toLatinDigits(m.after ?? "—")}
          {unit}
        </span>
      </span>
    );
  }
  return (
    <span dir="ltr" className="font-bold text-gray-900">
      {toLatinDigits(m.value ?? "")}
      {unit}
    </span>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="text-[11px] font-medium text-gray-400">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}

/**
 * A light "paper" report sheet (prints cleanly to PDF regardless of the dark site
 * theme). Wrapped in #report-sheet so the print stylesheet shows only this block.
 */
export function ReportView({ report, order }: { report: InstallationReport; order: OrderInfo }) {
  const metrics = report.metrics ?? [];
  const customerRows: [string, string | null][] = [
    ["الاسم", report.customer_name],
    ["يوزر ديسكورد", report.discord_username],
    ["النيك نيم", report.discord_nickname],
  ];
  const shownCustomer = customerRows.filter(([, v]) => v && v.trim());

  return (
    <div
      id="report-sheet"
      dir="rtl"
      className="mx-auto w-full max-w-[820px] overflow-hidden rounded-3xl bg-white text-gray-800 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
    >
      {/* Header band */}
      <div className="flex items-center justify-between gap-4 bg-[#508d4e] px-8 py-6 text-white">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.png" alt="أداء" className="h-11 w-auto" />
          <div>
            <div className="font-display text-xl font-extrabold leading-tight">تقرير عملية تحسين الأداء</div>
            <div className="text-xs text-white/80">Adaa.store — تقرير فني للتركيب</div>
          </div>
        </div>
        <div className="text-left">
          <div dir="ltr" className="font-mono text-lg font-bold">
            {formatOrderNumber(order.order_number)}
          </div>
          <div className="text-xs text-white/80">{formatDate(order.created_at)}</div>
        </div>
      </div>

      <div className="space-y-7 px-8 py-7">
        {/* Customer */}
        {shownCustomer.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold text-[#3f6e3d]">بيانات العميل</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {shownCustomer.map(([label, value]) => (
                <InfoChip key={label} label={label} value={value as string} />
              ))}
            </div>
          </section>
        )}

        {/* Hardware */}
        {(report.cpu_model || report.gpu_model) && (
          <section>
            <h2 className="mb-3 text-sm font-bold text-[#3f6e3d]">العتاد (Hardware)</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {report.cpu_model && <InfoChip label="المعالج (CPU)" value={report.cpu_model} />}
              {report.gpu_model && <InfoChip label="كرت الشاشة (GPU)" value={report.gpu_model} />}
            </div>
          </section>
        )}

        {/* Metrics */}
        {metrics.length > 0 && (
          <section>
            <h2 className="mb-3 text-sm font-bold text-[#3f6e3d]">نتائج الأداء</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-right text-sm">
                <tbody>
                  {metrics.map((m, i) => (
                    <tr key={i} className={i % 2 ? "bg-gray-50/60" : "bg-white"}>
                      <td className="border-b border-gray-100 px-5 py-3 font-medium text-gray-700">
                        {m.label}
                      </td>
                      <td className="border-b border-gray-100 px-5 py-3 text-left">
                        <MetricValue m={m} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Notes */}
        {report.notes && (
          <section>
            <h2 className="mb-2 text-sm font-bold text-[#3f6e3d]">ملاحظات المهندس</h2>
            <p className="whitespace-pre-line rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-700">
              {report.notes}
            </p>
          </section>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50 px-8 py-5 text-center text-xs text-gray-500">
        متجر أداء (Adaa.store) — خيارك الأول لأعلى جودة وأداء
        <br />
        adaa.store
      </div>
    </div>
  );
}
