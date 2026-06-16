import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { ChevronDownIcon } from "@/components/ui/icons";
import { faqItems } from "@/data/faq";

export function Faq() {
  return (
    <Section className="overflow-hidden">
      <Container>
        <h2 className="mb-12 bg-[linear-gradient(45deg,var(--color-primary-light)_20%,var(--color-primary)_50%,#d6efd8_80%)] bg-clip-text text-center font-display text-4xl font-bold leading-tight text-transparent [filter:drop-shadow(0_0_15px_rgba(80,141,78,0.2))] sm:text-5xl md:text-6xl">
          الأسئلة الشائعة عن خدمة تحسين أداء البي سي
        </h2>

        <div className="mx-auto flex max-w-[900px] flex-col gap-4">
          {faqItems.map((item) => (
            <details
              key={item.q}
              className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm transition-colors duration-300 hover:border-primary-light/60 hover:bg-white/[0.05]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-display text-base font-bold text-white transition-colors group-open:text-primary-light [&::-webkit-details-marker]:hidden sm:text-lg">
                <span>{item.q}</span>
                <ChevronDownIcon className="h-5 w-5 shrink-0 text-primary-light transition-transform duration-300 group-open:rotate-180" />
              </summary>

              <div className="border-t border-white/5 px-6 pb-6 pt-4 text-sm leading-loose text-muted sm:text-base">
                <p>{item.a}</p>
                {item.bullets ? (
                  <ul className="mt-3 flex flex-col gap-2">
                    {item.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="relative pr-5 before:absolute before:right-0 before:font-bold before:text-primary before:content-['•']"
                      >
                        {bullet}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
