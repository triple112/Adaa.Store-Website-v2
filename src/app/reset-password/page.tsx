"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-elevated px-4 py-3 text-sm text-white placeholder:text-faint transition-colors focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setTimeout(() => {
        router.push("/account");
        router.refresh();
      }, 1200);
    } catch {
      setError("تعذّر تحديث كلمة المرور — قد يكون الرابط منتهي. اطلب رابطاً جديداً.");
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center px-4 pt-28 pb-16">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-7 shadow-[0_8px_40px_rgba(0,0,0,0.45)] sm:p-9">
        <h1 className="font-display text-2xl font-bold text-white">كلمة مرور جديدة</h1>
        <p className="mt-2 text-sm text-muted">اكتب كلمة المرور الجديدة لحسابك.</p>

        {done ? (
          <p className="mt-6 rounded-lg border border-primary/30 bg-primary/10 px-3 py-3 text-sm text-primary-light">
            تم تحديث كلمة المرور ✅ — جاري تحويلك لحسابك...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
            <input
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="كلمة المرور الجديدة"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
            {error && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#161616] px-6 py-3 font-display font-bold text-white border border-white/10 border-b-2 border-b-primary transition-all hover:border-primary-light disabled:opacity-50"
            >
              {loading ? "..." : "تحديث كلمة المرور"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
