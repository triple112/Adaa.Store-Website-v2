import { Fragment } from "react";
import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: React.ReactNode;
  /** Visual travel direction. */
  direction?: "left" | "right";
  /** One full loop duration in seconds. Larger = slower. */
  durationSec?: number;
  /** Gap between items, in pixels. */
  gapPx?: number;
  /** Pause the scroll while hovered (lets users read / select text). */
  pauseOnHover?: boolean;
  /** Fade the left/right edges. */
  fade?: boolean;
  /** Repeat children N times per group (controls density on wide screens). */
  repeat?: number;
  className?: string;
};

/**
 * Seamless, dependency-free CSS marquee.
 * Two identical groups animate in lockstep; `min-width:100%` (in globals.css)
 * keeps each group at least viewport-wide so the loop never shows a gap.
 * Pure CSS — renders fine as a Server Component.
 */
export function Marquee({
  children,
  direction = "left",
  durationSec = 60,
  gapPx = 24,
  pauseOnHover = false,
  fade = true,
  repeat = 1,
  className,
}: MarqueeProps) {
  // Vars live on the wrapper and inherit down to both animated groups.
  const style = {
    "--marquee-duration": `${durationSec}s`,
    "--marquee-gap": `${gapPx}px`,
  } as React.CSSProperties;

  const items = Array.from({ length: repeat }, (_, i) => (
    <Fragment key={i}>{children}</Fragment>
  ));

  return (
    <div
      className={cn("adaa-marquee", fade && "fade-x", className)}
      style={style}
      data-pausable={pauseOnHover ? "true" : "false"}
      data-direction={direction}
    >
      <div className="adaa-marquee-group">{items}</div>
      <div className="adaa-marquee-group" aria-hidden>
        {items}
      </div>
    </div>
  );
}
