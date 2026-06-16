import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/AddToCartButton";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { Package } from "@/data/packages";

export function PackageCard({ pkg }: { pkg: Package }) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-2xl border bg-surface/60 backdrop-blur-md transition-all duration-300",
        pkg.featured
          ? "border-primary/50 shadow-[0_0_50px_rgba(80,141,78,0.18)] lg:-translate-y-3"
          : "border-white/[0.08] hover:-translate-y-1 hover:border-primary-light/30",
      )}
    >
      {pkg.badge ? (
        <span
          className={cn(
            "absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-bold backdrop-blur-sm",
            pkg.featured
              ? "bg-primary text-white"
              : "border border-primary/30 bg-primary/15 text-primary-light",
          )}
        >
          {pkg.badge}
        </span>
      ) : null}

      {/* Poster */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={pkg.image}
          alt={pkg.name}
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-surface to-transparent" />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-bold text-white">{pkg.name}</h3>
        <p className="mt-1 text-sm text-subtle">{pkg.tagline}</p>

        <ul className="mt-5 flex flex-1 flex-col gap-3">
          {pkg.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm text-muted">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            {pkg.price !== null ? (
              <div className="flex items-baseline gap-2" dir="ltr">
                <span className="font-display text-3xl font-bold text-white">
                  {pkg.currency}
                  {pkg.price}
                </span>
                {pkg.oldPrice ? (
                  <span className="text-sm text-faint line-through">
                    {pkg.currency}
                    {pkg.oldPrice}
                  </span>
                ) : null}
              </div>
            ) : (
              <span className="text-sm text-subtle">السعر عند الطلب</span>
            )}
            <Link
              href={pkg.href}
              className="text-sm font-semibold text-subtle transition-colors hover:text-white"
            >
              التفاصيل ←
            </Link>
          </div>

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
              variant={pkg.featured ? "primary" : "outline"}
              className="w-full"
            />
          ) : (
            <Button href={pkg.href} variant="outline" size="md" className="w-full">
              تفاصيل الباقة
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
