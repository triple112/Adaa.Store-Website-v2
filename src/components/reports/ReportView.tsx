import { toLatinDigits, formatDate, formatOrderNumber } from "@/lib/site-config";
import { REPORT_WARNING, type InstallationReport, type ReportMetric } from "@/lib/reports/types";

type OrderInfo = { order_number: number; created_at: string };

function fmt(v: string | undefined, unit: string | undefined): string {
  const u = unit ? ` ${unit}` : "";
  return `${toLatinDigits(v ?? "—")}${u}`;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#3f6e3d]">
      <span className="inline-block h-4 w-1 rounded-full bg-[#508d4e]" />
      {children}
    </h2>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <div className="text-[11px] font-medium text-gray-400">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-gray-900" dir="auto">{value}</div>
    </div>
  );
}

/**
 * A light "paper" report sheet (prints cleanly to PDF regardless of the dark site
 * theme). Wrapped in #report-sheet so the print stylesheet shows only this block.
 */
export function ReportView({ report, order }: { report: InstallationReport; order: OrderInfo }) {
  const metrics: ReportMetric[] = report.metrics ?? [];
  const rangeMetrics = metrics.filter((m) => m.before || m.after);
  const singleMetrics = metrics.filter((m) => !(m.before || m.after) && m.value);
  const tweaks = (report.tweaks ?? []).filter((g) => g.items?.length);

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
            <div className="text-xs text-white/80">Adaa.store — تقرير فني معتمد</div>
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
            <SectionTitle>بيانات العميل</SectionTitle>
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
            <SectionTitle>العتاد (Hardware)</SectionTitle>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {report.cpu_model && <InfoChip label="المعالج (CPU)" value={report.cpu_model} />}
              {report.gpu_model && <InfoChip label="كرت الشاشة (GPU)" value={report.gpu_model} />}
            </div>
          </section>
        )}

        {/* Before / after metrics */}
        {rangeMetrics.length > 0 && (
          <section>
            <SectionTitle>نتائج الأداء — قبل / بعد</SectionTitle>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500">
                    <th className="px-5 py-2.5 font-semibold">البيان</th>
                    <th className="px-5 py-2.5 text-center font-semibold">قبل</th>
                    <th className="px-5 py-2.5 text-center font-semibold">بعد</th>
                  </tr>
                </thead>
                <tbody>
                  {rangeMetrics.map((m, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      <td className="px-5 py-3 font-medium text-gray-700">{m.label}</td>
                      <td className="px-5 py-3 text-center text-gray-400" dir="ltr">
                        {fmt(m.before, m.unit)}
                      </td>
                      <td className="px-5 py-3 text-center" dir="ltr">
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-bold text-[#2f7d32]">
                          {fmt(m.after, m.unit)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Single-value metrics (overclock / settings) */}
        {singleMetrics.length > 0 && (
          <section>
            <SectionTitle>إعدادات وقيم</SectionTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {singleMetrics.map((m, i) => (
                <InfoChip key={i} label={m.label} value={fmt(m.value, m.unit)} />
              ))}
            </div>
          </section>
        )}

        {/* Applied tweaks checklist */}
        {tweaks.length > 0 && (
          <section>
            <SectionTitle>التعديلات المُطبقة</SectionTitle>
            <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              {tweaks.map((g) => (
                <div key={g.category}>
                  <h3 className="mb-1.5 text-xs font-bold text-gray-800">{g.category}</h3>
                  <ul className="space-y-1">
                    {g.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12.5px] leading-snug text-gray-600">
                        <span className="mt-[1px] shrink-0 text-[#508d4e]">✔</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Notes */}
        {report.notes && (
          <section>
            <SectionTitle>ملاحظات المهندس</SectionTitle>
            <p className="whitespace-pre-line rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-700">
              {report.notes}
            </p>
          </section>
        )}

        {/* Warning */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <span className="text-lg leading-none">⚠️</span>
          <p className="text-[13px] font-semibold leading-relaxed text-amber-900">{REPORT_WARNING}</p>
        </div>
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
