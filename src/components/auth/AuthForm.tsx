"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { requestPasswordReset } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

const inputClass =
  "w-full rounded-xl border border-white/10 bg-elevated px-4 py-3 text-sm text-white placeholder:text-faint transition-colors focus:border-primary-light focus:outline-none focus:ring-1 focus:ring-primary-light";

export function AuthForm({ mode, redirectTo }: { mode: Mode; redirectTo: string }) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "discord" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isLogin = mode === "login";

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);

    try {
      const supabase = createClient();
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          },
        });
        if (error) throw error;
        // If email confirmation is enabled, there's no session yet.
        if (!data.session) {
          setNotice("تم إنشاء حسابك! راجع بريدك لتأكيد الإيميل ثم سجّل الدخول.");
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!email) {
      setError("اكتب بريدك الإلكتروني أولاً.");
      return;
    }
    setError(null);
    setNotice(null);
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setNotice("لو البريد مسجّل، هيوصلك رابط لإعادة تعيين كلمة المرور.");
    } catch {
      setNotice("لو البريد مسجّل، هيوصلك رابط لإعادة تعيين كلمة المرور.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOAuth(provider: "google" | "discord") {
    setError(null);
    setOauthLoading(provider);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) {
      setError(translateAuthError(error));
      setOauthLoading(null);
    }
    // On success the browser is redirected by Supabase.
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface p-7 shadow-[0_8px_40px_rgba(0,0,0,0.45)] sm:p-9">
      <h1 className="font-display text-2xl font-bold text-white">
        {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {isLogin
          ? "أهلاً بعودتك — ادخل لمتابعة اشتراكاتك ومشترياتك."
          : "أنشئ حسابك للوصول إلى اشتراك AdaaX وسجل مشترياتك."}
      </p>

      {/* OAuth */}
      <div className="mt-6 flex flex-col gap-3">
        <OAuthButton
          label="المتابعة عبر Google"
          loading={oauthLoading === "google"}
          disabled={oauthLoading !== null || loading}
          onClick={() => handleOAuth("google")}
          icon={<GoogleIcon />}
        />
        <OAuthButton
          label="المتابعة عبر Discord"
          loading={oauthLoading === "discord"}
          disabled={oauthLoading !== null || loading}
          onClick={() => handleOAuth("discord")}
          icon={<DiscordIcon />}
        />
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-faint">
        <span className="h-px flex-1 bg-white/10" />
        أو بالإيميل
        <span className="h-px flex-1 bg-white/10" />
      </div>

      {/* Email / password */}
      <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3">
        {!isLogin && (
          <input
            type="text"
            autoComplete="name"
            placeholder="الاسم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
          />
        )}
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="البريد الإلكتروني"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <input
          type="password"
          required
          minLength={6}
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder="كلمة المرور"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />

        {isLogin && (
          <button
            type="button"
            onClick={handleForgot}
            disabled={loading}
            className="-mt-1 self-start text-xs font-semibold text-muted transition-colors hover:text-primary-light disabled:opacity-50"
          >
            نسيت كلمة المرور؟
          </button>
        )}

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm text-primary-light">
            {notice}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || oauthLoading !== null}
          className={cn(
            "mt-1 inline-flex items-center justify-center rounded-xl bg-gradient-to-b from-[#2a2a2a] to-[#161616] px-6 py-3 font-display font-bold text-white",
            "border border-white/10 border-b-2 border-b-primary shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all",
            "hover:border-primary-light hover:shadow-[0_15px_45px_rgba(80,141,78,0.25)] disabled:opacity-50 disabled:pointer-events-none",
          )}
        >
          {loading ? "..." : isLogin ? "دخول" : "إنشاء الحساب"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        {isLogin ? "ليس لديك حساب؟ " : "لديك حساب بالفعل؟ "}
        <Link
          href={isLogin ? "/register" : "/login"}
          className="font-semibold text-primary-light hover:underline"
        >
          {isLogin ? "أنشئ حساباً" : "سجّل الدخول"}
        </Link>
      </p>
    </div>
  );
}

function OAuthButton({
  label,
  icon,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-elevated px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-primary-light/40 hover:bg-white/5 disabled:opacity-50 disabled:pointer-events-none"
    >
      <span className="h-5 w-5">{icon}</span>
      {loading ? "..." : label}
    </button>
  );
}

/** Map common Supabase auth errors to Arabic. */
function translateAuthError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (/Invalid login credentials/i.test(msg)) return "البريد أو كلمة المرور غير صحيحة.";
  if (/User already registered/i.test(msg)) return "هذا البريد مسجّل بالفعل.";
  if (/Password should be at least/i.test(msg)) return "كلمة المرور قصيرة جداً (6 أحرف على الأقل).";
  if (/Email not confirmed/i.test(msg)) return "لم يتم تأكيد البريد بعد — راجع رسالة التأكيد.";
  if (/rate limit/i.test(msg)) return "محاولات كثيرة، حاول بعد قليل.";
  return "حدث خطأ، حاول مرة أخرى.";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35 24 35c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 12.9 3 4 11.9 4 23s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.5-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 43c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 34.1 26.7 35 24 35c-5.3 0-9.7-2.6-11.3-7l-6.5 5C9.6 38.6 16.2 43 24 43z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4 5.5l6.3 5.3C41.2 36 44 30.5 44 23c0-1.3-.1-2.5-.4-3.5z"
      />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="#5865F2" aria-hidden>
      <path d="M20.3 4.4A19.8 19.8 0 0 0 15.4 3l-.2.5a14.6 14.6 0 0 1 4.3 2.2 13.7 13.7 0 0 0-11.2 0A14.6 14.6 0 0 1 12.6 3.5L12.4 3a19.8 19.8 0 0 0-4.9 1.4C4.3 9.2 3.4 13.9 3.8 18.5a19.9 19.9 0 0 0 6 3.1l.5-.8c-.8-.3-1.6-.7-2.3-1.2l.6-.4a14.2 14.2 0 0 0 12.2 0l.6.4c-.7.5-1.5.9-2.3 1.2l.5.8a19.9 19.9 0 0 0 6-3.1c.5-5.3-.9-10-3.8-14.1zM9.7 15.7c-1 0-1.7-.9-1.7-2s.8-2 1.7-2c1 0 1.7.9 1.7 2s-.7 2-1.7 2zm4.6 0c-1 0-1.7-.9-1.7-2s.8-2 1.7-2c1 0 1.7.9 1.7 2s-.7 2-1.7 2z" />
    </svg>
  );
}
