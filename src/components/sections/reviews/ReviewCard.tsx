import Image from "next/image";
import { Fragment } from "react";
import type { Review } from "@/data/reviews";

/** Splits the text so any mention substring renders as a highlighted span. */
function renderWithMentions(text: string, mentions: string[] = []) {
  if (mentions.length === 0) return text;

  // Build a single regex that matches any mention.
  const escaped = mentions.map((m) => m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "g");

  return text.split(regex).map((part, i) =>
    mentions.includes(part) ? (
      <span
        key={i}
        className="font-bold text-white underline decoration-primary decoration-2 underline-offset-2"
      >
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <article
      dir="rtl"
      className="flex w-[300px] shrink-0 cursor-text flex-col rounded-[18px] border border-white/[0.08] bg-[rgba(20,20,20,0.65)] p-6 text-right backdrop-blur-md select-text sm:w-[380px]"
    >
      <header className="mb-4 flex items-center gap-3 border-b border-white/5 pb-4">
        <Image
          src={review.avatar}
          alt={review.name}
          width={48}
          height={48}
          loading="lazy"
          className="h-12 w-12 rounded-full border-2 border-primary-light/30 object-cover"
        />
        <div className="flex-1">
          <h4 className="font-display text-base font-bold text-white" dir="ltr">
            {review.name}
          </h4>
          <span
            dir="ltr"
            className="mt-1 inline-block rounded bg-primary/10 px-2 py-0.5 text-[0.8rem] text-primary-light"
          >
            {review.handle}
          </span>
        </div>
        <div
          className="text-sm tracking-[2px] text-[#FFD700]"
          aria-label={`${review.rating} من 5 نجوم`}
        >
          {"⭐".repeat(review.rating)}
        </div>
      </header>

      <p className="text-[0.95rem] leading-[1.7] text-[#ccc]">
        {renderWithMentions(review.text, review.mentions)}
      </p>
    </article>
  );
}
