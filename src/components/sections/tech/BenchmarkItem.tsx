import { GamepadIcon } from "@/components/ui/icons";
import type { Benchmark } from "@/data/techStats";

export function BenchmarkItem({ data }: { data: Benchmark }) {
  const boost = Math.round(((data.afterFps - data.beforeFps) / data.beforeFps) * 100);
  const beforeWidth = Math.round((data.beforeFps / data.afterFps) * 100);

  return (
    <div className="border-b border-white/[0.08] pb-5 last:border-b-0 last:pb-0">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary-light">
            <GamepadIcon className="h-[18px] w-[18px]" />
          </span>
          <span className="font-display text-lg font-bold text-white">{data.game}</span>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/15 px-2.5 py-1 font-display text-sm font-bold text-primary-light">
          +{boost}% زيادة
        </span>
      </div>

      <BarRow label="قبل" fps={data.beforeFps} width={beforeWidth} variant="before" />
      <BarRow label="بعد" fps={data.afterFps} width={100} variant="after" />
    </div>
  );
}

function BarRow({
  label,
  fps,
  width,
  variant,
}: {
  label: string;
  fps: number;
  width: number;
  variant: "before" | "after";
}) {
  const after = variant === "after";
  return (
    <div className="mb-2.5 flex items-center gap-3 last:mb-0">
      <span className={`w-10 text-sm ${after ? "text-primary-light" : "text-subtle"}`}>{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${after ? "bg-primary-light shadow-[0_0_10px_rgba(80,141,78,0.8)]" : "bg-[#555]"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={`w-[70px] text-left font-display font-bold ${after ? "text-base text-white" : "text-sm text-[#ccc]"}`}
      >
        {fps} FPS
      </span>
    </div>
  );
}
