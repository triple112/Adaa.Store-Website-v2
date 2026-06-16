import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  id?: string;
  className?: string;
  /** Vertical rhythm preset. */
  spacing?: "default" | "tight" | "none";
};

const spacings = {
  none: "",
  tight: "py-12 sm:py-16",
  default: "py-20 sm:py-24",
} as const;

/** A semantic <section> with consistent vertical rhythm and an anchor id. */
export function Section({ children, id, className, spacing = "default" }: SectionProps) {
  return (
    <section id={id} className={cn("relative", spacings[spacing], className)}>
      {children}
    </section>
  );
}
