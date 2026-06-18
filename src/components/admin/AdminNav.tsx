"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/admin", label: "نظرة عامة" },
  { href: "/admin/coupons", label: "الكوبونات" },
  { href: "/admin/subscriptions", label: "الاشتراكات" },
  { href: "/admin/users", label: "المستخدمين" },
  { href: "/admin/orders", label: "الطلبات" },
  { href: "/admin/contacts", label: "جهات الاتصال" },
  { href: "/admin/settings", label: "الإعدادات" },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-row flex-wrap gap-1 lg:flex-col lg:gap-1.5">
      {LINKS.map((l) => {
        const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary/15 text-primary-light"
                : "text-muted hover:bg-white/[0.03] hover:text-white",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
