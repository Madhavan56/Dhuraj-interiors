import { processSteps } from "../data/site";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Process() {
  return (
    <section id="process" className="bg-cream-deep/45 py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="How we work"
              title={
                <>
                  A considered process,
                  <br className="hidden sm:block" /> from concept to{" "}
                  <em className="font-light italic text-brass-600">handover.</em>
                </>
              }
              description="Good interiors come from clear decisions. Our process keeps you involved without the complications."
            />
          </Reveal>
          <Reveal delay={100} className="shrink-0">
            <p className="max-w-[16rem] text-xs leading-relaxed text-ink-500">
              Most projects are completed in around 60 days, with the schedule agreed before
              work begins.
            </p>
          </Reveal>
        </div>

        <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {processSteps.map((step, index) => (
            <Reveal as="li" key={step.title} delay={index * 80}>
              <div className="border-t border-ink-900/15 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brass-600">
                    Step {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-[2.6rem] leading-none text-ink-900/12">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[1.4rem] leading-snug text-ink-950">
                  {step.title}
                </h3>
                <p className="mt-2.5 text-[0.8125rem] leading-relaxed text-ink-500">
                  {step.description}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
