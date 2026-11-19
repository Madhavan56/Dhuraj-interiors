import { services } from "../data/site";
import { Icon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Services() {
  return (
    <section id="services" className="relative overflow-hidden bg-plum-950 py-24 text-cream md:py-32">
      <div
        className="pointer-events-none absolute -right-40 top-0 size-[34rem] rounded-full border border-cream/[0.06]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 size-80 rounded-full border border-cream/[0.05]"
        aria-hidden="true"
      />

      <div className="container-page relative">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                index="05"
                eyebrow="What we do"
                tone="light"
                title={
                  <>
                    From the quote
                    <br className="hidden sm:block" /> to the{" "}
                    <em className="font-light italic text-brass-300">doorstep.</em>
                  </>
                }
                description="More than a counter. We supply, price and deliver the materials a fit-out runs on — and stay available after the order is placed."
              />
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-9 rounded-lg border border-cream/12 p-6">
                <p className="font-display text-[1.35rem] leading-snug text-cream">
                  Need a price for a whole project? We usually reply within a business day.
                </p>
                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-brass-300 transition-colors hover:text-cream"
                >
                  Send your material list
                  <Icon name="arrowRight" className="size-3.5" />
                </a>
              </div>
            </Reveal>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-x-10 sm:grid-cols-2">
              {services.map((service, index) => (
                <Reveal key={service.title} delay={index * 60}>
                  <div className="group border-t border-cream/12 py-6">
                    <div className="flex items-start justify-between gap-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full border border-cream/15 text-brass-300 transition-colors duration-500 group-hover:border-brass-300/60 group-hover:bg-cream/5">
                        <Icon name={service.icon} className="size-[1.1rem]" />
                      </span>
                      <span className="text-[0.625rem] tabular-nums tracking-[0.2em] text-cream/25">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-[1.3rem] leading-tight text-cream">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-cream/55">
                      {service.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
