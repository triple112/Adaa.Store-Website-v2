/**
 * Soft seam between two sections — a feathered glow, never a hard line.
 * Sits in normal flow at ~zero height; the glow bleeds into both neighbours so
 * one section dissolves into the next. `tone="green"` adds a faint brand tint
 * to focal transitions; `tone="neutral"` is a pure light lift.
 */
export function Seam({ tone = "neutral" }: { tone?: "neutral" | "green" }) {
  return (
    <div aria-hidden className="relative h-px w-full">
      <div
        className="absolute left-1/2 top-1/2 h-44 w-[78%] max-w-5xl -translate-x-1/2 -translate-y-1/2 rounded-[100%] blur-3xl"
        style={{
          background:
            tone === "green"
              ? "radial-gradient(ellipse at center, rgba(80,141,78,0.10), transparent 70%)"
              : "radial-gradient(ellipse at center, rgba(255,255,255,0.045), transparent 70%)",
        }}
      />
    </div>
  );
}
