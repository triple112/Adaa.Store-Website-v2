import { Marquee } from "@/components/ui/Marquee";
import { reviewsBottom, reviewsTop } from "@/data/reviews";
import { ReviewCard } from "./ReviewCard";

/**
 * A single marquee row of reviews. Split into two rows (top/bottom) so the
 * landing can place only the top row inside the first viewport and let the
 * bottom row sit below the fold — it reveals on scroll instead of cramming
 * both rows onto one screen. Both rows travel the same direction; the top row
 * is the faster of the two.
 */
export function ReviewsRow({ row }: { row: "top" | "bottom" }) {
  const reviews = row === "top" ? reviewsTop : reviewsBottom;
  const durationSec = row === "top" ? 180 : 220;

  return (
    <Marquee direction="left" durationSec={durationSec} pauseOnHover repeat={4}>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </Marquee>
  );
}
