import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { benchmarks, inputLag, network } from "@/data/techStats";
import { BenchmarkItem } from "./BenchmarkItem";
import { LiveChart } from "./LiveChart";
import { TrustBar } from "./TrustBar";

const chartBox = "rounded-2xl border border-white/10 bg-[rgba(15,15,15,0.75)] p-6 sm:p-9";

export function TechStats() {
  return (
    <Section id="performance" className="overflow-hidden">
      <Container size="wide">
        <SectionHeading
          title="أداء مستقر، هندسة دقيقة."
          subtitle="نحن لا نعتمد على العشوائية. جميع التعديلات مدروسة لتمنحك استقراراً تاماً، وليس فقط أرقام فريمات وهمية."
          className="mb-14"
        />

        <div className="flex flex-col gap-6">
          <LiveChart />

          {/* Input lag + network */}
          <div className="grid gap-6 lg:grid-cols-2">
            <InputLagCard />
            <NetworkCard />
          </div>

          {/* FPS benchmarks */}
          <div className={chartBox}>
            <div className="mb-7">
              <h3 className="font-display text-xl font-bold text-white sm:text-2xl">
                نتائج الألعاب (FPS Benchmark)
              </h3>
              <p className="mt-2 text-sm text-subtle">
                متوسط الإطارات قبل وبعد الخدمة على أشهر الألعاب التنافسية.
              </p>
            </div>
            <div className="grid gap-x-8 gap-y-5 md:grid-cols-2">
              {benchmarks.map((b) => (
                <BenchmarkItem key={b.game} data={b} />
              ))}
            </div>
          </div>
        </div>

        <TrustBar />
      </Container>
    </Section>
  );
}

function InputLagCard() {
  return (
    <div className={chartBox}>
      <h3 className="font-display text-xl font-bold text-white">أسرع استجابة (Input Lag)</h3>
      <p className="mt-2 text-sm text-subtle">
        تقليل زمن تأخير النظام لضمان استجابة فورية للماوس والكيبورد.
      </p>

      <div className="mt-7 flex flex-col gap-5">
        <LagRow label="Before" value={`${inputLag.beforeMs}ms`} width={85} variant="before" />
        <LagRow label="After" value={`${inputLag.afterMs}ms`} width={15} variant="after" />
      </div>
    </div>
  );
}

function LagRow({
  label,
  value,
  width,
  variant,
}: {
  label: string;
  value: string;
  width: number;
  variant: "before" | "after";
}) {
  const after = variant === "after";
  return (
    <div className="flex items-center gap-4">
      <span className={`w-20 font-display ${after ? "text-primary-light" : "text-subtle"}`}>
        {label}
      </span>
      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/5">
        <div
          className={`h-full rounded-full ${after ? "bg-primary-light shadow-[0_0_12px_var(--color-primary-light)]" : "bg-[#555]"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={`w-14 text-left font-display text-lg font-bold ${after ? "text-primary-light" : "text-white"}`}
      >
        {value}
      </span>
    </div>
  );
}

function NetworkCard() {
  return (
    <div className={chartBox}>
      <h3 className="font-display text-xl font-bold text-white">تحسين استجابة الشبكة</h3>
      <p className="mt-2 text-sm text-subtle">
        حل مشاكل الـ Packet Loss وتقليل الـ Bufferbloat.
      </p>

      <div className="flex min-h-[150px] items-center justify-center gap-8 sm:gap-10">
        <span className="font-display text-6xl font-bold leading-none text-[#555]">
          {network.beforeGrade}
        </span>
        <ArrowLeftIcon className="h-10 w-10 text-faint" />
        <span className="font-display text-6xl font-bold leading-none text-primary-light [text-shadow:0_0_40px_rgba(80,141,78,0.5)]">
          {network.afterGrade}
        </span>
      </div>
    </div>
  );
}
