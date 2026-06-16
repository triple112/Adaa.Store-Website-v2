import type { Metadata } from "next";
import Link from "next/link";
import { requireUser, getProfile } from "@/lib/auth/dal";
import { createClient } from "@/lib/supabase/server";
import { CancelSubscriptionButton } from "@/components/account/CancelSubscriptionButton";
import { formatOrderNumber } from "@/lib/site-config";

export const metadata: Metadata = { title: "حسابي" };
export const dynamic = "force-dynamic";

const PLAN_LABEL: Record<string, string> = {
  monthly: "شهري",
  yearly: "سنوي",
};

const ORDER_TYPE_LABEL: Record<string, string> = {
  package: "باقة",
  service: "خدمة",
  subscription: "اشتراك",
};

const ORDER_STATUS_LABEL: Record<string, string> = {
  paid: "مدفوع",
  pending: "قيد المعالجة",
  failed: "فشل",
  refunded: "مسترد",
};

function formatDate(value: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

type SubscriptionRow = {
  id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

/** Access is granted while the paid period hasn't ended yet. */
function isSubscriptionActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  if (sub.status === "expired") return false;
  return Boolean(
    sub.current_period_end && new Date(sub.current_period_end) > new Date(),
  );
}

type OrderRow = {
  id: string;
  order_number: number;
  type: string;
  items: { name?: string }[] | null;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
};

/** Join all item names for the history summary (fixes multi-item orders). */
function summarizeItems(order: OrderRow): string {
  const names = (order.items ?? []).map((i) => i.name).filter(Boolean) as string[];
  if (names.length === 0) return ORDER_TYPE_LABEL[order.type] ?? order.type;
  return names.join(" + ");
}

export default async function AccountPage() {
  await requireUser();
  const profile = await getProfile();
  const supabase = await createClient();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id, plan, status, current_period_end, cancel_at_period_end")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<SubscriptionRow>();

  const active = isSubscriptionActive(subscription);

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, type, items, amount, currency, status, created_at")
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<OrderRow[]>();

  const displayName = profile?.display_name || profile?.email || "صديقنا";

  return (
    <section className="mx-auto w-full max-w-4xl px-4 pb-20 pt-28 sm:pt-32">
      <header className="mb-8">
        <h1 className="font-display text-3xl font-bold text-white">
          مرحباً، {displayName}
        </h1>
        <p className="mt-2 text-sm text-muted">{profile?.email}</p>
      </header>

      {/* اشتراك AdaaX */}
      <div className="rounded-2xl border border-white/10 bg-surface p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-xl font-bold text-white">اشتراك AdaaX</h2>
          {subscription && (
            <StatusBadge active={active} canceling={subscription.cancel_at_period_end} />
          )}
        </div>

        {subscription && active ? (
          <>
            <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="الخطة" value={PLAN_LABEL[subscription.plan] ?? subscription.plan} />
              <Field
                label={subscription.cancel_at_period_end ? "ينتهي في" : "يتجدد في"}
                value={formatDate(subscription.current_period_end)}
              />
              <Field
                label="التجديد التلقائي"
                value={subscription.cancel_at_period_end ? "متوقف" : "مفعّل"}
              />
            </dl>
            {!subscription.cancel_at_period_end && (
              <div className="mt-5 flex justify-end">
                <CancelSubscriptionButton />
              </div>
            )}
          </>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-white/10 bg-elevated/50 p-6 text-center">
            <p className="text-sm text-muted">
              {subscription
                ? "انتهى اشتراكك. جدّده عشان تكمل استخدام AdaaX."
                : "لا يوجد اشتراك نشط حالياً."}
            </p>
            <Link
              href="/adaax"
              className="mt-4 inline-flex items-center rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#161616] px-5 py-2.5 text-sm font-bold text-white border border-white/10 border-b-2 border-b-primary transition-all hover:border-primary-light"
            >
              {subscription ? "تجديد الاشتراك" : "اشترك الآن"}
            </Link>
          </div>
        )}
      </div>

      {/* سجل المشتريات */}
      <div className="mt-6 rounded-2xl border border-white/10 bg-surface p-6 sm:p-7">
        <h2 className="font-display text-xl font-bold text-white">سجل المشتريات</h2>

        {orders && orders.length > 0 ? (
          <ul className="mt-5 divide-y divide-white/5">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/order/${order.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-primary-light">
                        {formatOrderNumber(order.order_number)}
                      </span>
                      <span className="text-[11px] text-faint">
                        {ORDER_TYPE_LABEL[order.type] ?? order.type}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm font-semibold text-white">
                      {summarizeItems(order)}
                    </p>
                    <p className="text-xs text-faint">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-primary-light">
                      {order.amount} {order.currency === "USD" ? "$" : order.currency}
                    </span>
                    <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-muted">
                      {ORDER_STATUS_LABEL[order.status] ?? order.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-xl border border-dashed border-white/10 bg-elevated/50 p-6 text-center text-sm text-muted">
            لا توجد مشتريات بعد.{" "}
            <Link href="/services" className="font-semibold text-primary-light hover:underline">
              تصفّح خدماتنا
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-elevated/50 p-4">
      <dt className="text-xs text-faint">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

function StatusBadge({ active, canceling }: { active: boolean; canceling: boolean }) {
  const label = !active ? "منتهي" : canceling ? "نشط (لن يتجدد)" : "نشط";
  return (
    <span
      className={
        active
          ? "rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary-light"
          : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-muted"
      }
    >
      {label}
    </span>
  );
}
