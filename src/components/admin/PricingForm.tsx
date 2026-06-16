"use client";

import { useState, useTransition } from "react";
import { updatePricing } from "@/lib/admin/actions";

const inputCls =
  "w-full rounded-lg border border-white/10 bg-elevated px-3 py-2 text-sm text-white focus:border-primary-light/50 focus:outline-none";

export function PricingForm({
  monthly,
  yearly,
  discount,
}: {
  monthly: number;
  yearly: number;
  discount: number;
}) {
  const [m, setM] = useState(String(monthly));
  const [y, setY] = useState(String(yearly));
  const [d, setD] = useState(String(discount));
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await updatePricing({
        monthly_usd: Number(m),
        yearly_usd: Number(y),
        yearly_discount_pct: Number(d),
      });
      setMsg(res.error ?? "تم الحفظ ✓");
    });
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-white">أسعار اشتراك AdaaX</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="text-sm text-muted">
          شهري ($)
          <input className={`${inputCls} mt-1`} type="number" value={m} onChange={(e) => setM(e.target.value)} dir="ltr" />
        </label>
        <label className="text-sm text-muted">
          سنوي ($)
          <input className={`${inputCls} mt-1`} type="number" value={y} onChange={(e) => setY(e.target.value)} dir="ltr" />
        </label>
        <label className="text-sm text-muted">
          خصم السنوي (%)
          <input className={`${inputCls} mt-1`} type="number" value={d} onChange={(e) => setD(e.target.value)} dir="ltr" />
        </label>
      </div>
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={save}
          disabled={pending}
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
        >
          {pending ? "..." : "حفظ"}
        </button>
        {msg && <span className="text-sm text-muted">{msg}</span>}
      </div>
    </div>
  );
}
