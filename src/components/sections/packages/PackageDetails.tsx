import { CheckIcon } from "@/components/ui/icons";
import type { PackageDetails as Details } from "@/data/packages";

export function PackageDetails({ details }: { details: Details }) {
  return (
    <div className="mt-16 flex flex-col gap-12">
      {/* Benefits */}
      <section>
        <h2 className="mb-6 flex items-center gap-2.5 font-display text-2xl font-bold text-primary-light">
          <span aria-hidden>{details.benefitsIcon}</span>
          {details.benefitsTitle}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {details.benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="rounded-xl border-r-4 border-primary bg-white/[0.03] p-5"
            >
              <h3 className="mb-2 font-display text-base font-bold text-white">{benefit.title}</h3>
              <p className="text-sm leading-relaxed text-subtle">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Scope */}
      <section className="rounded-xl border border-dashed border-primary/30 bg-primary/[0.05] p-6 sm:p-7">
        <h2 className="mb-4 font-display text-xl font-bold text-primary-light">
          {details.scopeTitle}
        </h2>
        <ul className="flex flex-col gap-3">
          {details.scope.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-[#cbd5e1]">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary-light" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Process */}
      <section>
        <h2 className="mb-3 font-display text-xl font-bold text-primary-light">
          {details.processTitle}
        </h2>
        <p className="leading-relaxed text-subtle">{details.process}</p>
      </section>

      {/* Callouts */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-primary/60 bg-primary/[0.04] p-6 text-center">
          <h3 className="mb-2 font-display text-lg font-extrabold text-primary-light">
            {details.support.title}
          </h3>
          <p className="text-sm leading-relaxed text-white/90">{details.support.description}</p>
        </div>

        {details.guarantee ? (
          <div className="rounded-xl border border-[#fbbf24]/60 bg-[#fbbf24]/[0.05] p-6 text-center">
            <h3 className="mb-2 font-display text-lg font-extrabold text-[#fbbf24]">
              {details.guarantee.title}
            </h3>
            <p className="text-sm leading-relaxed text-white/90">{details.guarantee.description}</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
