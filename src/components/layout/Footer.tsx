import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

const columns = [
  {
    title: "الخدمات",
    links: [
      { label: "النسخة العادية", href: "/packages/basic" },
      { label: "النسخة البريميم", href: "/packages/premium" },
      { label: "النسخة الألتميت", href: "/packages/ultimate" },
    ],
  },
  {
    title: "الموقع",
    links: [
      { label: "الرئيسية", href: "/" },
      { label: "خدماتنا", href: "/services" },
      { label: "النتائج", href: "/#performance" },
      { label: "آراء العملاء", href: "/#reviews" },
    ],
  },
  {
    title: "قانوني وتواصل",
    links: [
      { label: "الدعم الفني", href: "#" },
      { label: "الشروط والأحكام", href: "/terms" },
      { label: "سياسة الخصوصية", href: "/privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative mt-10 border-t border-white/5 bg-surface/40">
      <Container size="wide" className="py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/brand/logo-wide.png"
              alt="أداء"
              width={120}
              height={44}
              className="h-10 w-auto object-contain"
            />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-subtle">
              خدمة احترافية لتحسين أداء أجهزة الألعاب — أعلى فريمات، أقل تأخير، وأنعم سلاسة.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 font-display text-sm font-bold text-white">{col.title}</h3>
              <ul className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-subtle transition-colors hover:text-primary-light"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 text-sm text-faint sm:flex-row">
          <p>© {new Date().getFullYear()} أداء (Adaa). جميع الحقوق محفوظة.</p>
          <p>صُنع بعناية لرفع أداء جهازك.</p>
        </div>
      </Container>
    </footer>
  );
}
