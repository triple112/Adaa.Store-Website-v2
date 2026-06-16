import { CHART_PATH_AFTER, CHART_PATH_BEFORE } from "@/data/chartPaths";

/**
 * Animated frametime chart. The unstable "before" line and the flat "after"
 * line scroll horizontally via a pure-CSS keyframe (`.adaa-chart-group`).
 */
export function LiveChart() {
  return (
    <div className="rounded-2xl border border-white/10 bg-[rgba(15,15,15,0.75)] p-6 sm:p-9">
      <div className="mb-7 flex flex-wrap items-start justify-between gap-5">
        <div>
          <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
            وداعاً لتقطيع الفريمات أو التذبذب
          </h3>
          <p className="mt-2 max-w-sm text-sm text-subtle">
            تحويل أداء الجهاز من التذبذب العشوائي إلى خط مستقر واقعي.
          </p>
        </div>
        <div className="flex gap-5 text-sm font-semibold">
          <span className="flex items-center gap-2 text-muted">
            <span className="h-3 w-3 rounded-full bg-[#444]" /> قبل
          </span>
          <span className="flex items-center gap-2 text-muted">
            <span className="h-3 w-3 rounded-full bg-primary-light shadow-[0_0_8px_var(--color-primary-light)]" />{" "}
            بعد (Adaa)
          </span>
        </div>
      </div>

      <div className="relative h-[250px] w-full overflow-hidden rounded-xl border border-white/[0.03] bg-black/30">
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 800 250"
          preserveAspectRatio="none"
          aria-hidden
        >
          <g stroke="rgba(255,255,255,0.03)" strokeWidth={1}>
            <line x1="0" y1="62.5" x2="800" y2="62.5" />
            <line x1="0" y1="125" x2="800" y2="125" />
            <line x1="0" y1="187.5" x2="800" y2="187.5" />
            <line x1="200" y1="0" x2="200" y2="250" />
            <line x1="400" y1="0" x2="400" y2="250" />
            <line x1="600" y1="0" x2="600" y2="250" />
          </g>
          <g className="adaa-chart-group">
            <path
              d={CHART_PATH_BEFORE}
              fill="none"
              stroke="#444"
              strokeWidth={1.5}
              strokeLinejoin="round"
              opacity={0.3}
            />
            <path
              d={CHART_PATH_AFTER}
              fill="none"
              stroke="var(--color-primary-light)"
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
              style={{ filter: "drop-shadow(0 0 10px rgba(80,141,78,0.7))" }}
            />
          </g>
        </svg>
      </div>
    </div>
  );
}
