import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { PackageDetails } from "@/components/sections/packages/PackageDetails";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ArrowLeftIcon, RefreshIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { getPackageBySlug, packages } from "@/data/packages";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return packages.map((pkg) => ({ slug: pkg.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) return { title: "الباقة غير موجودة" };
  return {
    title: pkg.name,
    description: pkg.details.intro,
  };
}

const guarantees = [
  { icon: ShieldCheckIcon, text: "ضمان استرداد كامل المبلغ" },
  { icon: RefreshIcon, text: "إمكانية التركيب مع وبدون فورمات" },
];

export default async function PackagePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const pkg = getPackageBySlug(slug);
  if (!pkg) notFound();

  return (
    <Section spacing="none" className="ambient-glow overflow-hidden pb-24 pt-32 sm:pt-36">
      <Container size="wide" className="relative z-10">
        <Link
          href="/services"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-subtle transition-colors hover:text-white"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          كل الخدمات
        </Link>

        {/* Asymmetric grid — image (2fr) on the right, all content (3fr) on the left in RTL */}
        <div className="grid items-start gap-8 md:grid-cols-[2fr_3fr] md:gap-10">

          {/* Image col — sticks while scrolling through long content */}
          <div className="md:sticky md:top-28">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60">
              {pkg.badge ? (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                  {pkg.badge}
                </span>
              ) : null}
              <div className="relative aspect-[4/5] w-full">
                <Image
                  src={pkg.image}
                  alt={pkg.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content col — name, price, desc, buttons, guarantees, then full details */}
          <div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{pkg.name}</h1>
            <p className="mt-3 text-lg text-subtle">{pkg.tagline}</p>

            {pkg.price !== null ? (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-5xl font-bold text-white">
                  {pkg.currency}
                  {pkg.price}
                </span>
                {pkg.oldPrice ? (
                  <span className="text-xl text-faint line-through">
                    {pkg.currency}
                    {pkg.oldPrice}
                  </span>
                ) : null}
              </div>
            ) : null}

            <p className="mt-6 leading-relaxed text-muted">{pkg.details.intro}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {pkg.price !== null ? (
                <AddToCartButton
                  item={{
                    id: pkg.id,
                    name: pkg.name,
                    image: pkg.image,
                    price: pkg.price,
                    currency: pkg.currency,
                    href: pkg.href,
                  }}
                  size="md"
                  className="px-8 py-3.5 text-base"
                />
              ) : null}
              <Button href="/services" variant="outline" size="md" className="px-6 py-3.5">
                مقارنة الباقات
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/5 pt-6">
              {guarantees.map(({ icon: Icon, text }) => (
                <span key={text} className="flex items-center gap-2 text-sm text-subtle">
                  <Icon className="h-5 w-5 text-primary-light" />
                  {text}
                </span>
              ))}
            </div>

            {/* Full package details — benefits, scope, process, callouts */}
            <PackageDetails details={pkg.details} />
          </div>
        </div>
      </Container>
    </Section>
  );
}
