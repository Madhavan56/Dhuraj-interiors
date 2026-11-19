import { services } from "../data/site";
import { useEnquiry } from "../context/EnquiryContext";
import { Icon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Services() {
  const { requestEnquiry } = useEnquiry();

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
                index="02"
                eyebrow="What we do"
                tone="light"
                title={
                  <>
                    From the first measure
                    <br className="hidden sm:block" /> to the final{" "}
                    <em className="font-light italic text-brass-300">fit.</em>
                  </>
                }
                description="Six services, one team. We design, make and install interiors that are made for the way you live."
              />
            </Reveal>

            <Reveal delay={140}>
              <div className="mt-9 rounded-lg border border-cream/12 p-6">
                <p className="font-display text-[1.35rem] leading-snug text-cream">
                  Planning a kitchen, wardrobe or a full home interior?
                </p>
                <a
                  href="#contact"
                  className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-brass-300 transition-colors hover:text-cream"
                >
                  Book a consultation
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
                    <button
                      type="button"
                      onClick={() =>
                        requestEnquiry(
                          service.title,
                          `I'd like to discuss ${service.title.toLowerCase()} for my project.`,
                          service.title,
                        )
                      }
                      className="mt-4 inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-brass-300 transition-colors hover:text-cream"
                    >
                      Enquire
                      <Icon name="arrowRight" className="size-3.5" />
                    </button>
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
