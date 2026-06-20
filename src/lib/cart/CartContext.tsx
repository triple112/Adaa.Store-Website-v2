"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type CartItem = {
  /** Unique line key. For variant items use `${productId}::${variant}`. */
  id: string;
  name: string;
  image: string;
  price: number;
  currency: string;
  qty: number;
  /** Link back to the product page. */
  href?: string;
};

type AddPayload = Omit<CartItem, "qty">;

/** A coupon that has been validated server-side against the current subtotal. */
export type AppliedCoupon = {
  code: string;
  couponId: string;
  discount: number;
  finalAmount: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  count: number;
  subtotal: number;
  currency: string;
  addItem: (item: AddPayload, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
  // Coupon (shared between the cart drawer and the checkout page)
  coupon: AppliedCoupon | null;
  couponLoading: boolean;
  couponError: string | null;
  /** The discount currently applied (0 when no valid coupon). */
  discount: number;
  /** subtotal − discount, never below 0. */
  total: number;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
};

const CartContext = createContext<CartState | null>(null);
const STORAGE_KEY = "adaa-cart-v1";
const COUPON_KEY = "adaa-coupon-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Coupon: we persist only the *code*; the discount is always re-validated
  // server-side against the live subtotal (so it can't go stale or be forged).
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Load persisted cart + coupon once on mount (client only).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        if (Array.isArray(parsed)) setItems(parsed);
      }
      const savedCode = localStorage.getItem(COUPON_KEY);
      if (savedCode) setCouponCode(savedCode);
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
  }, []);

  // Persist cart on change (after initial hydration to avoid clobbering).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: AddPayload, qty = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === item.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + qty };
        return next;
      }
      return [...prev, { ...item, qty }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, qty: Math.max(1, qty) } : p))
        .filter((p) => p.qty > 0),
    );
  }, []);

  const subtotal = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.qty, 0),
    [items],
  );
  const count = useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);
  const currency = items[0]?.currency ?? "$";

  // ── Coupon validation ──────────────────────────────────────────────────
  // Re-validates whenever the code or subtotal changes, so the discount always
  // reflects the live cart (e.g. quantity edits) and stale/expired codes drop
  // off automatically. A sequence token guards against out-of-order responses.
  const reqSeq = useRef(0);

  useEffect(() => {
    if (!hydrated) return;

    const code = couponCode?.trim();
    if (!code || items.length === 0 || subtotal <= 0) {
      setCoupon(null);
      setCouponLoading(false);
      return;
    }

    const seq = ++reqSeq.current;
    setCouponLoading(true);
    setCouponError(null);

    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, amount: subtotal, appliesTo: "packages" }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (seq !== reqSeq.current) return; // a newer request superseded this one
        if (data.valid) {
          setCoupon({
            code,
            couponId: data.couponId,
            discount: data.discount,
            finalAmount: data.finalAmount,
          });
          setCouponError(null);
          // Persist only AFTER it validates, so an invalid code never sticks.
          try {
            localStorage.setItem(COUPON_KEY, code);
          } catch {
            /* ignore */
          }
        } else {
          setCoupon(null);
          setCouponError(data.message ?? "كود غير صالح");
          // A bad code must not survive a refresh.
          try {
            localStorage.removeItem(COUPON_KEY);
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        if (seq !== reqSeq.current) return;
        setCoupon(null);
        setCouponError("تعذّر التحقق، حاول تاني.");
      })
      .finally(() => {
        if (seq === reqSeq.current) setCouponLoading(false);
      });
  }, [couponCode, subtotal, items.length, hydrated]);

  const applyCoupon = useCallback(async (code: string) => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setCouponError(null);
    // Trigger validation; persistence happens in the effect only when it's valid.
    setCouponCode(trimmed);
  }, []);

  const removeCoupon = useCallback(() => {
    setCouponCode(null);
    setCoupon(null);
    setCouponError(null);
    setCouponLoading(false);
    try {
      localStorage.removeItem(COUPON_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    removeCoupon();
  }, [removeCoupon]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const discount = coupon?.discount ?? 0;
  const total = Math.max(0, subtotal - discount);

  const value = useMemo<CartState>(
    () => ({
      items,
      isOpen,
      count,
      subtotal,
      currency,
      addItem,
      removeItem,
      setQty,
      clear,
      openCart,
      closeCart,
      coupon,
      couponLoading,
      couponError,
      discount,
      total,
      applyCoupon,
      removeCoupon,
    }),
    [
      items,
      isOpen,
      count,
      subtotal,
      currency,
      addItem,
      removeItem,
      setQty,
      clear,
      openCart,
      closeCart,
      coupon,
      couponLoading,
      couponError,
      discount,
      total,
      applyCoupon,
      removeCoupon,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartState {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
