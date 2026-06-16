/**
 * "Adaa vs other methods" comparison rows.
 *  good    → green check  (Adaa offers it)
 *  bad     → red check    (others do this harmful thing)
 *  clean   → green ✕      (Adaa does NOT do this harmful thing)
 *  missing → gray ✕       (others don't offer it)
 */
export type ComparisonStatus = "good" | "bad" | "clean" | "missing";

export type ComparisonRow = {
  feature: string;
  adaa: ComparisonStatus;
  other: ComparisonStatus;
};

export const comparisonRows: ComparisonRow[] = [
  { feature: "تعديلات وهمية", adaa: "clean", other: "bad" },
  { feature: "ضمان ذهبي (استرجاع كامل المبلغ)", adaa: "good", other: "missing" },
  { feature: "ضمان استقرار وأمان 100%", adaa: "good", other: "missing" },
  { feature: "مهندس IT متخصص", adaa: "good", other: "missing" },
  { feature: "تقارير فحص شاملة (Benchmarks)", adaa: "good", other: "missing" },
  { feature: "دعم فني ومتابعة", adaa: "good", other: "missing" },
];
