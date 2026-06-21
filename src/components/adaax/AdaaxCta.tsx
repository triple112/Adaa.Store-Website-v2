/**
 * AdaaxCta — closing call-to-action band.
 */
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ArrowDownIcon } from "@/components/ui/icons";

export function AdaaxCta() {
  return (
    <Section spacing="tight">
      <Container size="narrow">
        <div className="ambient-glow relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-elevated to-surface p-10 text-center sm:p-14">
          <h2 className="relative font-display text-3xl font-bold leading-tight text-white sm:text-4xl">
            جاهز تطلّع <span className="text-gradient">أقصى أداء</span> من جهازك؟
          </h2>
          <p className="relative mx-auto mt-4 max-w-xl text-muted">
            اشترك في AdaaX النهارده وخلّي جهازك يشتغل بكامل طاقته — بأمان، وبتحديثات مستمرة.
          </p>
          <div className="relative mt-8 flex justify-center">
            <Button href="#subscribe" size="md" className="px-8 py-3.5 text-base sm:text-lg">
              اشترك الآن
              <ArrowDownIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
