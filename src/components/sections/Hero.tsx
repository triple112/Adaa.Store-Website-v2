import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon, ShieldCheckIcon } from "@/components/ui/icons";

export function Hero() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden">
      {/* Soft brand-green shade falling from the top (framed-hero style). */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[130%] bg-[radial-gradient(42%_60%_at_50%_0%,rgba(80,141,78,0.16),transparent_72%)]"
      />

      {/* Inner faded guide lines that echo the site frame. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden lg:block">
        <div className="absolute inset-y-0 left-6 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
        <div className="absolute inset-y-0 right-6 w-px bg-gradient-to-b from-transparent via-white/[0.07] to-transparent" />
      </div>

      <Container
        size="wide"
        className="relative z-10 flex flex-col items-center pb-8 pt-24 text-center"
      >
        <Badge variant="solid" icon={<ShieldCheckIcon className="h-5 w-5" />}>
          ضمان استرداد كامل المبلغ في حال عدم الاستفادة
        </Badge>

        <h1 className="mt-8 font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[1.08] tracking-tight text-white [text-shadow:0_0_60px_rgba(80,141,78,0.25)]">
          استفِد بكامل <span className="text-gradient">قوة جهازك.</span>
        </h1>

        <p className="mt-7 max-w-3xl text-lg leading-relaxed text-muted sm:text-xl">
          عن طريق خدمة تحسين الأداء يتم أولاً فحص شامل للجهاز (درجات الحرارة، سحب الطاقة... إلخ)،
          وبناءً عليه يتم تعديل جميع إعدادات الويندوز والبايوس والقطع للاستفادة بأعلى فريمات، وأحسن
          استجابة، وأنعم سلاسة.
        </p>

        <div className="mt-8">
          <Button href="#packages" size="md" className="px-7 py-3 text-base sm:text-lg">
            تصفّح باقات تحسين الأداء
            <ArrowLeftIcon className="h-5 w-5" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
