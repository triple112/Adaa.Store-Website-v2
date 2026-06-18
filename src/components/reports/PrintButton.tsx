"use client";

/** Triggers the browser print dialog → "Save as PDF". Hidden in the printed output. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-primary-light"
    >
      ⬇ تحميل التقرير (PDF)
    </button>
  );
}
