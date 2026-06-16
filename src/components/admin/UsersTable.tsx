"use client";

import { useMemo, useState, useTransition } from "react";
import { setUserBanned, setUserRole } from "@/lib/admin/actions";

export type AdminUser = {
  id: string;
  email: string | null;
  display_name: string | null;
  role: "user" | "admin";
  banned: boolean;
  created_at: string;
};

export function UsersTable({ users }: { users: AdminUser[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        (u.email ?? "").toLowerCase().includes(term) ||
        (u.display_name ?? "").toLowerCase().includes(term),
    );
  }, [q, users]);

  return (
    <div className="rounded-2xl border border-white/10 bg-surface p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg font-bold text-white">المستخدمين ({users.length})</h2>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="بحث بالإيميل أو الاسم"
          className="w-56 rounded-lg border border-white/10 bg-elevated px-3 py-2 text-sm text-white placeholder:text-faint focus:border-primary-light/50 focus:outline-none"
        />
      </div>

      <ul className="divide-y divide-white/5">
        {filtered.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-white">
                  {u.display_name || u.email || "—"}
                </span>
                {u.role === "admin" && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs text-primary-light">
                    أدمن
                  </span>
                )}
                {u.banned && (
                  <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-300">
                    محظور
                  </span>
                )}
              </div>
              <p className="text-xs text-faint" dir="ltr">
                {u.email}
              </p>
            </div>
            <UserRowActions user={u} />
          </li>
        ))}
        {filtered.length === 0 && <li className="py-3 text-sm text-muted">لا نتائج.</li>}
      </ul>
    </div>
  );
}

function UserRowActions({ user }: { user: AdminUser }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(
            async () =>
              void (await setUserRole(user.id, user.role === "admin" ? "user" : "admin")),
          )
        }
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-muted hover:text-white disabled:opacity-50"
      >
        {user.role === "admin" ? "إلغاء الأدمن" : "ترقية لأدمن"}
      </button>
      <button
        disabled={pending}
        onClick={() => startTransition(async () => void (await setUserBanned(user.id, !user.banned)))}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-semibold text-red-300/80 hover:border-red-500/40 hover:text-red-300 disabled:opacity-50"
      >
        {user.banned ? "فك الحظر" : "حظر"}
      </button>
    </div>
  );
}
