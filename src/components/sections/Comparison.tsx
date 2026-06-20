import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CheckIcon, XIcon } from "@/components/ui/icons";
import { comparisonRows, type ComparisonStatus } from "@/data/comparison";

function StatusIcon({ status }: { status: ComparisonStatus }) {
  switch (status) {
    case "good":
      return (
        <CheckIcon
          strokeWidth={2.5}
          className="h-6 w-6 text-primary-light [filter:drop-shadow(0_0_8px_rgba(80,141,78,0.5))]"
        />
      );
    case "bad":
      return (
        <CheckIcon
          strokeWidth={2.5}
          className="h-5 w-5 text-[#ff4d4d] [filter:drop-shadow(0_0_8px_rgba(255,77,77,0.4))]"
        />
      );
    case "clean":
      return <XIcon strokeWidth={2.5} className="h-5 w-5 text-primary-light/80" />;
    case "missing":
      return <XIcon strokeWidth={2.5} className="h-5 w-5 text-faint" />;
  }
}

const rowGrid = "grid grid-cols-[1.4fr_1fr_1fr] items-center gap-3 px-5 sm:px-8";

export function Comparison() {
  return (
    <Section className="overflow-hidden">
      <Container>
        <SectionHeading
          eyebrow="المقارنة"
          title={
            <>
              الفرق بين <span className="text-gradient">تحسين الأداء</span> والتويكات العشوائية.
            </>
          }
          subtitle="في عالم مليء بملفات الـ تويك العشوائية والوهمية، نحن نقدم هندسة نظام حقيقية واستقرار مبني على البيانات."
          className="mb-14"
        />

        <div className="relative mx-auto max-w-[1000px] overflow-hidden rounded-3xl border border-white/10 bg-[rgba(20,20,20,0.65)] shadow-[0_20px_50px_rgba(0,0,0,0.3)] backdrop-blur-md">
          {/* top gradient hairline */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-primary-light/50 to-transparent" />

          {/* Header */}
          <div className={`${rowGrid} border-b border-white/5 bg-white/[0.03] py-6`}>
            <span className="text-sm font-semibold text-subtle sm:text-base">وجه المقارنة</span>
            <span className="flex items-center justify-center gap-2 font-display text-base font-bold text-white [text-shadow:0_0_15px_rgba(80,141,78,0.6)] sm:text-2xl">
              <span className="h-2 w-2 rounded-full bg-primary-light shadow-[0_0_10px_var(--color-primary-light)]" />
              Adaa Store
            </span>
            <span className="text-center text-sm font-semibold text-faint sm:text-xl">طرق أخرى</span>
          </div>

          {/* Rows */}
          {comparisonRows.map((row) => (
            <div
              key={row.feature}
              className={`${rowGrid} border-b border-white/5 py-5 transition-colors last:border-b-0 hover:bg-white/[0.03]`}
            >
              <span className="text-sm font-semibold text-white/90 sm:text-lg">{row.feature}</span>
              <span className="flex justify-center">
                <StatusIcon status={row.adaa} />
              </span>
              <span className="flex justify-center">
                <StatusIcon status={row.other} />
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
