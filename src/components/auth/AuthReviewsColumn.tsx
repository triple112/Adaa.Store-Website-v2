import Image from "next/image";
import { Fragment } from "react";
import { reviewsTop, reviewsBottom, type Review } from "@/data/reviews";
import { cn } from "@/lib/utils";

const ALL: Review[] = [...reviewsTop, ...reviewsBottom];

function renderWithMentions(text: string, mentions: string[] = []) {
  if (mentions.length === 0) return text;
  const escaped = mentions.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "g");
  return text.split(regex).map((part, i) =>
    mentions.includes(part) ? (
      <span key={i} className="font-bold text-white underline decoration-primary decoration-2 underline-offset-2">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function Card({ review }: { review: Review }) {
  return (
    <article
      dir="rtl"
      className="w-full rounded-2xl border border-white/[0.08] bg-[rgba(20,20,20,0.6)] p-5 text-right backdrop-blur-md"
    >
      <header className="mb-3 flex items-center gap-3">
        <Image
          src={review.avatar}
          alt={review.name}
          width={40}
          height={40}
          loading="lazy"
          className="h-10 w-10 rounded-full border-2 border-primary-light/30 object-cover"
        />
        <div className="min-w-0 flex-1">
          <h4 className="font-display text-sm font-bold text-white" dir="ltr">
            {review.name}
          </h4>
          <span dir="ltr" className="text-xs text-primary-light">
            {review.handle}
          </span>
        </div>
        <div className="text-xs tracking-[1px] text-[#FFD700]" aria-label={`${review.rating} من 5`}>
          {"⭐".repeat(review.rating)}
        </div>
      </header>
      <p className="text-[0.85rem] leading-[1.7] text-[#c9c9c9]">
        {renderWithMentions(review.text, review.mentions)}
      </p>
    </article>
  );
}

/** Vertical auto-scrolling column of customer reviews. */
export function AuthReviewsColumn({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="mb-4 text-right">
        <h2 className="font-display text-xl font-bold text-white">ثقة آلاف اللاعبين</h2>
        <p className="mt-1 text-sm text-muted">تقييمات حقيقية من عملاء أداء.</p>
      </div>
      <div className="fade-y relative h-[600px] overflow-hidden">
        <div className="adaa-marquee-y">
          <div className="adaa-marquee-y-group">
            {ALL.map((r) => (
              <Card key={r.id} review={r} />
            ))}
          </div>
          <div className="adaa-marquee-y-group" aria-hidden>
            {ALL.map((r) => (
              <Card key={`${r.id}-dup`} review={r} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
