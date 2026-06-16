import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ArrowLeftIcon, ShieldCheckIcon } from "@/components/ui/icons";

export function Hero() {
  return (
    <section className="ambient-glow relative flex flex-1 items-center overflow-hidden">
      <Container
        size="wide"
        className="relative z-10 flex flex-col items-center pb-8 pt-24 text-center"
      >
        <Badge variant="solid" icon={<ShieldCheckIcon className="h-5 w-5" />}>
          ضمان استرداد كامل المبلغ في حال عدم الاستفادة
        </Badge>

        <h1 className="mt-8 font-display text-[clamp(3rem,7vw,6.5rem)] font-bold leading-[1.08] tracking-tight text-white">
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
