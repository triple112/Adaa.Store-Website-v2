import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  /** `glass` = subtle pill, `solid` = green-tinted emphasis. */
  variant?: "glass" | "solid";
};

export function Badge({ children, icon, className, variant = "glass" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold backdrop-blur-sm",
        variant === "glass"
          ? "border border-white/10 bg-white/5 text-muted"
          : "border border-primary/25 bg-primary/10 text-white",
        className,
      )}
    >
      {icon ? <span className="text-primary-light">{icon}</span> : null}
      {children}
    </span>
  );
}
