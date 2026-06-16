import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { TieredAddToCart } from "@/components/cart/TieredAddToCart";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ArrowLeftIcon, CheckIcon, RefreshIcon, ShieldCheckIcon } from "@/components/ui/icons";
import { getServiceBySlug, services, type CalloutTone } from "@/data/services";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return services.map((service) => ({ slug: service.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return { title: "الخدمة غير موجودة" };
  return {
    title: service.name,
    description: service.intro,
  };
}

const guarantees = [
  { icon: ShieldCheckIcon, text: "تنفيذ يدوي احترافي وآمن" },
  { icon: RefreshIcon, text: "دعم فني ومتابعة بعد التسليم" },
];

/** Accent classes per callout tone (one-off effects → arbitrary colors). */
const toneStyles: Record<CalloutTone, { box: string; title: string }> = {
  green: { box: "border-primary/50 bg-primary/[0.05]", title: "text-primary-light" },
  blue: { box: "border-[#38bdf8]/50 bg-[#38bdf8]/[0.08]", title: "text-[#38bdf8]" },
  discord: { box: "border-[#5865F2]/50 bg-[#5865F2]/[0.10]", title: "text-[#8b93f6]" },
  amber: { box: "border-[#fbbf24]/50 bg-[#fbbf24]/[0.06]", title: "text-[#fbbf24]" },
};

export default async function ServicePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const tone = toneStyles[service.callout.tone];

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
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Content col */}
          <div>
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{service.name}</h1>
            <p className="mt-3 text-lg text-subtle">{service.tagline}</p>

            {/* Price — single or tiered (each tier separately add-to-cart-able) */}
            {service.priceTiers?.length ? (
              <TieredAddToCart
                baseId={service.id}
                baseName={service.name}
                image={service.image}
                currency={service.currency}
                tiers={service.priceTiers}
                href={service.href}
              />
            ) : service.price !== null ? (
              <div className="mt-6 flex items-baseline gap-3">
                <span className="font-display text-5xl font-bold text-white" dir="ltr">
                  {service.currency}
                  {service.price}
                </span>
                {service.oldPrice ? (
                  <span className="text-xl text-faint line-through" dir="ltr">
                    {service.currency}
                    {service.oldPrice}
                  </span>
                ) : null}
              </div>
            ) : null}

            <p className="mt-6 leading-relaxed text-muted">{service.intro}</p>

            <div className="mt-8 flex flex-wrap gap-3">
              {!service.priceTiers?.length && service.price !== null ? (
                <AddToCartButton
                  item={{
                    id: service.id,
                    name: service.name,
                    image: service.image,
                    price: service.price,
                    currency: service.currency,
                    href: service.href,
                  }}
                  size="md"
                  className="px-8 py-3.5 text-base"
                />
              ) : null}
              <Button href="/services" variant="outline" size="md" className="px-6 py-3.5">
                باقي الخدمات
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

            {/* Features grid */}
            <section className="mt-14">
              <h2 className="mb-6 flex items-center gap-2.5 font-display text-2xl font-bold text-primary-light">
                <span aria-hidden>{service.featuresIcon}</span>
                مميزات الخدمة
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {service.features.map((feature) => (
                  <div
                    key={feature.title}
                    className="rounded-xl border-r-4 border-primary bg-white/[0.03] p-5"
                  >
                    <h3 className="mb-2 flex items-center gap-2 font-display text-base font-bold text-white">
                      <span aria-hidden>{feature.icon}</span>
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-subtle">{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* What's included */}
            <section className="mt-12 rounded-xl border border-dashed border-primary/30 bg-primary/[0.05] p-6 sm:p-7">
              <h2 className="mb-4 font-display text-xl font-bold text-primary-light">
                🛠️ {service.includesTitle}
              </h2>
              <ul className="flex flex-col gap-3">
                {service.includes.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#cbd5e1]">
                    <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            {/* Accent callout */}
            <section className={`mt-12 rounded-xl border p-6 text-center ${tone.box}`}>
              <h3 className={`mb-2 flex items-center justify-center gap-2 font-display text-lg font-extrabold ${tone.title}`}>
                <span aria-hidden>{service.callout.icon}</span>
                {service.callout.title}
              </h3>
              <p className="text-sm leading-relaxed text-white/90">{service.callout.description}</p>
            </section>
          </div>
        </div>
      </Container>
    </Section>
  );
}
