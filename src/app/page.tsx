import { Comparison } from "@/components/sections/Comparison";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { GamesMarquee } from "@/components/sections/GamesMarquee";
import { Hero } from "@/components/sections/Hero";
import { Packages } from "@/components/sections/packages/Packages";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { ReviewsRow } from "@/components/sections/reviews/Reviews";
import { TechStats } from "@/components/sections/tech/TechStats";
import { Seam } from "@/components/ui/Seam";

export default function Home() {
  return (
    <>
      {/* Landing: hero + the FIRST reviews row share the first viewport. */}
      <div className="flex min-h-screen flex-col">
        <Hero />
        <section id="reviews" className="pb-4 pt-2">
          <ReviewsRow row="top" />
        </section>
      </div>

      {/* The second row sits just below the fold — it reveals on scroll. */}
      <section className="pb-12 pt-4">
        <ReviewsRow row="bottom" />
      </section>

      <Seam />
      <ProcessSteps />
      <Seam tone="green" />
      <Packages />
      <Seam />
      <GamesMarquee />
      <Seam tone="green" />
      <TechStats />
      <Seam />
      <Comparison />
      <Seam />
      <Contact />
      <Seam />
      <Faq />
    </>
  );
}
