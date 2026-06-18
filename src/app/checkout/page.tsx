import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { getProfile } from "@/lib/auth/dal";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أكمل بياناتك وادفع بأمان عبر PayPal أو بطاقتك.",
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  // Pre-fill the form for signed-in customers (still editable).
  const profile = await getProfile();
  return (
    <CheckoutClient
      initialName={profile?.display_name ?? ""}
      initialEmail={profile?.email ?? ""}
    />
  );
}
