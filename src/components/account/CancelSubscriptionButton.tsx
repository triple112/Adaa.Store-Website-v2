"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { cancelSubscription } from "@/lib/subscriptions/actions";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    if (!window.confirm("متأكد من إيقاف التجديد؟ هتفضل مشترك لحد نهاية الفترة الحالية.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await cancelSubscription();
      if (res.error) {
        setError("تعذّر الإلغاء، حاول لاحقاً أو تواصل معنا.");
      } else {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleCancel}
        disabled={pending}
        className="rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-muted transition-colors hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
      >
        {pending ? "..." : "إيقاف التجديد"}
      </button>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}
