"use client";

import { PlusIcon } from "@/components/ui/icons";
import { useCart } from "@/lib/cart/CartContext";
import type { ServicePriceTier } from "@/data/services";

/** Renders each price tier as a separately add-to-cart-able line item. */
export function TieredAddToCart({
  baseId,
  baseName,
  image,
  currency,
  tiers,
  href,
}: {
  baseId: string;
  baseName: string;
  image: string;
  currency: string;
  tiers: ServicePriceTier[];
  href: string;
}) {
  const { addItem, openCart } = useCart();

  return (
    <div className="mt-6 flex flex-col gap-2.5">
      {tiers.map((tier) => (
        <div
          key={tier.label}
          className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
        >
          <span className="text-sm font-semibold text-muted">{tier.label}</span>
          <div className="flex items-center gap-3">
            <span className="font-display text-2xl font-bold text-white" dir="ltr">
              {currency}
              {tier.price}
            </span>
            <button
              type="button"
              onClick={() => {
                addItem({
                  id: `${baseId}::${tier.label}`,
                  name: `${baseName} — ${tier.label}`,
                  image,
                  price: tier.price,
                  currency,
                  href,
                });
                openCart();
              }}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-bold text-white transition-colors hover:bg-primary-light"
            >
              <PlusIcon className="h-4 w-4" />
              أضف
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
