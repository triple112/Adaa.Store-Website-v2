"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    paypal?: any;
  }
}

type Plan = "monthly" | "yearly";

export function SubscribeButtons({
  clientId,
  planMonthly,
  planYearly,
  monthlyUsd,
  yearlyUsd,
  yearlyDiscountPct,
  isLoggedIn,
}: {
  clientId: string;
  planMonthly: string;
  planYearly: string;
  monthlyUsd: number;
  yearlyUsd: number;
  yearlyDiscountPct: number;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan>("monthly");
  // Initialise from the already-loaded SDK (avoids a synchronous setState in the effect).
  const [sdkReady, setSdkReady] = useState<boolean>(
    () => typeof window !== "undefined" && Boolean(window.paypal),
  );
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const planId = plan === "monthly" ? planMonthly : planYearly;
  const configured = Boolean(clientId && planMonthly && planYearly);
  const testPay = process.env.NEXT_PUBLIC_ENABLE_TEST_PAY === "true";

  // Load the PayPal JS SDK (subscriptions mode) if it isn't already present.
  useEffect(() => {
    if (!configured || !isLoggedIn || sdkReady || window.paypal) return;
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setError("تعذّر تحميل PayPal، تأكد من اتصالك.");
    document.body.appendChild(script);
  }, [clientId, configured, isLoggedIn, sdkReady]);

  // (Re)render the PayPal buttons whenever the chosen plan changes.
  useEffect(() => {
    if (!sdkReady || !isLoggedIn || !planId || !containerRef.current || !window.paypal) {
      return;
    }
    const container = containerRef.current;
    container.innerHTML = "";

    const buttons = window.paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "pill", label: "subscribe" },
      createSubscription: (_data: unknown, actions: any) =>
        actions.subscription.create({ plan_id: planId }),
      onApprove: async (data: { subscriptionID?: string }) => {
        setProcessing(true);
        setError(null);
        try {
          const res = await fetch("/api/paypal/subscription/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ subscriptionId: data.subscriptionID }),
          });
          if (!res.ok) throw new Error();
          const { orderId } = await res.json();
          router.push(orderId ? `/order/${orderId}` : "/account");
          router.refresh();
        } catch {
          setError("تم الدفع لكن تعذّر تفعيل الاشتراك تلقائياً — تواصل معنا وهنفعّله.");
          setProcessing(false);
        }
      },
      onError: () => setError("حصل خطأ أثناء الدفع، حاول مرة أخرى."),
    });

    try {
      buttons.render(container);
    } catch {
      /* ignore render race */
    }

    return () => {
      try {
        buttons.close();
      } catch {
        /* ignore */
      }
    };
  }, [sdkReady, isLoggedIn, planId, router]);

  async function handleTestPay() {
    setProcessing(true);
    setError(null);
    try {
      const res = await fetch("/api/dev/test-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "subscription", plan }),
      });
      if (!res.ok) throw new Error();
      const { orderId } = await res.json();
      router.push(orderId ? `/order/${orderId}` : "/account");
      router.refresh();
    } catch {
      setError("فشلت تجربة الدفع، حاول مرة أخرى.");
      setProcessing(false);
    }
  }

  return (
    <div className="w-full">
      {/* Plan toggle */}
      <div className="mx-auto mb-6 flex w-full max-w-xs rounded-full border border-white/10 bg-elevated p-1">
        <PlanTab active={plan === "monthly"} onClick={() => setPlan("monthly")}>
          شهري · ${monthlyUsd}
        </PlanTab>
        <PlanTab active={plan === "yearly"} onClick={() => setPlan("yearly")}>
          سنوي · ${yearlyUsd}
          {yearlyDiscountPct > 0 && (
            <span className="mr-1 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary-light">
              -{yearlyDiscountPct}%
            </span>
          )}
        </PlanTab>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
          {error}
        </p>
      )}

      {!configured ? (
        <p className="rounded-xl border border-dashed border-white/10 bg-elevated/50 p-5 text-center text-sm text-muted">
          الدفع غير مفعّل بعد. (إعداد PayPal قيد التجهيز.)
        </p>
      ) : !isLoggedIn ? (
        <Link
          href="/login?redirect=/adaax"
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#161616] px-6 py-3 font-display font-bold text-white border border-white/10 border-b-2 border-b-primary transition-all hover:border-primary-light"
        >
          سجّل الدخول للاشتراك
        </Link>
      ) : processing ? (
        <p className="rounded-xl border border-primary/30 bg-primary/10 p-5 text-center text-sm text-primary-light">
          جاري تفعيل اشتراكك...
        </p>
      ) : (
        <div ref={containerRef} className="min-h-[3rem]" />
      )}

      {/* 🧪 TEST-ONLY — remove with NEXT_PUBLIC_ENABLE_TEST_PAY before going live */}
      {testPay && isLoggedIn && (
        <div className="mt-4 border-t border-dashed border-white/10 pt-4">
          <button
            type="button"
            onClick={handleTestPay}
            disabled={processing}
            className="w-full rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-bold text-amber-300 transition-colors hover:bg-amber-400/20 disabled:opacity-50"
          >
            🧪 تجربة الدفع ({plan === "monthly" ? "شهري" : "سنوي"})
          </button>
          <p className="mt-1.5 text-center text-[11px] text-faint">
            وضع تجريبي — بيفعّل الاشتراك بدون دفع فعلي
          </p>
        </div>
      )}
    </div>
  );
}

function PlanTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-2 text-sm font-semibold transition-colors",
        active ? "bg-primary text-white" : "text-muted hover:text-white",
      )}
    >
      {children}
    </button>
  );
}
