import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  /** Adds the standard hover lift + green border. Off for static/marquee cards. */
  interactive?: boolean;
};

export function Card({ children, className, interactive = false }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-surface/75 backdrop-blur-md",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-primary-light/40 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
