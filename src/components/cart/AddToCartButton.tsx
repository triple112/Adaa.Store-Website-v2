"use client";

import { Button } from "@/components/ui/Button";
import { ShoppingCartIcon } from "@/components/ui/icons";
import { useCart, type CartItem } from "@/lib/cart/CartContext";

type Variant = "primary" | "outline" | "ghost";
type Size = "md" | "lg";

export function AddToCartButton({
  item,
  label = "أضف إلى السلة",
  variant = "primary",
  size = "md",
  className,
  withIcon = true,
}: {
  item: Omit<CartItem, "qty">;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  withIcon?: boolean;
}) {
  const { addItem, openCart } = useCart();

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => {
        addItem(item);
        openCart();
      }}
    >
      {withIcon ? <ShoppingCartIcon className="h-[18px] w-[18px]" /> : null}
      {label}
    </Button>
  );
}
