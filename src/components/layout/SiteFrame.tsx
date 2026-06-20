/**
 * Site frame — a centered, fixed-width column with faded vertical hairline
 * rails down both edges (shown on lg+). Every page section lives inside this
 * column, so the whole site reads as a single framed sheet and nothing bleeds
 * past the rails. The ambient mesh texture is painted inside the frame too.
 */
export function SiteFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto w-full max-w-[1280px]">
      {/* Ambient texture, clipped to the frame */}
      <div aria-hidden className="frame-texture" />

      {/* Side rails (desktop only) — sit above content so the lines stay crisp */}
      <div
        aria-hidden
        className="frame-rail pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-px lg:block"
      />
      <div
        aria-hidden
        className="frame-rail pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-px lg:block"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
