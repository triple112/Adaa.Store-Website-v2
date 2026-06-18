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
  notes: string | null;
  created_at: string;
  updated_at: string;
};

/** Seed rows for a new report (the metrics the user asked for). Editable in the form. */
export const DEFAULT_METRICS: ReportMetric[] = [
  { label: "حرارة المعالج تحت أقصى ضغط", value: "", unit: "°C" },
  { label: "سحب طاقة المعالج تحت أقصى ضغط", before: "", after: "", unit: "W" },
  { label: "سرعة الرام", before: "", after: "", unit: "MHz" },
  { label: "كسر سرعة كرت الشاشة — Core Clock", value: "", unit: "MHz" },
  { label: "كسر سرعة كرت الشاشة — Memory Clock", value: "", unit: "MHz" },
];

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
