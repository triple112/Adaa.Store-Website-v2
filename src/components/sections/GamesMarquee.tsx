import Image from "next/image";
import { Marquee } from "@/components/ui/Marquee";
import { Section } from "@/components/ui/Section";
import { gameLogos } from "@/data/games";

export function GamesMarquee() {
  return (
    <Section spacing="tight" className="overflow-hidden">
      <p className="mb-10 text-center text-sm font-semibold tracking-widest text-faint">
        تحسين مثبت على أشهر الألعاب التنافسية
      </p>

      <Marquee direction="left" durationSec={40} gapPx={80} repeat={3} fade>
        {gameLogos.map((logo, i) => (
          <div
            key={i}
            className="relative h-24 w-44 shrink-0 opacity-60 transition-opacity duration-300 hover:opacity-100 sm:h-28 sm:w-52"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="(max-width: 640px) 176px, 208px"
              loading="lazy"
              className="object-contain"
            />
          </div>
        ))}
      </Marquee>
    </Section>
  );
}
