/**
 * AdaaxHowItWorks — three-step path from subscribing to a tuned machine.
 */
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";

const STEPS = [
  {
    n: "١",
    title: "اشترك في AdaaX",
    desc: "اختر الخطة الشهرية أو السنوية وادفع بأمان عبر PayPal — الاشتراك يتفعّل على حسابك فوراً.",
  },
  {
    n: "٢",
    title: "نزّل التطبيق وسجّل دخولك",
    desc: "حمّل تطبيق AdaaX لويندوز وسجّل بنفس حسابك، فيتعرّف على اشتراكك تلقائياً ويربط جهازك.",
  },
  {
    n: "٣",
    title: "طبّق التحسينات واستمتع",
    desc: "راقب جهازك لحظياً وطبّق التحسينات بضغطة — مع نقطة استعادة قبل أي تعديل وتحديثات مستمرة.",
  },
];

export function AdaaxHowItWorks() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="كيف يعمل"
          title={
            <>
              من الاشتراك للأداء الكامل <span className="text-gradient">في ٣ خطوات</span>
            </>
          }
        />

        <div className="relative mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* connecting line (desktop) */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-[16%] top-9 hidden h-px md:block"
            style={{ background: "linear-gradient(90deg,transparent,rgba(128,175,129,0.3),transparent)" }}
          />
          {STEPS.map((s) => (
            <div key={s.n} className="relative flex flex-col items-center text-center">
              <div
                className="relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-2xl font-display text-3xl font-bold text-primary-light"
                style={{
                  background: "linear-gradient(145deg,rgba(80,141,78,0.18),rgba(80,141,78,0.05))",
                  border: "1px solid rgba(128,175,129,0.2)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08),0 0 24px rgba(80,141,78,0.12)",
                }}
              >
                {s.n}
              </div>
              <h3 className="mt-6 font-display text-xl font-bold text-white">{s.title}</h3>
              <p className="mt-2.5 max-w-xs text-sm leading-relaxed text-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
