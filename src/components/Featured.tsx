import { featuredRanges, whatsappLink } from "../data/site";
import { Icon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Featured() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              index="03"
              eyebrow="Featured ranges"
              title={
                <>
                  Specified by pros,
                  <br className="hidden sm:block" /> stocked{" "}
                  <em className="font-light italic text-brass-600">deep.</em>
                </>
              }
              description="Four ranges our trade customers keep coming back for. Ask the showroom for current stock, finishes and specifications — prices are quoted on enquiry."
            />
          </Reveal>
          <Reveal delay={100} className="shrink-0">
            <a href="#contact" className="link-underline inline-flex items-center gap-2 text-sm font-medium text-ink-900">
              Request a quote
              <Icon name="arrowUpRight" className="size-4" />
            </a>
          </Reveal>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {featuredRanges.map((range, index) => (
            <Reveal key={range.name} delay={index * 70}>
              <article className="group flex h-full flex-col">
                <a
                  href={whatsappLink(
                    `Hello Laghara Hardwares, I'd like to enquire about ${range.name}. Could you share availability and details?`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block overflow-hidden rounded-lg bg-cream-deep"
                  aria-label={`Enquire about ${range.name}`}
                >
                  <img
                    src={range.image}
                    alt={range.alt}
                    width={960}
                    height={1200}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                  />
                  <span
                    className="absolute inset-0 bg-gradient-to-t from-plum-950/45 via-transparent to-transparent opacity-70"
                    aria-hidden="true"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-plum-900 backdrop-blur-sm">
                    {range.category}
                  </span>
                  <span className="absolute bottom-4 right-4 grid size-10 translate-y-2 place-items-center rounded-full bg-cream text-plum-900 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <Icon name="arrowUpRight" className="size-4" />
                  </span>
                </a>

                <div className="flex flex-1 flex-col pt-4">
                  <h3 className="font-display text-[1.4rem] leading-tight text-ink-950">
                    {range.name}
                  </h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-500">
                    {range.description}
                  </p>
                  <a
                    href={whatsappLink(
                      `Hello Laghara Hardwares, I'd like to enquire about ${range.name}. Could you share availability and details?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-900 transition-colors hover:text-iris-700"
                  >
                    Enquire
                    <Icon name="arrowRight" className="size-3.5" />
                  </a>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={80}>
          <div className="relative mt-16 overflow-hidden rounded-xl bg-plum-900 px-6 py-9 text-cream sm:px-10 sm:py-11 lg:mt-20">
            <div
              className="absolute -right-24 -top-24 size-72 rounded-full border border-cream/10"
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-32 right-20 size-72 rounded-full border border-cream/5"
              aria-hidden="true"
            />
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-center">
              <div className="max-w-2xl">
                <span className="eyebrow text-brass-300">
                  <span className="size-1.5 bg-brass-300" aria-hidden="true" />
                  Trade pricing
                </span>
                <h3 className="mt-3 font-display text-[1.8rem] leading-tight sm:text-[2.2rem]">
                  Project quantities, priced for the trade.
                </h3>
                <p className="mt-2.5 max-w-xl text-sm leading-relaxed text-cream/65">
                  Building a full fit-out? Talk to us for rates on bulk plywood, laminates and
                  hardware — up to 30% off list.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-3">
                <a href="#contact" className="btn btn-light">
                  Get a quote
                  <Icon name="arrowUpRight" className="size-4" />
                </a>
                <a
                  href={whatsappLink("Hello Laghara Hardwares, I'd like trade rates for a project.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
