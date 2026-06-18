"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toLatinDigits, formatOrderNumber } from "@/lib/site-config";
import {
  DEFAULT_METRICS,
  PERF_PACKAGE_OPTIONS,
  type ReportMetric,
} from "@/lib/reports/types";
import {
  createReportFromOrder,
  createManualReport,
  type ReportFields,
} from "@/lib/reports/actions";

export type OrderOption = {
  id: string;
  orderNumber: number;
  email: string | null;
  name: string | null;
  items: string;
  installed: boolean;
};

type MetricRow = {
  label: string;
  unit: string;
  kind: "range" | "single";
  before: string;
  after: string;
  value: string;
};

const seedRows: MetricRow[] = DEFAULT_METRICS.map((m) => ({
  label: m.label,
  unit: m.unit ?? "",
  kind: m.before !== undefined || m.after !== undefined ? "range" : "single",
  before: m.before ?? "",
  after: m.after ?? "",
  value: m.value ?? "",
}));

const inputCls =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none";
const labelCls = "mb-1.5 block text-xs font-semibold text-muted";

export function CreateReportForm({ orders }: { orders: OrderOption[] }) {
  const [mode, setMode] = useState<"order" | "manual">("order");

  // order mode
  const [orderSearch, setOrderSearch] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);

  // manual mode
  const [email, setEmail] = useState("");
  const [packageId, setPackageId] = useState(PERF_PACKAGE_OPTIONS[1]?.id ?? PERF_PACKAGE_OPTIONS[0]?.id ?? "");
  const [amount, setAmount] = useState(String(PERF_PACKAGE_OPTIONS[1]?.price ?? PERF_PACKAGE_OPTIONS[0]?.price ?? 50));
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  // shared report fields
  const [customerName, setCustomerName] = useState("");
  const [discordUsername, setDiscordUsername] = useState("");
  const [discordNickname, setDiscordNickname] = useState("");
  const [cpuModel, setCpuModel] = useState("");
  const [gpuModel, setGpuModel] = useState("");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<MetricRow[]>(seedRows);

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ reportId: string } | null>(null);

  const selectedOrder = orders.find((o) => o.id === orderId) ?? null;

  const filteredOrders = useMemo(() => {
    const q = toLatinDigits(orderSearch).trim().toLowerCase();
    const list = q
      ? orders.filter((o) =>
          `#${o.orderNumber} ${o.email ?? ""} ${o.name ?? ""} ${o.items}`.toLowerCase().includes(q),
        )
      : orders;
    return list.slice(0, 40);
  }, [orders, orderSearch]);

  function updateRow(i: number, patch: Partial<MetricRow>) {
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  function addRow() {
    setRows((r) => [...r, { label: "", unit: "", kind: "range", before: "", after: "", value: "" }]);
  }
  function removeRow(i: number) {
    setRows((r) => r.filter((_, idx) => idx !== i));
  }

  function buildFields(): ReportFields {
    const metrics: ReportMetric[] = rows.map((m) =>
      m.kind === "range"
        ? { label: m.label, before: m.before, after: m.after, unit: m.unit }
        : { label: m.label, value: m.value, unit: m.unit },
    );
    return { customerName, discordUsername, discordNickname, cpuModel, gpuModel, metrics, notes };
  }

  function submit() {
    setError(null);
    const fields = buildFields();
    startTransition(async () => {
      let res;
      if (mode === "order") {
        if (!orderId) {
          setError("اختر طلبًا أولاً");
          return;
        }
        res = await createReportFromOrder(orderId, fields);
      } else {
        if (!email.trim()) {
          setError("اكتب إيميل العميل");
          return;
        }
        res = await createManualReport({
          email,
          name: customerName,
          packageId,
          amount: Number(amount),
          date,
          fields,
        });
      }
      if (res?.ok && res.reportId) setDone({ reportId: res.reportId });
      else setError(res?.error ?? "حدث خطأ");
    });
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-7 text-center">
        <p className="font-display text-lg font-bold text-white">تم حفظ التقرير ✅</p>
        <p className="mt-1 text-sm text-muted">
          تم تحويل حالة الطلب إلى «تم التركيب» وإرسال التقرير للعميل على الإيميل.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link
            href={`/report/${done.reportId}`}
            target="_blank"
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-light"
          >
            عرض التقرير
          </Link>
          <Link
            href="/admin/reports"
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-muted hover:text-white"
          >
            كل التقارير
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* mode toggle */}
      <div className="flex gap-1 rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {([
          ["order", "من طلب موجود"],
          ["manual", "يدوي (عميل ديسكورد)"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={
              "flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
              (mode === key ? "bg-primary/15 text-primary-light" : "text-muted hover:text-white")
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* source section */}
      <div className="rounded-2xl border border-white/10 bg-surface p-5">
        {mode === "order" ? (
          <div className="space-y-3">
            <label className={labelCls}>اختر الطلب</label>
            {selectedOrder ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
                <div className="text-sm">
                  <span className="font-mono font-bold text-primary-light">
                    {formatOrderNumber(selectedOrder.orderNumber)}
                  </span>{" "}
                  <span className="text-white">{selectedOrder.name || "—"}</span>{" "}
                  <span className="text-faint" dir="ltr">{selectedOrder.email || "—"}</span>
                  <div className="text-xs text-faint">{selectedOrder.items}</div>
                </div>
                <button
                  onClick={() => setOrderId(null)}
                  className="text-xs font-semibold text-muted hover:text-white"
                >
                  تغيير
                </button>
              </div>
            ) : (
              <>
                <input
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="بحث برقم الطلب أو الإيميل أو الاسم…"
                  className={inputCls}
                />
                <div className="max-h-64 divide-y divide-white/5 overflow-y-auto rounded-xl border border-white/10">
                  {filteredOrders.map((o) => (
                    <button
                      key={o.id}
                      onClick={() => {
                        setOrderId(o.id);
                        if (!customerName) setCustomerName(o.name ?? "");
                      }}
                      className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-right text-sm hover:bg-white/[0.03]"
                    >
                      <span className="min-w-0">
                        <span className="font-mono text-xs font-bold text-primary-light">
                          {formatOrderNumber(o.orderNumber)}
                        </span>{" "}
                        <span className="text-white">{o.name || "—"}</span>
                        <span className="block truncate text-xs text-faint">
                          {o.email} · {o.items}
                        </span>
                      </span>
                      {o.installed && (
                        <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] text-primary-light">
                          له تقرير
                        </span>
                      )}
                    </button>
                  ))}
                  {filteredOrders.length === 0 && (
                    <p className="px-4 py-6 text-center text-sm text-muted">لا توجد طلبات.</p>
                  )}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>إيميل العميل *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                placeholder="customer@email.com"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>الباقة</label>
              <select
                value={packageId}
                onChange={(e) => {
                  setPackageId(e.target.value);
                  const p = PERF_PACKAGE_OPTIONS.find((x) => x.id === e.target.value);
                  if (p) setAmount(String(p.price));
                }}
                className={inputCls}
              >
                {PERF_PACKAGE_OPTIONS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-elevated">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>المبلغ المدفوع ($)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                dir="ltr"
                inputMode="decimal"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>تاريخ الشراء</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                dir="ltr"
                className={inputCls}
              />
            </div>
          </div>
        )}
      </div>

      {/* report fields */}
      <div className="space-y-4 rounded-2xl border border-white/10 bg-surface p-5">
        <h3 className="text-sm font-bold text-muted">بيانات التقرير</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>اسم العميل</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className={inputCls} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>يوزر ديسكورد</label>
              <input value={discordUsername} onChange={(e) => setDiscordUsername(e.target.value)} dir="ltr" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>النيك نيم</label>
              <input value={discordNickname} onChange={(e) => setDiscordNickname(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div>
            <label className={labelCls}>المعالج (CPU)</label>
            <input value={cpuModel} onChange={(e) => setCpuModel(e.target.value)} dir="ltr" placeholder="9800X3D" className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>كرت الشاشة (GPU)</label>
            <input value={gpuModel} onChange={(e) => setGpuModel(e.target.value)} dir="ltr" placeholder="RTX 4070" className={inputCls} />
          </div>
        </div>
      </div>

      {/* metrics */}
      <div className="space-y-3 rounded-2xl border border-white/10 bg-surface p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-muted">نتائج الأداء (قبل / بعد)</h3>
          <button onClick={addRow} className="rounded-lg bg-primary/15 px-3 py-1.5 text-xs font-semibold text-primary-light">
            + صف
          </button>
        </div>
        <div className="space-y-2.5">
          {rows.map((m, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2.5">
              <input
                value={m.label}
                onChange={(e) => updateRow(i, { label: e.target.value })}
                placeholder="اسم القياس"
                className="min-w-[160px] flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
              />
              <div className="flex overflow-hidden rounded-lg border border-white/10">
                {([
                  ["range", "قبل/بعد"],
                  ["single", "قيمة"],
                ] as const).map(([k, lbl]) => (
                  <button
                    key={k}
                    onClick={() => updateRow(i, { kind: k })}
                    className={
                      "px-2.5 py-1.5 text-[11px] font-semibold " +
                      (m.kind === k ? "bg-primary/20 text-primary-light" : "text-muted hover:text-white")
                    }
                  >
                    {lbl}
                  </button>
                ))}
              </div>
              {m.kind === "range" ? (
                <>
                  <input
                    value={m.before}
                    onChange={(e) => updateRow(i, { before: e.target.value })}
                    placeholder="قبل"
                    dir="ltr"
                    className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
                  />
                  <input
                    value={m.after}
                    onChange={(e) => updateRow(i, { after: e.target.value })}
                    placeholder="بعد"
                    dir="ltr"
                    className="w-20 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
                  />
                </>
              ) : (
                <input
                  value={m.value}
                  onChange={(e) => updateRow(i, { value: e.target.value })}
                  placeholder="القيمة"
                  dir="ltr"
                  className="w-28 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
                />
              )}
              <input
                value={m.unit}
                onChange={(e) => updateRow(i, { unit: e.target.value })}
                placeholder="وحدة"
                dir="ltr"
                className="w-16 rounded-lg border border-white/10 bg-white/[0.03] px-2 py-1.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
              />
              <button
                onClick={() => removeRow(i)}
                className="rounded-lg px-2 py-1.5 text-sm text-faint hover:text-red-400"
                aria-label="حذف"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* notes */}
      <div className="rounded-2xl border border-white/10 bg-surface p-5">
        <label className={labelCls}>ملاحظات المهندس (اختياري)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className={inputCls}
          placeholder="أي ملاحظات إضافية تظهر في التقرير…"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex justify-end gap-3">
        <button
          onClick={submit}
          disabled={pending}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
        >
          {pending ? "جارٍ الحفظ…" : "حفظ التقرير وإرساله"}
        </button>
      </div>
    </div>
  );
}
