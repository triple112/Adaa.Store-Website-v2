import type { Metadata } from "next";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أكمل بياناتك وادفع بأمان عبر PayPal أو بطاقتك.",
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
