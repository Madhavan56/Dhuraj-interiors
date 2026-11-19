import { business, strengths } from "../data/site";
import { Icon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function WhyUs() {
  return (
    <section className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <Reveal>
                <SectionHeading
                  index="04"
                  eyebrow="Why Dhuraj"
                  title={
                    <>
                      Built on experience.
                      <br />
                      Finished with{" "}
                      <em className="font-light italic text-brass-600">care.</em>
                    </>
                  }
                  description="The details clients notice long after the dust settles — and the reasons they come back."
                />
              </Reveal>

              <Reveal delay={140}>
                <a
                  href={business.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group mt-8 inline-flex items-center gap-4 rounded-lg border border-ink-900/12 p-4 pr-5 transition-colors hover:border-ink-900/30 hover:bg-white/50"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-plum-900 text-cream">
                    <Icon name="pin" className="size-[1.1rem]" />
                  </span>
                  <span>
                    <span className="block text-xs font-semibold text-ink-900">
                      Visit the Thanjavur studio
                    </span>
                    <span className="mt-0.5 block text-[0.6875rem] text-ink-500">
                      {business.hours}
                    </span>
                  </span>
                  <Icon
                    name="arrowUpRight"
                    className="ml-1 size-4 text-ink-500 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  />
                </a>
              </Reveal>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="grid gap-x-8 sm:grid-cols-2">
              {strengths.map((strength, index) => (
                <Reveal key={strength.title} delay={index * 60}>
                  <div className="group border-t border-ink-900/12 py-6">
                    <div className="flex items-center justify-between">
                      <span className="grid size-10 place-items-center rounded-full bg-plum-900/[0.055] text-plum-800 transition-colors duration-500 group-hover:bg-plum-900 group-hover:text-cream">
                        <Icon name={strength.icon} className="size-[1.05rem]" />
                      </span>
                      <span className="text-[0.625rem] tabular-nums tracking-[0.2em] text-ink-500/60">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="mt-4 font-display text-[1.25rem] leading-snug text-ink-950">
                      {strength.title}
                    </h3>
                    <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-500">
                      {strength.description}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={100}>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg bg-cream-deep/70 px-5 py-4">
                <p className="flex items-center gap-2 text-xs text-ink-700">
                  <Icon name="check" className="size-4 text-iris-700" strokeWidth={2} />
                  Design &amp; installation in-house
                </p>
                <p className="flex items-center gap-2 text-xs text-ink-700">
                  <Icon name="check" className="size-4 text-iris-700" strokeWidth={2} />
                  5-year workmanship warranty
                </p>
                <p className="flex items-center gap-2 text-xs text-ink-700">
                  <Icon name="check" className="size-4 text-iris-700" strokeWidth={2} />
                  Serving Thanjavur &amp; nearby
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
