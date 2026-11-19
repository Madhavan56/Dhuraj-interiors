import { whatsappLink } from "../data/site";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

const sourcingLines = [
  { label: "Plywood & boards", note: "Sheets for carcasses and fit-outs" },
  { label: "Laminates & surfaces", note: "Decorative finishes" },
  { label: "Kitchen & wardrobe hardware", note: "Systems and internal fittings" },
  { label: "Hinges, channels & handles", note: "Everyday moving parts" },
  { label: "Locks, profiles & accessories", note: "Security and finishing detail" },
];

export function Brands() {
  return (
    <section id="brands" className="bg-cream-deep/45 py-24 md:py-32">
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="order-2 lg:order-1">
            <div className="relative">
              <div className="overflow-hidden rounded-lg bg-cream-deep">
                <img
                  src="/images/craft.jpg"
                  alt="Craftsperson turning a piece of timber on a lathe"
                  width={1200}
                  height={1800}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[4/5] w-full object-cover object-center sm:aspect-[5/4] lg:aspect-[4/5]"
                />
              </div>
              <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-cream/20 bg-plum-950/70 px-5 py-4 text-cream backdrop-blur-md sm:left-6 sm:right-auto sm:max-w-[19rem]">
                <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-brass-300">
                  Sourced for the trade
                </p>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-cream/75">
                  If a project specifies a particular brand, tell us — we'll check what we can
                  arrange.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="order-1 lg:order-2">
            <Reveal>
              <SectionHeading
                index="04"
                eyebrow="Brands"
                title={
                  <>
                    The right name,
                    <br className="hidden sm:block" /> sourced{" "}
                    <em className="font-light italic text-brass-600">to order.</em>
                  </>
                }
                description="Our shelves carry a rotating selection of trade-grade brands across plywood, laminates and hardware. Because availability changes with every delivery, we keep the live brand list at the showroom."
              />
            </Reveal>

            <ul className="mt-9 divide-y divide-ink-900/10 border-y border-ink-900/10">
              {sourcingLines.map((line, index) => (
                <Reveal as="li" key={line.label} delay={index * 60}>
                  <div className="flex items-center justify-between gap-4 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-ink-900">{line.label}</p>
                      <p className="mt-0.5 text-xs text-ink-500">{line.note}</p>
                    </div>
                    <Icon name="arrowUpRight" className="size-4 shrink-0 text-ink-500" />
                  </div>
                </Reveal>
              ))}
            </ul>

            <Reveal delay={120}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={whatsappLink(
                    "Hello Laghara Hardwares, could you confirm the brands you currently stock?",
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <WhatsAppIcon className="size-4" />
                  Check brand availability
                </a>
                <p className="max-w-[15rem] text-[0.6875rem] leading-relaxed text-ink-500">
                  We'll confirm the exact brand and range in stock before you travel.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
