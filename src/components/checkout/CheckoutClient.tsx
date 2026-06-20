"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ArrowLeftIcon, CheckIcon, XIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart/CartContext";
import { toLatinDigits } from "@/lib/site-config";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/data/countries";
import { CountrySelect } from "./CountrySelect";
import { PayPalCheckout } from "./PayPalCheckout";

// Dark inputs (the page matches the rest of the site).
const inputClass =
  "w-full rounded-xl border border-white/12 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-subtle transition-colors focus:border-primary-light/60 focus:outline-none focus:ring-1 focus:ring-primary-light/30";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CheckoutClient({
  initialName = "",
  initialEmail = "",
}: {
  initialName?: string;
  initialEmail?: string;
}) {
  const router = useRouter();
  const {
    items,
    subtotal,
    currency,
    count,
    clear,
    openCart,
    coupon,
    couponLoading,
    couponError,
    discount,
    total,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [form, setForm] = useState({
    name: initialName,
    email: initialEmail,
    phone: "",
    country: DEFAULT_COUNTRY,
    discord: "",
    notes: "",
  });
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [code, setCode] = useState("");
  const countryTouched = useRef(false);

  // Auto-detect the visitor's country by IP on first load (best-effort) — unless
  // they've already picked one manually. Tries our geo route (platform headers in
  // production), then a direct browser call as a fallback (works in local dev too).
  useEffect(() => {
    let cancelled = false;
    async function detect() {
      let code: string | null = null;
      try {
        const d = (await (await fetch("/api/geo")).json()) as { country?: string | null };
        code = d?.country ?? null;
      } catch {
        /* ignore */
      }
      if (!code) {
        try {
          const d = (await (await fetch("https://get.geojs.io/v1/ip/country.json")).json()) as {
            country?: string;
          };
          code = d?.country ?? null;
        } catch {
          /* ignore */
        }
      }
      if (cancelled || countryTouched.current || !code) return;
      const up = code.toUpperCase();
      if (COUNTRIES.some((c) => c.code === up)) {
        setForm((f) => ({ ...f, country: up }));
      }
    }
    detect();
    return () => {
      cancelled = true;
    };
  }, []);

  const emailValid = EMAIL_RE.test(form.email);
  const dialCode = COUNTRIES.find((c) => c.code === form.country)?.dial ?? "";
  const localPhone = toLatinDigits(form.phone).replace(/[^\d]/g, "");
  const phoneValid = localPhone.length >= 6;
  // Full international number (calling code + local) for the order record + PayPal.
  const phoneFull = `${dialCode}${localPhone}`;
  const valid =
    form.name.trim().length > 1 && emailValid && phoneValid && agreed && items.length > 0;

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const onCountry = (code: string) => {
    countryTouched.current = true;
    setForm((f) => ({ ...f, country: code }));
  };

  const handleSuccess = (orderId?: string) => {
    if (orderId) {
      // Show the success state immediately so the empty-cart screen never flashes
      // while we navigate to the order page.
      setRedirecting(true);
      clear();
      router.push(`/order/${orderId}`);
      return;
    }
    clear();
    setDone(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Success / redirecting screen — takes precedence over the empty-cart screen.
  if (done || redirecting) {
    return (
      <Section spacing="none" className="overflow-hidden pb-24 pt-32 sm:pt-36">
        <Container size="default" className="relative z-10">
          <div className="mx-auto max-w-lg rounded-3xl border border-primary/30 bg-surface/60 p-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <CheckIcon className="h-8 w-8 text-primary-light" />
            </div>
            <h1 className="font-display text-2xl font-bold text-white">تم استلام طلبك بنجاح!</h1>
            <p className="mx-auto mt-3 max-w-sm leading-relaxed text-muted">
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
                className="rounded-xl border border-white/15 px-6 py-3 font-display text-sm font-bold text-white transition-colors hover:bg-white/5"
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
      <Section spacing="none" className="overflow-hidden pb-24 pt-32 sm:pt-36">
        <Container size="default" className="relative z-10">
          <div className="mx-auto max-w-lg rounded-3xl border border-white/12 bg-surface/60 p-10 text-center">
            <h1 className="font-display text-2xl font-bold text-white">سلتك فارغة</h1>
            <p className="mt-3 text-muted">أضف خدمة أو باقة قبل إتمام الدفع.</p>
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
    <Section spacing="none" className="overflow-hidden pb-24 pt-32 sm:pt-36">
      <Container size="wide" className="relative z-10">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          متابعة التسوّق
        </Link>

        <h1 className="mb-8 font-display text-3xl font-bold text-white sm:text-4xl">إتمام الطلب</h1>

        <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-10">
          {/* Left — customer info + payment */}
          <div className="flex flex-col gap-8">
            {/* Customer details (dark) */}
            <div className="rounded-2xl border border-white/12 bg-surface/70 p-6 sm:p-7">
              <h2 className="mb-5 font-display text-lg font-bold text-white">بياناتك</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-muted">
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
                  <label className="mb-1.5 block text-sm font-semibold text-muted">
                    البريد الإلكتروني <span className="text-primary-light">*</span>
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set("email")}
                    placeholder="example@email.com"
                    dir="ltr"
                    className={`${inputClass} text-right`}
                  />
                  {form.email && !emailValid ? (
                    <p className="mt-1.5 text-xs text-red-400">صيغة البريد غير صحيحة.</p>
                  ) : (
                    <p className="mt-1.5 text-xs text-faint">هنرسل تفاصيل الخدمة على بريدك.</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-muted">
                    رقم الجوال (واتساب) <span className="text-primary-light">*</span>
                  </label>
                  <div className="flex gap-2" dir="ltr">
                    <span className="inline-flex shrink-0 items-center rounded-xl border border-white/12 bg-black/30 px-3 text-sm font-semibold text-muted">
                      +{dialCode}
                    </span>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="1001234567"
                      dir="ltr"
                      className={`${inputClass} flex-1 text-left`}
                    />
                  </div>
                  {form.phone && !phoneValid && (
                    <p className="mt-1.5 text-xs text-red-400">رقم الجوال غير صحيح.</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-muted">
                    البلد <span className="text-primary-light">*</span>
                  </label>
                  <CountrySelect value={form.country} onChange={onCountry} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-muted">
                    اسم المستخدم في ديسكورد <span className="text-faint">(اختياري)</span>
                  </label>
                  <input
                    type="text"
                    value={form.discord}
                    onChange={set("discord")}
                    placeholder="username"
                    dir="ltr"
                    className={`${inputClass} text-right`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-muted">
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

            {/* Payment (dark, like the rest — PayPal's own card window is white) */}
            <div className="rounded-2xl border border-white/12 bg-surface/70 p-6 sm:p-7">
              <h2 className="mb-5 font-display text-lg font-bold text-white">الدفع</h2>

              {/* Terms acceptance — required before paying (per service agreement) */}
              <label className="mb-5 flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
                />
                <span className="text-sm leading-relaxed text-muted">
                  أوافق على{" "}
                  <Link href="/terms" target="_blank" className="font-semibold text-primary-light underline underline-offset-2">
                    الشروط والأحكام
                  </Link>{" "}
                  و
                  <Link href="/privacy" target="_blank" className="font-semibold text-primary-light underline underline-offset-2">
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
                email={form.email}
                name={form.name}
                phone={phoneFull}
                country={form.country}
                onSuccess={handleSuccess}
              />
            </div>
          </div>

          {/* Right — order summary (dark) */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-white/12 bg-surface p-6 shadow-[0_8px_40px_rgba(0,0,0,0.35)]">
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

              <ul className="flex flex-col gap-3 border-b border-white/10 pb-4">
                {items.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-white/10">
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

              {/* Coupon (shared with the cart drawer) */}
              <div className="border-b border-white/10 py-4">
                {coupon ? (
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-primary-light">
                      <CheckIcon className="h-4 w-4" />
                      <span dir="ltr">{coupon.code}</span>
                      <span className="text-white/70">· خصم {currency}{discount}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        removeCoupon();
                        setCode("");
                      }}
                      aria-label="إزالة الكود"
                      className="shrink-0 text-faint transition-colors hover:text-red-400"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        applyCoupon(code);
                      }}
                      className="flex gap-2"
                    >
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        placeholder="كود الخصم"
                        dir="ltr"
                        className="min-w-0 flex-1 rounded-lg border border-white/12 bg-black/20 px-3 py-2 text-right text-sm text-white placeholder:text-subtle focus:border-primary-light/60 focus:outline-none focus:ring-1 focus:ring-primary-light/30"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading || !code.trim()}
                        className="shrink-0 rounded-lg border border-primary/50 bg-primary/15 px-4 py-2 text-sm font-semibold text-primary-light transition-colors hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {couponLoading ? "..." : "تطبيق"}
                      </button>
                    </form>
                    {couponError ? <p className="mt-2 text-xs text-red-400">{couponError}</p> : null}
                  </>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-2 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted">الإجمالي الفرعي ({count} عنصر)</span>
                  <span className="font-semibold text-white" dir="ltr">
                    {currency}
                    {subtotal}
                  </span>
                </div>
                {discount > 0 ? (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-primary-light">الخصم</span>
                    <span className="font-semibold text-primary-light" dir="ltr">
                      −{currency}
                      {discount}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="text-sm font-semibold text-white">الإجمالي</span>
                  <span className="font-display text-2xl font-bold text-white" dir="ltr">
                    {currency}
                    {total}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </Section>
  );
}
