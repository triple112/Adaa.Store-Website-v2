/**
 * Tiny className combiner — joins truthy class strings.
 * Kept dependency-free on purpose; swap for `clsx` + `tailwind-merge`
 * later if class conflicts start to matter.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
