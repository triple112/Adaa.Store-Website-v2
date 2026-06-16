import { Marquee } from "@/components/ui/Marquee";
import { Section } from "@/components/ui/Section";
import { reviewsBottom, reviewsTop } from "@/data/reviews";
import { ReviewCard } from "./ReviewCard";

export function Reviews() {
  return (
    <Section id="reviews" spacing="none" className="overflow-hidden pb-12 pt-2">
      {/* Cards pack back-to-back (repeat fills any screen). Pause on hover so the
          text can be selected/copied. The second row only appears on 2K+ screens
          — 1920 and below show a single, comfortable row. */}
      <div className="flex flex-col gap-5">
        <Marquee direction="left" durationSec={200} pauseOnHover repeat={4}>
          {reviewsTop.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </Marquee>

        <div className="hidden min-[2000px]:block">
          <Marquee direction="left" durationSec={180} pauseOnHover repeat={4}>
            {reviewsBottom.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </Marquee>
        </div>
      </div>
    </Section>
  );
}
