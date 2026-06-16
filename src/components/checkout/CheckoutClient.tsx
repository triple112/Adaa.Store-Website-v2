"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ArrowLeftIcon, CheckIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart/CartContext";
import { PayPalCheckout } from "./PayPalCheckout";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-faint transition-colors focus:border-primary-light/50 focus:outline-none";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type CouponState = { couponId: string; discount: number; finalAmount: number } | null;

export function CheckoutClient() {
  const router = useRouter();
  const { items, subtotal, currency, count, clear, openCart } = useCart();
  const [form, setForm] = useState({ name: "", email: "", discord: "", whatsapp: "", notes: "" });
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<CouponState>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const total = coupon ? coupon.finalAmount : subtotal;

  async function applyCoupon() {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: subtotal, appliesTo: "packages" }),
      });
      const data = await res.json();
      if (data.valid) {
        setCoupon({ couponId: data.couponId, discount: data.discount, finalAmount: data.finalAmount });
        setCouponMsg(null);
      } else {
        setCoupon(null);
        setCouponMsg(data.message ?? "كود غير صالح");
      }
    } catch {
      setCouponMsg("تعذّر التحقق، حاول تاني.");
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setCoupon(null);
    setCouponCode("");
    setCouponMsg(null);
  }

  const emailValid = EMAIL_RE.test(form.email);
  const valid = form.name.trim().length > 1 && emailValid && agreed && items.length > 0;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSuccess = (orderId?: string) => {
    clear();
    if (orderId) {
      router.push(`/order/${orderId}`);
      return;
    }
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Success screen
  if (done) {
    return (
      <Section spacing="none" className="ambient-glow overflow-hidden pb-24 pt-32 sm:pt-36">
        <Container size="default" className="relative z-10">
          <div className="mx-auto max-w-lg rounded-3xl border border-primary/30 bg-white/[0.02] p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <CheckIcon className="h-8 w-8 text-primary-light" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">تم استلام طلبك بنجاح!</h1>
            <p className="mx-auto mt-3 max-w-sm leading-relaxed text-subtle">
              شكراً لثقتك في أداء. هنتواصل معك على بريدك الإلكتروني لتنسيق موعد تنفيذ الخدمة عبر تذكرة
              الديسكورد.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/services"
                className="rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-primary-light"
              >
                تصفّح الخدمات
              </Link>
              <Link
                href="/"
                className="rounded-xl border border-white/10 px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-white/5"
              >
                الصفحة الرئيسية
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <Section spacing="none" className="ambient-glow overflow-hidden pb-24 pt-32 sm:pt-36">
        <Container size="default" className="relative z-10">
          <div className="mx-auto max-w-lg rounded-3xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <h1 className="font-display text-2xl font-bold text-white">سلتك فارغة</h1>
            <p className="mt-3 text-subtle">أضف خدمة أو باقة قبل إتمام الدفع.</p>
            <Link
              href="/services"
              className="mt-8 inline-block rounded-xl bg-primary px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-primary-light"
            >
              تصفّح الخدمات
            </Link>
          </div>
        </Container>
      </Section>
    );
  }

  return (
    <Section spacing="none" className="ambient-glow overflow-hidden pb-24 pt-32 sm:pt-36">
      <Container size="wide" className="relative z-10">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-subtle transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          متابعة التسوّق
        </Link>

        <h1 className="mb-8 font-display text-3xl font-bold text-white sm:text-4xl">إتمام الطلب</h1>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          {/* Left — customer info + payment */}
          <div className="flex flex-col gap-8">
            {/* Customer details */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface/40 p-6 sm:p-7">
              <h2 className="mb-5 font-display text-lg font-bold text-white">بياناتك</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-subtle">
                    الاسم بالكامل <span className="text-primary-light">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={set("name")}
                    placeholder="اكتب اسمك"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-subtle">
                    البريد الإلكتروني <span className="text-primary-light">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="example@email.com"
                    dir="ltr"
                    className={inputClass}
                  />
                  {form.email && !emailValid ? (
                    <p className="mt-1.5 text-xs text-red-400">صيغة البريد غير صحيحة.</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-faint">هنرسل تفاصيل الخدمة على بريدك.</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-subtle">
                    اسم المستخدم في ديسكورد <span className="text-faint">(اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={form.discord}
                    onChange={set("discord")}
                    placeholder="username"
                    dir="ltr"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-subtle">
                    رقم واتساب <span className="text-faint">(اختياري)</span>
                  </label>
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={set("whatsapp")}
                    placeholder="+20..."
                    dir="ltr"
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-subtle">
                    ملاحظات <span className="text-faint">(اختياري)</span>
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={set("notes")}
                    rows={3}
                    placeholder="أي تفاصيل عن جهازك أو طلبك"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="rounded-2xl border border-white/[0.08] bg-surface/40 p-6 sm:p-7">
              <h2 className="mb-5 font-display text-lg font-bold text-white">الدفع</h2>

              {/* Terms acceptance — required before paying (per service agreement) */}
              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-sm leading-relaxed text-subtle">
                  أوافق على{" "}
                  <Link href="/terms" target="_blank" className="text-primary-light underline underline-offset-2">
                    الشروط والأحكام
                  </Link>{" "}
                  و
                  <Link href="/privacy" target="_blank" className="text-primary-light underline underline-offset-2">
                    سياسة الخصوصية
                  </Link>
                  .
                </span>
              </label>

              <PayPalCheckout
                enabled={valid}
                items={items}
                total={total}
                currency={currency}
                couponId={coupon?.couponId}
                onSuccess={handleSuccess}
              />
            </div>
          </div>

          {/* Right — order summary */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-white/[0.08] bg-surface/60 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-white">ملخص الطلب</h2>
                <button
                  type="button"
                  onClick={openCart}
                  className="text-xs font-semibold text-primary-light transition-colors hover:text-white"
                >
                  تعديل
                </button>
              </div>

              <ul className="flex flex-col gap-3 border-b border-white/5 pb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-white/[0.06]">
                      <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                      <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="text-sm leading-snug text-white">{item.name}</span>
                      <span className="shrink-0 text-sm font-bold text-white" dir="ltr">
                        {item.currency}
                        {item.price * item.qty}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Coupon */}
              <div className="border-b border-white/5 py-4">
                {coupon ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <span className="text-primary-light">
                      كوبون مطبّق · خصم {currency}
                      {coupon.discount}
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-faint underline hover:text-white"
                    >
                      إزالة
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="كود الخصم"
                      dir="ltr"
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                      className="shrink-0 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/5 disabled:opacity-50"
                    >
                      {couponLoading ? "..." : "تطبيق"}
                    </button>
                  </div>
                )}
                {couponMsg && <p className="mt-2 text-xs text-red-400">{couponMsg}</p>}
              </div>

              <div className="flex items-center justify-between py-4">
                <span className="text-sm text-subtle">الإجمالي ({count} عنصر)</span>
                <span className="font-display text-2xl font-bold text-white" dir="ltr">
                  {currency}
                  {total}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
