"use client";

import { useState, useTransition } from "react";
import {
  createCoupon,
  updateCoupon,
  toggleCoupon,
  deleteCoupon,
  type CouponInput,
} from "@/lib/admin/actions";

export type Coupon = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  min_amount: number;
  max_uses: number | null;
  used_count: number;
  applies_to: string;
  active: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

const APPLIES_LABEL: Record<string, string> = {
  all: "الكل",
  packages: "الباقات",
  subscription: "الاشتراك",
};

const emptyForm = {
  code: "",
  type: "percent" as "percent" | "fixed",
  value: "",
  min_amount: "",
  max_uses: "",
  applies_to: "all" as "all" | "packages" | "subscription",
  expires_at: "",
  active: true,
};

const inputCls =
  "w-full rounded-lg border border-white/10 bg-elevated px-3 py-2 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none";

export function CouponManager({ coupons }: { coupons: Coupon[] }) {
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
  }

  function startEdit(c: Coupon) {
    setEditingId(c.id);
    setError(null);
    setForm({
      code: c.code,
      type: c.type,
      value: String(c.value),
      min_amount: c.min_amount ? String(c.min_amount) : "",
      max_uses: c.max_uses != null ? String(c.max_uses) : "",
      applies_to: (c.applies_to as typeof emptyForm.applies_to) ?? "all",
      expires_at: c.expires_at ? c.expires_at.slice(0, 10) : "",
      active: c.active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit() {
    setError(null);
    const payload: CouponInput = {
      code: form.code,
      type: form.type,
      value: Number(form.value),
      min_amount: Number(form.min_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      applies_to: form.applies_to,
      starts_at: null,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      active: form.active,
    };
    if (!payload.code.trim() || !payload.value || payload.value <= 0) {
      setError("اكتب كود وقيمة صحيحة.");
      return;
    }
    startTransition(async () => {
      const res = editingId
        ? await updateCoupon(editingId, payload)
        : await createCoupon(payload);
      if (res.error) setError(res.error);
      else reset();
    });
  }

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-2xl border border-white/10 bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-white">
          {editingId ? "تعديل كوبون" : "كوبون جديد"}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <input
            className={inputCls}
            placeholder="الكود (SAVE20)"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            dir="ltr"
          />
          <select
            className={inputCls}
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as "percent" | "fixed" })}
          >
            <option value="percent">نسبة %</option>
            <option value="fixed">مبلغ ثابت $</option>
          </select>
          <input
            className={inputCls}
            type="number"
            placeholder={form.type === "percent" ? "القيمة (20)" : "القيمة ($)"}
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            dir="ltr"
          />
          <select
            className={inputCls}
            value={form.applies_to}
            onChange={(e) =>
              setForm({ ...form, applies_to: e.target.value as typeof emptyForm.applies_to })
            }
          >
            <option value="all">الكل</option>
            <option value="packages">الباقات فقط</option>
            <option value="subscription">الاشتراك فقط</option>
          </select>
          <input
            className={inputCls}
            type="number"
            placeholder="حد أدنى للمبلغ ($)"
            value={form.min_amount}
            onChange={(e) => setForm({ ...form, min_amount: e.target.value })}
            dir="ltr"
          />
          <input
            className={inputCls}
            type="number"
            placeholder="حد الاستخدام (فارغ=∞)"
            value={form.max_uses}
            onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
            dir="ltr"
          />
          <label className="flex items-center gap-2 text-sm text-muted">
            تاريخ الانتهاء
            <input
              className={inputCls}
              type="date"
              value={form.expires_at}
              onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
              dir="ltr"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            مفعّل
          </label>
        </div>

        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <div className="mt-4 flex gap-2">
          <button
            onClick={submit}
            disabled={pending}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {pending ? "..." : editingId ? "حفظ التعديل" : "إنشاء الكوبون"}
          </button>
          {editingId && (
            <button
              onClick={reset}
              className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-muted hover:text-white"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/10 bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-white">
          الكوبونات ({coupons.length})
        </h2>
        {coupons.length === 0 ? (
          <p className="text-sm text-muted">لا توجد كوبونات بعد.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {coupons.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white" dir="ltr">
                      {c.code}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary-light">
                      {c.type === "percent" ? `${c.value}%` : `$${c.value}`}
                    </span>
                    {!c.active && (
                      <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-faint">
                        معطّل
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-faint">
                    {APPLIES_LABEL[c.applies_to] ?? c.applies_to} · استُخدم {c.used_count}
                    {c.max_uses != null ? `/${c.max_uses}` : ""}
                    {c.expires_at ? ` · ينتهي ${c.expires_at.slice(0, 10)}` : ""}
                    {c.min_amount ? ` · حد أدنى $${c.min_amount}` : ""}
                  </p>
                </div>
                <CouponRowActions coupon={c} onEdit={() => startEdit(c)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function CouponRowActions({ coupon, onEdit }: { coupon: Coupon; onEdit: () => void }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onEdit}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-white"
      >
        تعديل
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(async () => void (await toggleCoupon(coupon.id, !coupon.active)))}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-white disabled:opacity-50"
      >
        {coupon.active ? "تعطيل" : "تفعيل"}
      </button>
      <button
        disabled={pending}
        onClick={() => {
          if (window.confirm(`حذف الكوبون ${coupon.code}؟`)) {
            startTransition(async () => void (await deleteCoupon(coupon.id)));
          }
        }}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-red-300/80 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
      >
        حذف
      </button>
    </div>
  );
}
