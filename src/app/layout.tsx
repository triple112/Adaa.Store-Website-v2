import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SiteFrame } from "@/components/layout/SiteFrame";
import { AuthSync } from "@/components/layout/AuthSync";
import { CartProvider } from "@/lib/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { getUser } from "@/lib/auth/dal";

// Body / UI font
const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

// Display / headings font
const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
  variable: "--font-ibm-plex-arabic",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://adaa.store"),
  title: {
    default: "أداء | تحسين أداء أجهزة الألعاب",
    template: "%s | أداء",
  },
  description:
    "خدمة احترافية لتحسين أداء أجهزة الكمبيوتر والألعاب — فحص شامل وضبط دقيق لإعدادات الويندوز والبايوس للحصول على أعلى فريمات وأقل تأخير.",
  keywords: ["تحسين الأداء", "زيادة الفريمات", "FPS", "أداء", "ألعاب", "تحسين الجهاز"],
  openGraph: {
    title: "أداء | تحسين أداء أجهزة الألعاب",
    description: "استفِد بكامل قوة جهازك — أعلى فريمات، أقل تأخير، وأنعم سلاسة.",
    locale: "ar_SA",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getUser();

  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${cairo.variable} ${ibmPlexArabic.variable} h-full antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-bg text-foreground">
        <AuthSync serverUserId={user?.id ?? null} />
        <CartProvider>
          <Navbar />
          <main className="flex-1">
            <SiteFrame>{children}</SiteFrame>
          </main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
