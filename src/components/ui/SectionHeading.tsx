import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  align?: "center" | "start";
  className?: string;
};

/**
 * Section heading: a pill eyebrow + display title + optional subtitle.
 * Pass a `<span className="text-gradient">…</span>` inside `title` to make a
 * keyword glow — that highlight is the signature treatment across the site.
 */
export function SectionHeading({
  title,
  subtitle,
  eyebrow,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className,
      )}
    >
      {eyebrow ? (
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.08] px-4 py-1.5 text-xs font-semibold tracking-wide text-primary-light backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary-light shadow-[0_0_8px_var(--color-primary-light)]" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-subtle sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
