"use client";

import { useState } from "react";
import Link from "next/link";
import { UserIcon } from "@/components/ui/icons";
import { signOut } from "@/lib/auth/actions";

export function AccountMenu({
  displayName,
  isAdmin,
}: {
  displayName: string;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:border-primary-light/40 hover:bg-primary/10 sm:px-4"
      >
        <UserIcon className="h-4 w-4 text-primary-light" />
        <span className="hidden max-w-[8rem] truncate sm:inline">{displayName}</span>
      </button>

      {open && (
        <>
          {/* click-away backdrop */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div
            role="menu"
            className="absolute left-0 z-50 mt-2 w-48 overflow-hidden rounded-xl border border-white/10 bg-surface p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
          >
            <MenuLink href="/account" onClick={() => setOpen(false)}>
              حسابي
            </MenuLink>
            {isAdmin && (
              <MenuLink href="/admin" onClick={() => setOpen(false)}>
                لوحة الأدمن
              </MenuLink>
            )}
            <form action={signOut}>
              <button
                type="submit"
                role="menuitem"
                className="w-full rounded-lg px-3 py-2 text-right text-sm font-semibold text-muted transition-colors hover:bg-white/5 hover:text-white"
              >
                تسجيل الخروج
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

function MenuLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="block rounded-lg px-3 py-2 text-right text-sm font-semibold text-muted transition-colors hover:bg-white/5 hover:text-white"
    >
      {children}
    </Link>
  );
}
