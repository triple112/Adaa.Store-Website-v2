import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  eyebrow?: string;
  align?: "center" | "start";
  className?: string;
};

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
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-start",
        className,
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-semibold uppercase tracking-widest text-primary-light">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="max-w-2xl text-base leading-relaxed text-subtle sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}
