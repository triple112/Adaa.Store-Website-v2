"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
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
  const { items, isOpen, closeCart, setQty, removeItem, subtotal, currency, count } = useCart();
  const [discount, setDiscount] = useState("");

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
          "fixed inset-0 z-[65] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
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
          "fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col border-r border-white/10 bg-bg shadow-[0_0_60px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingCartIcon className="h-5 w-5 text-primary-light" />
            <h2 className="font-display text-lg font-bold text-white">سلة المشتريات</h2>
            {count > 0 ? (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-subtle">
                {count}
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={closeCart}
            aria-label="إغلاق السلة"
            className="flex h-9 w-9 items-center justify-center rounded-full text-subtle transition-colors hover:bg-white/5 hover:text-white"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Items / empty state */}
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/[0.04]">
              <ShoppingCartIcon className="h-7 w-7 text-faint" />
            </div>
            <div>
              <p className="font-display text-base font-bold text-white">سلتك فارغة</p>
              <p className="mt-1 text-sm text-subtle">أضف خدمة لتبدأ طلبك.</p>
            </div>
            <Link
              href="/services"
              onClick={closeCart}
              className="rounded-xl border border-primary/40 px-5 py-2.5 text-sm font-semibold text-primary-light transition-colors hover:bg-primary/10"
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
                  className="flex gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-white/[0.06]">
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
                        className="shrink-0 text-faint transition-colors hover:text-red-400"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-1 rounded-lg border border-white/10 p-0.5">
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label="إنقاص الكمية"
                          className="flex h-6 w-6 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/10 hover:text-white"
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
                          className="flex h-6 w-6 items-center justify-center rounded-md text-subtle transition-colors hover:bg-white/10 hover:text-white"
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
          <div className="border-t border-white/10 px-5 py-4">
            {/* Discount code (UI only for now) */}
            <div className="mb-4">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-subtle">
                <TagIcon className="h-3.5 w-3.5" />
                كود الخصم
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  placeholder="أدخل الكود"
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
                />
                <button
                  type="button"
                  disabled
                  title="أكواد الخصم قريباً"
                  className="shrink-0 cursor-not-allowed rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-subtle opacity-50"
                >
                  تطبيق
                </button>
              </div>
              <p className="mt-1.5 text-[11px] text-faint">أكواد الخصم هتتفعّل قريباً.</p>
            </div>

            {/* Subtotal */}
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-subtle">الإجمالي</span>
              <span className="font-display text-2xl font-bold text-white" dir="ltr">
                {currency}
                {subtotal}
              </span>
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
