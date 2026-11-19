import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";
import { Icon } from "./ui/Icons";
import { business } from "../data/site";

const values = ["Founded in 1987", "5-year warranty", "Lifelong support"];

export function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="grid items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <Reveal className="relative lg:col-span-6">
            <div className="relative">
              <div
                className="absolute -left-3 -top-3 hidden h-full w-full border border-brass-500/35 sm:block"
                aria-hidden="true"
              />
              <div className="relative overflow-hidden bg-cream-deep">
                <img
                  src="/images/about-studio.png"
                  alt="Softly lit interior with a lounge chair, side table and timber floor"
                  width={635}
                  height={639}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover"
                />
              </div>

              <div className="absolute -bottom-8 right-4 w-[42%] max-w-[13rem] overflow-hidden border-[6px] border-cream bg-cream-deep shadow-xl sm:-right-6">
                <img
                  src="/images/gallery-courtyard.jpg"
                  alt="Warm entry courtyard with terracotta flooring and timber doors"
                  width={900}
                  height={504}
                  loading="lazy"
                  decoding="async"
                  className="aspect-square w-full object-cover"
                />
              </div>
            </div>

            <div className="mt-16 flex items-center gap-4 sm:mt-14">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border border-brass-500/40 text-brass-600">
                <Icon name="store" className="size-5" />
              </span>
              <p className="text-xs leading-relaxed text-ink-500">
                Visit the studio
                <span className="block text-[0.8125rem] font-medium text-ink-900">
                  {business.hours}
                </span>
              </p>
            </div>
          </Reveal>

          <div className="lg:col-span-6 lg:pt-6">
            <Reveal>
              <SectionHeading
                index="01"
                eyebrow="About Dhuraj"
                title={
                  <>
                    A Thanjavur studio,
                    <br className="hidden sm:block" /> crafting homes{" "}
                    <em className="font-light italic text-brass-600 whitespace-nowrap">
                      since 1987.
                    </em>
                  </>
                }
              />
            </Reveal>

            <div className="mt-7 space-y-5 text-[0.9375rem] leading-relaxed text-ink-700/85">
              <Reveal delay={80}>
                <p>
                  Dhuraj Interiors was founded in 1987 by Dhurai Raj, with a simple belief: a
                  well-made interior should feel personal, practical and built to last.
                </p>
              </Reveal>
              <Reveal delay={140}>
                <p>
                  From our studio and workshop in Thanjavur, we design and build modular
                  kitchens, wardrobes, wooden flooring, false ceilings, mosquito netlon and
                  custom woodwork for homes and businesses across Trichy, Mannargudi and
                  Pudukkottai.
                </p>
              </Reveal>
              <Reveal delay={200}>
                <p>
                  Every project is handled by one team, from the first measurement and drawing
                  to the final fit and finish. You stay involved at every step — and we stay
                  available long after handover.
                </p>
              </Reveal>
            </div>

            <Reveal delay={260}>
              <ul className="mt-9 grid gap-3 border-t border-ink-900/10 pt-7 sm:grid-cols-3">
                {values.map((value) => (
                  <li key={value} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-plum-900/6 text-iris-700">
                      <Icon name="check" className="size-3" strokeWidth={2.2} />
                    </span>
                    <span className="text-[0.8125rem] font-medium leading-snug text-ink-700">
                      {value}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={320}>
              <div className="mt-9 border-l-2 border-brass-500 pl-5">
                <p className="font-display text-[1.35rem] leading-snug text-ink-900 sm:text-[1.5rem]">
                  Designed around you. Built to last.
                </p>
                <p className="mt-2 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-500">
                  How we work
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
