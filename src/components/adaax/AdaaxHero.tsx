/**
 * AdaaxHero — stacked hero, mirrored from the "Laser Focus" reference for RTL.
 *
 * The copy sits on the RIGHT. A tall green volumetric laser (WebGL) is rendered
 * as a FULL-WIDTH overlay so the shader keeps its true aspect ratio: it falls
 * from the very top of the screen and its flare "lands" on the TOP edge of the
 * wide AdaaX screenshot below.
 *
 * Layout note: the laser overlay is scoped to the UPPER zone (top of section →
 * just above the screenshot), NOT the whole section. The flare is parked near the
 * bottom of that zone (`verticalBeamOffset` ≈ -0.42), so it meets the screenshot's
 * top edge at EVERY viewport width — even when the copy reflows taller on mobile.
 *
 * The LaserFlow canvas renders transparently, so the site's mesh/background shows
 * through; a soft dark radial sits behind the beam for contrast. The screenshot
 * above (z-10) masks the beam's tail and its own bottom fades out into the page.
 */
import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowDownIcon, ZapIcon } from "@/components/ui/icons";
import LaserFlow from "./LaserFlow";

export function AdaaxHero() {
  return (
    <section className="relative overflow-hidden pb-16">
      {/* Subtle dark glow behind the beam — gives the laser a darker stage while
          letting the site's mesh background stay visible everywhere else. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 56% at 27% 34%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.22) 45%, transparent 78%)",
        }}
      />

      {/* ── UPPER ZONE — top of screen → screenshot edge; carries the laser + copy ── */}
      <div className="relative pb-6 pt-32 sm:pt-36">
        {/* LASER — full-bleed, falls from the top, flare lands at this zone's bottom */}
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <LaserFlow
            color="#34e07f"
            horizontalBeamOffset={-0.3}
            verticalBeamOffset={-0.5}
            verticalSizing={33.8}
            horizontalSizing={0.5}
            flowSpeed={0.15}
            fogIntensity={1.0}
            fogScale={0.25}
            wispSpeed={12.0}
            wispIntensity={10.0}
            wispDensity={1.2}
            flowStrength={0.1}
            decay={1.1}
            falloffStart={2.0}
            fogFallSpeed={0.8}
            mouseTiltStrength={0}
            className="h-full w-full"
          />
        </div>

        {/* Origin bloom where the beam is born, near the very top-left */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-10 left-[20%] z-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[#34e07f]/60 blur-[150px]"
        />

        {/* COPY — text on the right (RTL start) */}
        <div className="relative z-10 mx-auto max-w-6xl px-5">
          <div className="max-w-2xl text-right">
            <Badge variant="solid" icon={<ZapIcon className="h-4 w-4" />}>
              AdaaX — برنامج تحسين الأداء بالاشتراك
            </Badge>

            <h1 className="mt-7 font-display text-[clamp(2.4rem,5.5vw,4.75rem)] font-bold leading-[1.1] tracking-tight text-white [text-shadow:0_0_60px_rgba(52,224,127,0.2)]">
              قوة جهازك بالكامل،
              <br />
              في تطبيق واحد
              <br />
              <span className="text-gradient whitespace-nowrap">اسمه AdaaX.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              تطبيق سطح المكتب اللي بيراقب جهازك لحظياً ويطبّق عشرات التحسينات المدروسة على المعالج وكرت
              الشاشة والرامات والويندوز — بضغطة واحدة، وبتحديثات مستمرة مربوطة باشتراكك.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button href="#subscribe" size="md" className="px-7 py-3 text-base sm:text-lg">
                ابدأ الاشتراك الآن
                <ArrowDownIcon className="h-5 w-5" />
              </Button>
              <Button href="#features" variant="outline" size="md" className="px-7 py-3 text-base sm:text-lg">
                استعرض المميزات
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── WIDE SCREENSHOT — opaque, masks the beam's tail; its top edge meets the flare ── */}
      <div className="relative z-10 mx-auto max-w-[1280px] px-5">
        {/* TOP-EDGE MIST — soft green fog billowing ABOVE the image's top edge,
            spanning the full width and denser where the beam lands (left). It sits
            above the image (not on it), like the mist at a waterfall's base. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-5 -top-28 z-20 h-28 blur-2xl mix-blend-screen"
          style={{
            background:
              "radial-gradient(50% 135% at 20% 100%, rgba(52,224,127,0.45) 0%, transparent 68%), radial-gradient(150% 85% at 55% 100%, rgba(52,224,127,0.20) 0%, transparent 78%)",
          }}
        />

        {/* Full screenshot — shown complete. The page's mesh/background stays
            continuous below it (no dark band/shadow), so the transition reads soft. */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10">
          <Image
            src="/adaax/dashboard.png"
            alt="واجهة تطبيق AdaaX — لوحة مراقبة وتحسين أداء الجهاز"
            width={1490}
            height={934}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </section>
  );
}
