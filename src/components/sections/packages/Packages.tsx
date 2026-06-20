import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { packages } from "@/data/packages";
import { PackageCard } from "./PackageCard";

export function Packages() {
  return (
    <Section id="packages" className="ambient-glow overflow-hidden">
      <Container size="wide" className="relative z-10">
        <SectionHeading
          eyebrow="الباقات"
          title={
            <>
              اختر الباقة <span className="text-gradient">المناسبة</span> لجهازك
            </>
          }
          subtitle="ثلاث نسخ تغطّي كل الاحتياجات — من الضبط الاقتصادي إلى أقصى أداء ممكن للأجهزة القوية."
          className="mb-14"
        />

        <div className="grid items-start gap-6 lg:grid-cols-3">
          {packages.map((pkg) => (
            <PackageCard key={pkg.id} pkg={pkg} />
          ))}
        </div>
      </Container>
    </Section>
  );
}
