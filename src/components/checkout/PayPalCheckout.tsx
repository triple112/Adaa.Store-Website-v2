"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { LockIcon, ShieldCheckIcon } from "@/components/ui/icons";
import type { CartItem } from "@/lib/cart/CartContext";

/** Minimal typings for the PayPal JS SDK surface we use. */
type ButtonsInstance = { render: (el: HTMLElement) => Promise<void> };
type PayPalNamespace = {
  Buttons: (cfg: Record<string, unknown>) => ButtonsInstance;
};

const CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const CURRENCY = "USD";

/** Visa wordmark (no asset needed). */
function VisaMark() {
  return (
    <span className="select-none rounded bg-white px-1.5 py-0.5 text-[10px] font-extrabold italic leading-none text-[#1434CB]">
      VISA
    </span>
  );
}

/** Mastercard's two overlapping discs. */
function MastercardMark() {
  return (
    <span className="inline-flex items-center" aria-label="Mastercard">
      <span className="h-4 w-4 rounded-full bg-[#EB001B]" />
      <span className="-ml-1.5 h-4 w-4 rounded-full bg-[#F79E1B] mix-blend-screen" />
    </span>
  );
}

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
      // Show PayPal + the "Debit or Credit Card" guest button; hide financing clutter.
      "enable-funding": "card",
      "disable-funding": "paylater,credit",
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

type SdkStatus = "idle" | "loading" | "ready" | "error";

export function PayPalCheckout({
  enabled,
  items,
  total,
  currency,
  couponId,
  email,
  name,
  phone,
  country,
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
  country: string;
  onSuccess: (orderId?: string) => void;
}) {
  const [status, setStatus] = useState<SdkStatus>("idle");
  const [payError, setPayError] = useState<string | null>(null);

  const buttonsRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);

  // Keep latest values for the SDK callbacks without re-mounting the buttons.
  const dataRef = useRef({ items, total, couponId, email, name, phone, country });
  dataRef.current = { items, total, couponId, email, name, phone, country };
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;

  // Create the order server-side (server-authoritative amount + coupon).
  const createOrder = useCallback(async (): Promise<string> => {
    const d = dataRef.current;
    const res = await fetch("/api/paypal/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: d.items,
        couponId: d.couponId,
        // Pre-fills PayPal's hosted card/checkout form (best-effort).
        payer: { name: d.name, email: d.email, phone: d.phone, country: d.country },
      }),
    });
    if (!res.ok) throw new Error("create_failed");
    const { id } = (await res.json()) as { id?: string };
    if (!id) throw new Error("no_order_id");
    return id;
  }, []);

  // Capture + record server-side after the buyer approves.
  const onApprove = useCallback(async (data: { orderID?: string }) => {
    const d = dataRef.current;
    const res = await fetch("/api/paypal/orders/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderID: data.orderID,
        email: d.email,
        name: d.name,
        phone: d.phone,
      }),
    });
    if (!res.ok) throw new Error("capture_failed");
    const { orderId } = (await res.json()) as { orderId?: string };
    successRef.current(orderId);
  }, []);

  const onPayError = useCallback(() => {
    setPayError("تعذّر إتمام عملية الدفع. تأكد من بياناتك وحاول مرة أخرى.");
  }, []);

  // Load the SDK + render the buttons once the form is valid.
  useEffect(() => {
    if (!CLIENT_ID || !enabled) return;
    let cancelled = false;
    setStatus("loading");
    setPayError(null);
    renderedRef.current = false;

    loadSdk(CLIENT_ID)
      .then(() => {
        if (cancelled) return;
        const paypal = getPayPal();
        const el = buttonsRef.current;
        if (!paypal || !el) {
          setStatus("error");
          return;
        }
        if (renderedRef.current) return;
        renderedRef.current = true;
        el.innerHTML = "";
        paypal
          .Buttons({
            // Vertical layout stacks the PayPal button and the card button together.
            style: { layout: "vertical", color: "gold", shape: "pill", label: "paypal", height: 48 },
            createOrder,
            onApprove,
            onError: onPayError,
            onCancel: () => {},
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
  }, [enabled, createOrder, onApprove, onPayError]);

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

  // No Client ID yet → graceful, ready-to-activate placeholder.
  if (!CLIENT_ID) {
    return (
      <div className="rounded-2xl border border-dashed border-white/15 bg-black/20 p-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/[0.06]">
          <LockIcon className="h-5 w-5 text-primary-light" />
        </div>
        <p className="font-display text-sm font-bold text-white">الدفع الآمن عبر PayPal والبطاقات</p>
        <p className="mx-auto mt-1.5 max-w-xs text-xs leading-relaxed text-muted">
          بوابة الدفع جاهزة للربط. ستظهر أزرار الدفع (PayPal والبطاقة) هنا بمجرد تفعيل الحساب.
        </p>
        <p className="mt-3 rounded-lg bg-white/[0.04] px-3 py-2 text-[11px] text-faint" dir="ltr">
          set <code className="text-primary-light">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code> to activate
        </p>
      </div>
    );
  }

  if (!enabled) {
    return (
      <div className="rounded-2xl border border-white/12 bg-black/20 p-5 text-center text-sm text-muted">
        أكمل بياناتك ووافق على الشروط لإظهار خيارات الدفع.
      </div>
    );
  }

  return (
    <div>
      {/* Payment surface — dark inner panel (PayPal's own card window is white) */}
      <div className="rounded-2xl border border-white/12 bg-black/25 p-4 sm:p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-display text-sm font-bold text-white">اختر طريقة الدفع</span>
          <span className="flex items-center gap-1.5 rounded-full bg-primary/12 px-2.5 py-1 text-[11px] font-semibold text-primary-light">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            اتصال مشفّر
          </span>
        </div>

        {status === "loading" ? (
          <p className="py-6 text-center text-sm text-muted">جارٍ تحميل بوابة الدفع…</p>
        ) : null}
        {status === "error" ? (
          <p className="py-4 text-center text-sm text-red-400">
            تعذّر تحميل بوابة الدفع. تأكد من اتصالك وحاول مرة أخرى.
          </p>
        ) : null}

        {/* PayPal renders the buttons + (after tapping the card button) its own
            card form here. White surface so PayPal's fields, labels and text read
            clearly — this is the only light area, the rest stays dark. */}
        <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-4">
          <div ref={buttonsRef} className="min-h-[3rem]" />
        </div>

        {status === "ready" ? (
          <p className="mt-1 text-center text-[11px] leading-relaxed text-faint">
            اختر «بطاقة بنكية» للدفع ببطاقتك مباشرةً — هتُدخل بياناتك في نافذة PayPal الآمنة.
          </p>
        ) : null}

        {/* Accepted networks */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-white/10 pt-4 text-[11px] text-faint">
          <span>الكروت المقبولة</span>
          <VisaMark />
          <MastercardMark />
          <span className="text-white/20">·</span>
          <span className="flex items-center gap-1" dir="ltr">
            مدعوم من
            <span className="font-bold">
              <span className="text-[#0070ba]">Pay</span>
              <span className="text-[#009cde]">Pal</span>
            </span>
          </span>
        </div>
      </div>

      {payError ? <p className="mt-3 text-center text-sm text-red-400">{payError}</p> : null}

      {/* 🧪 TEST-ONLY — remove with NEXT_PUBLIC_ENABLE_TEST_PAY before going live */}
      {testPay && (
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
        دفع آمن ومشفّر — بياناتك تتعامل مباشرة مع PayPal ولا تُخزَّن عندنا.
      </p>
    </div>
  );
}
