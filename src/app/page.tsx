import { Comparison } from "@/components/sections/Comparison";
import { Contact } from "@/components/sections/Contact";
import { Faq } from "@/components/sections/Faq";
import { GamesMarquee } from "@/components/sections/GamesMarquee";
import { Hero } from "@/components/sections/Hero";
import { Packages } from "@/components/sections/packages/Packages";
import { ProcessSteps } from "@/components/sections/ProcessSteps";
import { Reviews } from "@/components/sections/reviews/Reviews";
import { TechStats } from "@/components/sections/tech/TechStats";

export default function Home() {
  return (
    <>
      {/* Landing: hero + reviews share the first viewport */}
      <div className="flex min-h-screen flex-col">
        <Hero />
        <Reviews />
      </div>

      <ProcessSteps />
      <Packages />
      <GamesMarquee />
      <TechStats />
      <Comparison />
      <Contact />
      <Faq />
    </>
  );
}
