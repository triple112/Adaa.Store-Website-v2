"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { approveDeviceLink, type ApproveReason } from "@/lib/license/actions";
import { formatDate } from "@/lib/site-config";

const REASON_MESSAGE: Record<ApproveReason, string> = {
  invalid_code: "الكود غير صحيح أو غير موجود.",
  expired: "انتهت صلاحية الكود. ارجع لبرنامج AdaaX واطلب رمزًا جديدًا.",
  already_used: "هذا الرمز استُخدم بالفعل.",
  no_subscription: "لا يوجد اشتراك نشط على حسابك.",
  another_device: "اشتراكك مربوط بجهاز آخر بالفعل. تواصل مع الدعم لتغيير الجهاز.",
  banned: "حسابك موقوف. تواصل مع الدعم.",
  db_error: "حدث خطأ غير متوقع. حاول مرة أخرى.",
};

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-7 sm:p-8">
      {children}
    </div>
  );
}

export function LinkApproveClient({
  code,
  displayName,
  hasAccess,
  isAdmin,
  planLabel,
  periodEnd,
}: {
  code: string;
  displayName: string;
  hasAccess: boolean;
  isAdmin: boolean;
  planLabel: string | null;
  periodEnd: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const res = await approveDeviceLink(code);
      if (res.ok) setDone(true);
      else setError(REASON_MESSAGE[res.reason ?? "db_error"]);
    });
  }

  // No code → app must open this page itself.
  if (!code) {
    return (
      <Card>
        <h1 className="font-display text-2xl font-bold text-white">ربط جهاز AdaaX</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          افتح هذه الصفحة من داخل برنامج AdaaX بالضغط على «تفعيل الاشتراك». البرنامج
          سيفتح المتصفح تلقائيًا برمز الربط جاهزًا.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-flex items-center rounded-xl border border-white/10 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:border-primary-light"
        >
          حسابي
        </Link>
      </Card>
    );
  }

  // Success.
  if (done) {
    return (
      <Card>
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 text-3xl">
            ✓
          </div>
          <h1 className="mt-4 font-display text-2xl font-bold text-white">تم ربط جهازك</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            ارجع الآن إلى برنامج AdaaX — هيتفعّل تلقائيًا خلال ثوانٍ. تقدر تقفل هذه الصفحة.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h1 className="font-display text-2xl font-bold text-white">ربط جهاز AdaaX</h1>
      <p className="mt-2 text-sm text-muted">
        مسجّل دخول باسم <span className="font-semibold text-white">{displayName}</span>
      </p>

      {/* رمز الربط */}
      <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-elevated/50 p-4 text-center">
        <p className="text-xs text-faint">رمز الربط</p>
        <p className="mt-1 font-mono text-2xl font-bold tracking-[0.3em] text-primary-light">
          {code}
        </p>
      </div>

      {/* حالة الاشتراك */}
      <div className="mt-5 rounded-xl border border-white/10 bg-elevated/40 p-4">
        {isAdmin ? (
          <p className="text-sm font-semibold text-primary-light">
            حساب أدمن — مرخّص دائمًا ✦
          </p>
        ) : hasAccess ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-white">
              اشتراك {planLabel} نشط
            </span>
            <span className="text-xs text-faint">حتى {formatDate(periodEnd)}</span>
          </div>
        ) : (
          <p className="text-sm text-muted">لا يوجد اشتراك نشط على حسابك.</p>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {hasAccess ? (
        <button
          type="button"
          onClick={handleApprove}
          disabled={pending}
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#161616] px-5 py-3 text-sm font-bold text-white border border-white/10 border-b-2 border-b-primary transition-all hover:border-primary-light disabled:opacity-50"
        >
          {pending ? "جارٍ الربط..." : "ربط الجهاز"}
        </button>
      ) : (
        <Link
          href="/adaax"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#161616] px-5 py-3 text-sm font-bold text-white border border-white/10 border-b-2 border-b-primary transition-all hover:border-primary-light"
        >
          اشترك الآن
        </Link>
      )}

      <p className="mt-4 text-center text-xs text-faint">
        جهاز واحد لكل اشتراك. لتغيير الجهاز لاحقًا تواصل مع الدعم.
      </p>
    </Card>
  );
}
