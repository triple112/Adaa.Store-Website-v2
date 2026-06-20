import type { Metadata } from "next";
import { PackageCard } from "@/components/sections/packages/PackageCard";
import { ServiceCard } from "@/components/sections/services/ServiceCard";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { packages } from "@/data/packages";
import { getServicesByCategory, serviceCategories } from "@/data/services";

export const metadata: Metadata = {
  title: "خدماتنا",
  description:
    "خدمات أداء لتحسين أداء أجهزة الألعاب — باقات تحسين الأداء، وخدمات النظام، وكسر السرعة، والفحص والاستشارة.",
};

function GroupHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-8 border-r-4 border-primary pr-4">
      <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm text-subtle">{subtitle}</p>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Section spacing="none" className="ambient-glow overflow-hidden pb-24 pt-32 sm:pt-36">
      <Container size="wide" className="relative z-10">
        <SectionHeading
          eyebrow="خدماتنا"
          title={
            <>
              كل ما تحتاجه <span className="text-gradient">لأداء أعلى</span>
            </>
          }
          subtitle="نبدأ بباقات تحسين الأداء، إلى جانب مجموعة خدمات متكاملة للنظام وكسر السرعة والفحص والاستشارة."
          className="mb-14"
        />

        {/* Performance optimization tiers */}
        <div className="mb-20">
          <GroupHeading
            title="باقات تحسين الأداء"
            subtitle="ثلاث نسخ تغطّي كل الاحتياجات — من الضبط الاقتصادي إلى أقصى أداء ممكن للأجهزة القوية."
          />
          <div className="grid items-start gap-6 lg:grid-cols-3">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} />
            ))}
          </div>
        </div>

        {/* Additional services grouped by category */}
        {serviceCategories.map((category) => {
          const items = getServicesByCategory(category.id);
          if (items.length === 0) return null;
          return (
            <div key={category.id} className="mb-20 last:mb-0">
              <GroupHeading title={category.title} subtitle={category.subtitle} />
              <div className="grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            </div>
          );
        })}
      </Container>
    </Section>
  );
}
