"use client";

import { useState, useTransition } from "react";
import {
  extendSubscription,
  adminCancelSubscription,
  rebindDevice,
} from "@/lib/admin/actions";

export type AdminSubscription = {
  id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  paypal_subscription_id: string | null;
  profiles: { email: string | null; display_name: string | null } | null;
  license_devices: { id: string; hwid_hash: string; bound_at: string }[];
};

function isActive(s: AdminSubscription) {
  if (s.status === "expired") return false;
  return Boolean(s.current_period_end && new Date(s.current_period_end) > new Date());
}

export function SubscriptionsTable({ subscriptions }: { subscriptions: AdminSubscription[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6">
      <h2 className="mb-4 font-display text-lg font-bold text-white">
        الاشتراكات ({subscriptions.length})
      </h2>
      {subscriptions.length === 0 ? (
        <p className="text-sm text-muted">لا توجد اشتراكات.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {subscriptions.map((s) => {
            const device = s.license_devices?.[0];
            const active = isActive(s);
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-white" dir="ltr">
                      {s.profiles?.email ?? "—"}
                    </span>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-muted">
                      {s.plan === "yearly" ? "سنوي" : "شهري"}
                    </span>
                    <span
                      className={
                        active
                          ? "rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary-light"
                          : "rounded-full bg-white/5 px-2 py-0.5 text-xs text-faint"
                      }
                    >
                      {active ? "نشط" : "منتهي"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-faint">
                    {s.current_period_end
                      ? `حتى ${s.current_period_end.slice(0, 10)}`
                      : "بدون تاريخ"}
                    {device
                      ? ` · جهاز مربوط (${device.hwid_hash.slice(0, 8)}…)`
                      : " · لا يوجد جهاز مربوط"}
                  </p>
                </div>
                <SubRowActions sub={s} hasDevice={Boolean(device)} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function SubRowActions({ sub, hasDevice }: { sub: AdminSubscription; hasDevice: boolean }) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  function run(fn: () => Promise<{ ok?: true; error?: string }>) {
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      if (res.error) setMsg(res.error);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <button
          disabled={pending}
          onClick={() => run(() => extendSubscription(sub.id, 30))}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-white disabled:opacity-50"
        >
          +30 يوم
        </button>
        <button
          disabled={pending || !hasDevice}
          onClick={() => run(() => rebindDevice(sub.id))}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-white disabled:opacity-40"
        >
          فك ربط الجهاز
        </button>
        <button
          disabled={pending}
          onClick={() => {
            if (window.confirm("إلغاء الاشتراك؟")) run(() => adminCancelSubscription(sub.id));
          }}
          className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-red-300/80 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
        >
          إلغاء
        </button>
      </div>
      {msg && <p className="text-xs text-red-300">{msg}</p>}
    </div>
  );
}
