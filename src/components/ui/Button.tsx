import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display font-bold rounded-xl transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  // Dark capsule with a single green underline accent (brand signature)
  primary:
    "bg-gradient-to-b from-[#2a2a2a] to-[#161616] text-white border border-white/10 border-b-2 border-b-primary shadow-[0_4px_20px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:border-primary-light hover:shadow-[0_15px_45px_rgba(80,141,78,0.25)]",
  outline:
    "border border-primary/40 text-primary-light hover:bg-primary/10 hover:border-primary-light",
  ghost: "text-muted hover:text-white hover:bg-white/5",
};

const sizes: Record<Size, string> = {
  md: "px-6 py-3 text-base",
  lg: "px-10 py-5 text-lg sm:px-16",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

type ButtonAsLink = CommonProps & { href: string } & Omit<
    React.ComponentProps<typeof Link>,
    "href" | "className" | "children"
  >;

type ButtonAsButton = CommonProps & { href?: undefined } & Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "children"
  >;

export function Button(props: ButtonAsLink | ButtonAsButton) {
  const { variant = "primary", size = "md", className, children, href, ...rest } = props as
    CommonProps & { href?: string } & Record<string, unknown>;
  const classes = cn(base, variants[variant], sizes[size], className);

  if (href) {
    return (
      <Link
        href={href}
        className={classes}
        {...(rest as Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      className={classes}
      {...(rest as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}
