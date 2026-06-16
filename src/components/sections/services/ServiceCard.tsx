import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { getStartingPrice, type Service } from "@/data/services";

export function ServiceCard({ service }: { service: Service }) {
  const tiered = !!service.priceTiers?.length;
  const displayPrice = getStartingPrice(service);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-surface/60 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-primary-light/30">
      {/* Poster */}
      <div className="relative aspect-[3/4] w-full overflow-hidden">
        <Image
          src={service.image}
          alt={service.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-lg font-bold text-white">{service.name}</h3>
        <p className="mt-1 flex-1 text-sm leading-relaxed text-subtle">{service.tagline}</p>

        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2" dir="rtl">
              {tiered ? <span className="text-xs text-faint">يبدأ من</span> : null}
              <span className="font-display text-2xl font-bold text-white" dir="ltr">
                {service.currency}
                {displayPrice}
              </span>
              {service.oldPrice ? (
                <span className="text-sm text-faint line-through" dir="ltr">
                  {service.currency}
                  {service.oldPrice}
                </span>
              ) : null}
            </div>
            <Link
              href={service.href}
              className="text-sm font-semibold text-subtle transition-colors hover:text-white"
            >
              التفاصيل ←
            </Link>
          </div>

          {tiered ? (
            <Button href={service.href} variant="outline" size="md" className="w-full">
              اختر الخيار
            </Button>
          ) : (
            <AddToCartButton
              item={{
                id: service.id,
                name: service.name,
                image: service.image,
                price: service.price ?? 0,
                currency: service.currency,
                href: service.href,
              }}
              variant="outline"
              className="w-full"
            />
          )}
        </div>
      </div>
    </div>
  );
}
