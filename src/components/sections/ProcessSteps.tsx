import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { processSteps } from "@/data/processSteps";

export function ProcessSteps() {
  return (
    <Section id="how-it-works" spacing="tight">
      <Container size="wide">
        <div className="flex flex-col gap-4 md:flex-row">
          {processSteps.map((step) => (
            <div
              key={step.number}
              className="group relative flex flex-1 items-center gap-4 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white/[0.05]"
            >
              {/* bottom accent line */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-l from-primary/60 to-transparent" />

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] border border-primary/20 bg-primary/10 text-2xl">
                {step.icon}
              </div>

              <div className="relative z-10">
                <h3 className="font-display text-base font-bold text-white">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-subtle">{step.description}</p>
              </div>

              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 font-display text-4xl font-black text-white/[0.04]">
                {step.number}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
