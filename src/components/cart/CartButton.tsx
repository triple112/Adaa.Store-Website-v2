"use client";

import { ShoppingCartIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart/CartContext";

export function CartButton() {
  const { count, subtotal, currency, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={`السلة — ${count} عنصر`}
      className="relative flex h-9 items-center gap-2 rounded-full px-2.5 text-muted transition-colors hover:bg-white/5 hover:text-white"
    >
      <span className="relative flex items-center">
        <ShoppingCartIcon className="h-[18px] w-[18px]" />
        {count > 0 ? (
          <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-white">
            {count}
          </span>
        ) : null}
      </span>
      {subtotal > 0 ? (
        <span className="hidden text-sm font-bold text-white sm:inline" dir="ltr">
          {currency}
          {subtotal}
        </span>
      ) : null}
    </button>
  );
}
