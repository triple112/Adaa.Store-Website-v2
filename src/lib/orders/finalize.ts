import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderConfirmation, sendWelcomeMagicLink } from "@/lib/email/send";
import { buildAuthConfirmLink } from "@/lib/auth/links";

type Item = { name?: string; qty?: number; price?: number; currency?: string };
type Admin = ReturnType<typeof createAdminClient>;

/** Find a profile by email, or silently create a new (passwordless) account. */
async function resolveUserByEmail(
  admin: Admin,
  email: string,
  name?: string,
): Promise<{ userId: string; isNew: boolean }> {
  const { data: existing } = await admin
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing?.id) return { userId: existing.id, isNew: false };

  const { data: created, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true, // no verification email; account is usable immediately
    user_metadata: { full_name: name || email.split("@")[0] },
  });
  if (error || !created?.user) throw new Error("create_user_failed");
  return { userId: created.user.id, isNew: true };
}

/**
 * Records a one-time (package) order after a successful payment, creating a
 * silent account for guests, then emails the order confirmation (+ a welcome
 * magic-link for brand-new accounts). Never throws on email failure.
 */
export async function finalizeGuestOrder(opts: {
  loggedInUserId?: string | null;
  email: string;
  name?: string;
  phone?: string | null;
  items: Item[];
  amount: number;
  currency: string;
  couponId?: string | null;
  provider?: string;
  providerOrderId: string;
}): Promise<{ orderId: string; orderNumber: number }> {
  const admin = createAdminClient();

  let userId = opts.loggedInUserId ?? null;
  let isNew = false;
  if (!userId) {
    const r = await resolveUserByEmail(admin, opts.email, opts.name);
    userId = r.userId;
    isNew = r.isNew;
  }

  const { data: order, error } = await admin
    .from("orders")
    .insert({
      user_id: userId,
      email: opts.email,
      name: opts.name ?? null,
      phone: opts.phone ?? null,
      type: "package",
      items: opts.items,
      amount: opts.amount,
      currency: opts.currency,
      status: "paid",
      provider: opts.provider || "paypal",
      paypal_order_id: opts.providerOrderId,
      coupon_id: opts.couponId ?? null,
    })
    .select("id, order_number")
    .single();
  if (error || !order) throw new Error("order_insert_failed");

  // Record coupon redemption (atomic: bumps used_count + logs redemption).
  if (opts.couponId) {
    await admin
      .rpc("redeem_coupon", {
        p_coupon: opts.couponId,
        p_user: userId,
        p_order: order.id,
      })
      .then(undefined, () => {});
  }

  // Emails are best-effort — a delivery hiccup must never fail a paid order.
  await sendOrderConfirmation(opts.email, {
    orderNumber: order.order_number,
    orderId: order.id,
    items: opts.items,
    amount: opts.amount,
    currency: opts.currency,
  }).catch(() => {});

  if (isNew) {
    const link = await buildAuthConfirmLink("magiclink", opts.email, "/account").catch(
      () => null,
    );
    if (link) await sendWelcomeMagicLink(opts.email, opts.name, link).catch(() => {});
  }

  return { orderId: order.id, orderNumber: order.order_number };
}
