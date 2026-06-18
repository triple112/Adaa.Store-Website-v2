/**
 * Single source of truth for "is this subscription currently active?".
 * Used by the account page, the admin panel, and the AdaaX license endpoints
 * so the website and desktop app always agree.
 */
export type SubscriptionLike = {
  status: string;
  current_period_end: string | null;
};

/** Access is granted while the paid period hasn't ended yet. */
export function isSubscriptionActive(
  sub: SubscriptionLike | null | undefined,
): boolean {
  if (!sub) return false;
  if (sub.status === "expired") return false;
  return Boolean(
    sub.current_period_end && new Date(sub.current_period_end) > new Date(),
  );
}
