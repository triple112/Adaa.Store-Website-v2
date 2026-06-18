import { packages } from "@/data/packages";

/**
 * Shared types for installation reports (تقارير عملية التركيب).
 * Client-safe — no server-only imports — so the admin form and the public
 * report page can both use it.
 */

/** A single measurement row. Either a before→after pair, or a single value. */
export type ReportMetric = {
  label: string;
  before?: string;
  after?: string;
  value?: string;
  unit?: string;
};

/** A group of applied tweaks (only the items that were actually applied). */
export type TweakGroup = { category: string; items: string[] };

export type InstallationReport = {
  id: string;
  order_id: string;
  created_by: string | null;
  customer_name: string | null;
  discord_username: string | null;
  discord_nickname: string | null;
  cpu_model: string | null;
  gpu_model: string | null;
  metrics: ReportMetric[];
  tweaks: TweakGroup[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Seed rows for a new report (the metrics the user asked for). Editable in the form. */
export const DEFAULT_METRICS: ReportMetric[] = [
  { label: "حرارة المعالج تحت أقصى ضغط", value: "", unit: "°C" },
  { label: "سحب طاقة المعالج تحت أقصى ضغط", before: "", after: "", unit: "W" },
  { label: "سرعة الرام", before: "", after: "", unit: "MHz" },
  { label: "استهلاك النظام للرام (Idle)", before: "", after: "", unit: "GB" },
  { label: "عدد العمليات في الخلفية", before: "", after: "", unit: "" },
  { label: "كسر سرعة كرت الشاشة — Core Clock", value: "", unit: "MHz" },
  { label: "كسر سرعة كرت الشاشة — Memory Clock", value: "", unit: "MHz" },
];

/** Default applied-tweaks checklist (all pre-checked in the form; editable). */
export const TWEAKS_TEMPLATE: TweakGroup[] = [
  {
    category: "تحسينات النظام والويندوز",
    items: [
      "إيقاف خدمات التتبع وإرسال البيانات (Telemetry & Privacy)",
      "حذف برامج الويندوز الافتراضية غير الضرورية (Bloatware Removal)",
      "إيقاف برامج الخلفية غير المستخدمة لتقليل استهلاك الرام",
      "تعطيل Xbox Game Bar و Game DVR لمنع التقطيع",
    ],
  },
  {
    category: "الاستجابة وتقليل التأخير",
    items: [
      "تحسين استجابة الماوس والكيبورد (Polling & Raw Input)",
      "ضبط منافذ USB لإعطاء الأولوية لأجهزة اللعب",
      "تعطيل موفّر الطاقة لمنافذ USB لثبات الاتصال",
    ],
  },
  {
    category: "المعالج والطاقة",
    items: [
      "تفعيل خطة طاقة مخصّصة للأداء الأقصى (Adaa Power Plan)",
      "فك حظر أنوية المعالج (CPU Core Unparking)",
      "تعطيل توفير طاقة المعالج في البيوس (C-States) لثبات الفريمات",
    ],
  },
  {
    category: "كرت الشاشة",
    items: [
      "ضبط لوحة تحكم الكرت (Nvidia/AMD) لأعلى فريمات",
      "تفعيل وضع الاستجابة السريعة (Low Latency / Anti-Lag)",
      "تفعيل Resizable BAR / SAM",
    ],
  },
  {
    category: "الشبكة والبنج",
    items: [
      "إيقاف خوارزميات تأخير الشبكة (Nagle / TCP No Delay)",
      "ضبط محول الشبكة لتقليل البنج وفقدان الحزم (Packet Loss)",
    ],
  },
];

/** Warning shown at the bottom of every report. */
export const REPORT_WARNING =
  "لضمان استمرار الاستفادة بأفضل أداء، يُرجى عدم تحديث الويندوز أبدًا أو تغيير قطع الهاردوير بدون الرجوع لنا، حيث أن ذلك قد يلغي التعديلات ويؤثر على استقرار النظام.";

/** Perf packages a manual order can reference (name already carries the V2 suffix). */
export const PERF_PACKAGE_OPTIONS = packages.map((p) => ({
  id: p.id,
  name: p.name,
  price: p.price ?? 0,
}));

/** Resolve a package id → { name, price } for a manual order; null if unknown. */
export function resolvePerfPackage(id: string): { name: string; price: number } | null {
  const p = packages.find((x) => x.id === id);
  return p ? { name: p.name, price: p.price ?? 0 } : null;
}

/** Drop empty items/categories from a tweaks checklist. */
export function cleanTweaks(tweaks: TweakGroup[]): TweakGroup[] {
  return (tweaks ?? [])
    .map((g) => ({
      category: (g.category ?? "").trim(),
      items: (g.items ?? []).map((i) => (i ?? "").trim()).filter(Boolean),
    }))
    .filter((g) => g.category && g.items.length > 0);
}

/** Total count of applied tweaks across all groups. */
export function tweaksCount(tweaks: TweakGroup[]): number {
  return (tweaks ?? []).reduce((n, g) => n + (g.items?.length ?? 0), 0);
}

/** Keep only metric rows that carry at least one value (drops empty seed rows). */
export function cleanMetrics(metrics: ReportMetric[]): ReportMetric[] {
  return (metrics ?? [])
    .map((m) => ({
      label: (m.label ?? "").trim(),
      before: (m.before ?? "").trim() || undefined,
      after: (m.after ?? "").trim() || undefined,
      value: (m.value ?? "").trim() || undefined,
      unit: (m.unit ?? "").trim() || undefined,
    }))
    .filter((m) => m.label && (m.before || m.after || m.value));
}
