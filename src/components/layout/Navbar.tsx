import Image from "next/image";
import Link from "next/link";
import { UserIcon } from "@/components/ui/icons";
import { CartButton } from "@/components/cart/CartButton";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { getProfile } from "@/lib/auth/dal";

const pages = [
  { label: "الرئيسية", href: "/" },
  { label: "خدماتنا", href: "/services" },
  { label: "AdaaX", href: "/adaax" },
];

export async function Navbar() {
  const profile = await getProfile();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="pointer-events-auto flex items-center gap-1 rounded-full border border-white/10 bg-bg/70 p-1.5 shadow-[0_8px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:gap-2">
        {/* Logo */}
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-full px-3 py-1.5"
          aria-label="أداء — الصفحة الرئيسية"
        >
          <Image
            src="/brand/logo-wide.png"
            alt="أداء"
            width={84}
            height={30}
            priority
            className="h-7 w-auto object-contain"
          />
        </Link>

        <span className="h-6 w-px bg-white/10" aria-hidden />

        {/* Pages */}
        <ul className="flex items-center">
          {pages.map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-white/5 hover:text-white sm:px-4"
              >
                {page.label}
              </Link>
            </li>
          ))}
        </ul>

        <span className="h-6 w-px bg-white/10" aria-hidden />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Cart — opens the slide-in drawer; shows live count + value */}
          <CartButton />

          {/* Account — shows the menu when signed in, otherwise a login link */}
          {profile ? (
            <AccountMenu
              displayName={profile.display_name || profile.email || "حسابي"}
              isAdmin={profile.role === "admin"}
            />
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:border-primary-light/40 hover:bg-primary/10 sm:px-4"
            >
              <UserIcon className="h-4 w-4 text-primary-light" />
              <span className="hidden sm:inline">تسجيل الدخول</span>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
