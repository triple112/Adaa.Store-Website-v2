import type { Metadata } from "next";
import { requireUser, getProfile } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { isSubscriptionActive } from "@/lib/subscriptions/status";
import { LinkApproveClient } from "@/components/link/LinkApproveClient";

export const metadata: Metadata = { title: "ربط جهاز AdaaX" };
export const dynamic = "force-dynamic";

const PLAN_LABEL: Record<string, string> = { monthly: "شهري", yearly: "سنوي" };

export default async function LinkPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code: rawCode } = await searchParams;
  const code = (rawCode || "").trim().toUpperCase();

  // Must be signed in (any method) to approve a device.
  await requireUser(`/link${code ? `?code=${code}` : ""}`);
  const profile = await getProfile();
  const isAdmin = profile?.role === "admin";

  // Read the user's own subscriptions (RLS-scoped) to show their status.
  const supabase = await createClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .returns<{ plan: string; status: string; current_period_end: string | null }[]>();

  const activeSub = (subs ?? []).find((s) => isSubscriptionActive(s)) ?? null;
  const hasAccess = isAdmin || Boolean(activeSub);
  const planLabel = activeSub ? PLAN_LABEL[activeSub.plan] ?? activeSub.plan : null;

  return (
    <section className="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col justify-center px-4 pb-16 pt-28">
      <LinkApproveClient
        code={code}
        displayName={profile?.display_name || profile?.email || ""}
        hasAccess={hasAccess}
        isAdmin={isAdmin}
        planLabel={planLabel}
        periodEnd={activeSub?.current_period_end ?? null}
      />
    </section>
  );
}
