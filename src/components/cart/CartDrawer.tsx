"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckIcon,
  MinusIcon,
  PlusIcon,
  ShoppingCartIcon,
  TagIcon,
  TrashIcon,
  XIcon,
} from "@/components/ui/icons";
import { useCart } from "@/lib/cart/CartContext";
import { cn } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    setQty,
    removeItem,
    subtotal,
    currency,
    count,
    coupon,
    couponLoading,
    couponError,
    discount,
    total,
    applyCoupon,
    removeCoupon,
  } = useCart();
  const [code, setCode] = useState("");

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeCart]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCart}
        aria-hidden
        className={cn(
          "fixed inset-0 z-[65] bg-black/70 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Drawer — anchored to the right edge, slides in horizontally */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="سلة المشتريات"
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-r border-white/15 bg-surface shadow-[0_0_60px_rgba(0,0,0,0.7)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/12 bg-elevated/60 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCartIcon className="h-5 w-5 text-primary-light" />
            <h2 className="font-display text-lg font-bold text-white">سلة المشتريات</h2>
            {count > 0 ? (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary-light">
                {count}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="إغلاق السلة"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-white/10 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Items / empty state */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-elevated">
              <ShoppingCartIcon className="h-7 w-7 text-subtle" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-white">سلتك فارغة</p>
              <p className="mt-1 text-sm text-muted">أضف خدمة لتبدأ طلبك.</p>
            </div>
            <Link
              href="/services"
              onClick={closeCart}
              className="rounded-xl border border-primary/50 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary-light transition-colors hover:bg-primary/20"
            >
              تصفّح الخدمات
            </Link>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <ul className="flex flex-col gap-3">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-white/10 bg-elevated p-3 shadow-[0_2px_12px_rgba(0,0,0,0.25)]"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-semibold leading-snug text-white">{item.name}</h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`حذف ${item.name}`}
                        className="shrink-0 text-subtle transition-colors hover:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1 rounded-lg border border-white/15 bg-black/20 p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label="إنقاص الكمية"
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/15 hover:text-white"
                        >
                          <MinusIcon className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold text-white">
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label="زيادة الكمية"
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted transition-colors hover:bg-white/15 hover:text-white"
                        >
                          <PlusIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <span className="font-display text-base font-bold text-white" dir="ltr">
                        {item.currency}
                        {item.price * item.qty}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer — discount + totals + checkout */}
        {items.length > 0 ? (
          <div className="border-t border-white/12 bg-elevated/50 px-5 py-4">
            {/* Discount code */}
            <div className="mb-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-muted">
                <TagIcon className="h-3.5 w-3.5" />
                كود الخصم
              </label>

              {coupon ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-semibold text-primary-light">
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
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="أدخل الكود"
                      dir="ltr"
                      className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2.5 text-right text-sm text-white placeholder:text-subtle focus:border-primary-light/60 focus:outline-none focus:ring-1 focus:ring-primary-light/30"
                    />
                    <button
                      type="submit"
                      disabled={couponLoading || !code.trim()}
                      className="shrink-0 rounded-xl border border-primary/50 bg-primary/15 px-4 py-2.5 text-sm font-semibold text-primary-light transition-colors hover:bg-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {couponLoading ? "..." : "تطبيق"}
                    </button>
                  </form>
                  {couponError ? (
                    <p className="mt-1.5 text-[11px] text-red-400">{couponError}</p>
                  ) : null}
                </>
              )}
            </div>

            {/* Totals */}
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">الإجمالي الفرعي</span>
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
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-sm font-semibold text-white">الإجمالي</span>
                <span className="font-display text-2xl font-bold text-white" dir="ltr">
                  {currency}
                  {total}
                </span>
              </div>
            </div>

            {/* Green checkout button */}
            <Link
              href="/checkout"
              onClick={closeCart}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-display text-base font-bold text-white shadow-[0_8px_30px_rgba(80,141,78,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-light"
            >
              الدفع
            </Link>
          </div>
        ) : null}
      </aside>
    </>
  );
}
