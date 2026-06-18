"use client";

import { useEffect, useRef, useState } from "react";
import { LockIcon } from "@/components/ui/icons";
import type { CartItem } from "@/lib/cart/CartContext";

/** Minimal typings for the PayPal JS SDK surface we use. */
type OrderActions = {
  order: {
    create: (payload: Record<string, unknown>) => Promise<string>;
    capture: () => Promise<unknown>;
  };
};
type ButtonsConfig = {
  style?: Record<string, string | number>;
  createOrder: (data: unknown, actions: OrderActions) => Promise<string>;
  onApprove: (data: unknown, actions: OrderActions) => Promise<void>;
  onError?: (err: unknown) => void;
  onCancel?: () => void;
};
type PayPalNamespace = {
  Buttons: (cfg: ButtonsConfig) => { render: (el: HTMLElement) => Promise<void> };
};

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const CURRENCY = "USD";

function getPayPal(): PayPalNamespace | undefined {
  return (window as unknown as { paypal?: PayPalNamespace }).paypal;
}

let sdkPromise: Promise<void> | null = null;
function loadSdk(clientId: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (getPayPal()) return Promise.resolve();
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    const params = new URLSearchParams({
      "client-id": clientId,
      currency: CURRENCY,
      intent: "capture",
      components: "buttons",
      locale: "ar_EG",
    });
    script.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
    script.onload = () => resolve();
    script.onerror = () => {
      sdkPromise = null;
      reject(new Error("PayPal SDK failed to load"));
    };
    document.head.appendChild(script);
  });
  return sdkPromise;
}

type Status = "idle" | "loading" | "ready" | "error";

export function PayPalCheckout({
  enabled,
  items,
  total,
  currency,
  couponId,
  email,
  name,
  phone,
  onSuccess,
}: {
  enabled: boolean;
  items: CartItem[];
  total: number;
  currency: string;
  couponId?: string;
  email: string;
  name: string;
  phone: string;
  onSuccess: (orderId?: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("idle");

  // Keep latest values for the SDK callbacks without re-mounting the buttons.
  const dataRef = useRef({ items, total, couponId, email, name, phone });
  dataRef.current = { items, total, couponId, email, name, phone };
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;

  // Record the paid order server-side (verifies with PayPal when configured),
  // so every payment lands in orders + contacts. Falls back gracefully.
  async function recordOrder(paypalOrderId?: string): Promise<string | undefined> {
    const d = dataRef.current;
    try {
      const res = await fetch("/api/checkout/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paypalOrderId,
          items: d.items,
          amount: d.total,
          currency,
          couponId: d.couponId,
          email: d.email,
          name: d.name,
          phone: d.phone,
        }),
      });
      if (!res.ok) return undefined;
      const { orderId } = await res.json();
      return orderId;
    } catch {
      return undefined;
    }
  }

  // 🧪 TEST-ONLY — remove with NEXT_PUBLIC_ENABLE_TEST_PAY before going live.
  const testPay = process.env.NEXT_PUBLIC_ENABLE_TEST_PAY === "true";
  const [testPending, setTestPending] = useState(false);
  async function handleTestPay() {
    setTestPending(true);
    try {
      const res = await fetch("/api/dev/test-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "order",
          items: dataRef.current.items,
          amount: dataRef.current.total,
          currency,
          couponId: dataRef.current.couponId,
          email: dataRef.current.email,
          name: dataRef.current.name,
          phone: dataRef.current.phone,
        }),
      });
      if (!res.ok) throw new Error();
      const { orderId } = await res.json();
      successRef.current(orderId);
    } catch {
      setTestPending(false);
    }
  }

  useEffect(() => {
    if (!CLIENT_ID || !enabled) return;
    let cancelled = false;
    setStatus("loading");

    loadSdk(CLIENT_ID)
      .then(() => {
        if (cancelled) return;
        const paypal = getPayPal();
        const el = containerRef.current;
        if (!paypal || !el) {
          setStatus("error");
          return;
        }
        el.innerHTML = "";
        paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", shape: "pill", label: "pay" },
            createOrder: (_data, actions) => {
              const { items: it, total: amt } = dataRef.current;
              return actions.order.create({
                intent: "CAPTURE",
                purchase_units: [
                  {
                    amount: {
                      currency_code: CURRENCY,
                      value: amt.toFixed(2),
                      breakdown: {
                        item_total: { currency_code: CURRENCY, value: amt.toFixed(2) },
                      },
                    },
                    items: it.map((line) => ({
                      name: line.name.slice(0, 127),
                      quantity: String(line.qty),
                      unit_amount: { currency_code: CURRENCY, value: line.price.toFixed(2) },
                    })),
                  },
                ],
              });
            },
            onApprove: async (data, actions) => {
              await actions.order.capture();
              const paypalOrderId = (data as { orderID?: string }).orderID;
              const orderId = await recordOrder(paypalOrderId);
              successRef.current(orderId);
            },
            onError: () => setStatus("error"),
          })
          .render(el)
          .then(() => {
            if (!cancelled) setStatus("ready");
          })
          .catch(() => {
            if (!cancelled) setStatus("error");
          });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  // No Client ID yet → graceful, ready-to-activate placeholder.
  if (!CLIENT_ID) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.04]">
          <LockIcon className="h-5 w-5 text-primary-light" />
        </div>
        <p className="font-display text-sm font-bold text-white">الدفع الآمن عبر PayPal</p>
        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-subtle">
          بوابة الدفع جاهزة للربط. ستظهر أزرار الدفع (PayPal والبطاقات) هنا بمجرد تفعيل الحساب.
        </p>
        <p className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2 text-[11px] text-faint" dir="ltr">
          set <code className="text-primary-light">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to activate
        </p>
      </div>
    );
  }

  return (
    <div>
      {!enabled ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-center text-sm text-subtle">
          أكمل بياناتك ووافق على الشروط لإظهار خيارات الدفع.
        </div>
      ) : (
        <>
          <div ref={containerRef} className={status === "ready" ? "" : "min-h-[3rem]"} />
          {status === "loading" ? (
            <p className="text-center text-sm text-subtle">جارٍ تحميل بوابة الدفع…</p>
          ) : null}
          {status === "error" ? (
            <p className="text-center text-sm text-red-400">
              تعذّر تحميل بوابة الدفع. تأكد من اتصالك وحاول مرة أخرى.
            </p>
          ) : null}
        </>
      )}
      {/* 🧪 TEST-ONLY — remove with NEXT_PUBLIC_ENABLE_TEST_PAY before going live */}
      {testPay && enabled && (
        <div className="mt-4 border-t border-dashed border-white/10 pt-4">
          <button
            type="button"
            onClick={handleTestPay}
            disabled={testPending}
            className="w-full rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-50"
          >
            🧪 تجربة الدفع (محاكاة طلب ناجح)
          </button>
          <p className="mt-1.5 text-center text-[11px] text-faint">
            وضع تجريبي — بيسجّل الطلب بدون دفع فعلي
          </p>
        </div>
      )}

      <p className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-faint">
        <LockIcon className="h-3 w-3" />
        دفع آمن ومشفّر عبر PayPal — تقدر تدفع ببطاقتك أو حساب PayPal.
      </p>
    </div>
  );
}
