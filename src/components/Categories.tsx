import { useState } from "react";
import { categories, categoryGroups, whatsappLink, type Category } from "../data/site";
import { useEnquiry } from "../context/EnquiryContext";
import { Dialog } from "./ui/Dialog";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Categories() {
  const [filter, setFilter] = useState<(typeof categoryGroups)[number]>("All");
  const [selected, setSelected] = useState<Category | null>(null);
  const { requestEnquiry } = useEnquiry();

  const visible =
    filter === "All" ? categories : categories.filter((category) => category.group === filter);

  return (
    <section id="products" className="bg-cream-deep/45 py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              index="02"
              eyebrow="Product categories"
              title={
                <>
                  Thirteen aisles,
                  <br className="hidden sm:block" /> one{" "}
                  <em className="font-light italic text-brass-600">showroom.</em>
                </>
              }
              description="Browse the material range by what you're building. Every category is stocked for trade quantities at our Thanjavur showroom."
            />
          </Reveal>

          <Reveal delay={120} className="shrink-0">
            <a
              href={whatsappLink("Hello Laghara Hardwares, could you share your current stock list?")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 text-[0.8125rem] font-medium text-ink-900"
            >
              <span className="grid size-10 place-items-center rounded-full border border-ink-900/20 transition-colors group-hover:border-plum-900 group-hover:bg-plum-900 group-hover:text-cream">
                <WhatsAppIcon className="size-4" />
              </span>
              Ask about stock
            </a>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-wrap gap-2 border-y border-ink-900/10 py-4">
          {categoryGroups.map((group) => {
            const active = filter === group;
            return (
              <button
                key={group}
                type="button"
                onClick={() => setFilter(group)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${
                  active
                    ? "bg-plum-900 text-cream shadow-sm"
                    : "text-ink-700 hover:bg-plum-900/6 hover:text-ink-950"
                }`}
              >
                {group}
                <span className={`ml-1.5 text-[0.625rem] ${active ? "text-cream/50" : "text-ink-500"}`}>
                  {group === "All"
                    ? categories.length
                    : categories.filter((category) => category.group === group).length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
          {visible.map((category, index) => {
            const large = filter === "All" && index === 0;

            return (
              <button
                key={`${filter}-${category.slug}`}
                type="button"
                onClick={() => setSelected(category)}
                aria-label={`Explore ${category.name}`}
                className={`group relative overflow-hidden rounded-lg border border-ink-900/8 bg-cream text-left transition-all duration-500 hover:-translate-y-1 hover:border-ink-900/15 hover:shadow-[0_24px_50px_-30px_rgba(20,16,29,0.45)] ${
                  large ? "sm:col-span-2 sm:row-span-2" : ""
                }`}
              >
                <div className={`relative overflow-hidden ${large ? "h-full min-h-[20rem] sm:min-h-[26rem]" : ""}`}>
                  <img
                    src={category.image}
                    srcSet={`/images/categories/${category.slug}-480.jpg 480w, ${category.image} 960w`}
                    sizes={large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"}
                    alt={category.alt}
                    width={960}
                    height={720}
                    loading="lazy"
                    decoding="async"
                    className={`w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05] ${
                      large ? "h-full min-h-[20rem] sm:min-h-[26rem]" : "aspect-[4/3]"
                    }`}
                  />

                  <div
                    className={`absolute inset-0 ${
                      large
                        ? "bg-gradient-to-t from-plum-950/92 via-plum-950/35 to-plum-950/5"
                        : "bg-gradient-to-t from-plum-950/25 to-transparent opacity-60"
                    }`}
                    aria-hidden="true"
                  />

                  <span className="absolute left-4 top-4 rounded-full bg-plum-950/35 px-2.5 py-1 text-[0.625rem] font-medium tracking-wider text-cream/85 backdrop-blur-sm">
                    {String(categories.indexOf(category) + 1).padStart(2, "0")}
                  </span>

                  <span
                    className={`absolute right-4 top-4 grid size-9 place-items-center rounded-full backdrop-blur-sm transition-all duration-500 ${
                      large
                        ? "bg-cream/15 text-cream group-hover:bg-cream group-hover:text-plum-900"
                        : "translate-y-1 bg-cream/90 text-plum-900 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                    }`}
                    aria-hidden="true"
                  >
                    <Icon name="arrowUpRight" className="size-4" />
                  </span>

                  {large && (
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <span className="eyebrow text-brass-300">{category.group}</span>
                      <h3 className="mt-2 font-display text-[1.9rem] leading-tight text-cream sm:text-[2.35rem]">
                        {category.name}
                      </h3>
                      <p className="mt-2 max-w-sm text-sm leading-relaxed text-cream/70">
                        {category.description}
                      </p>
                      <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cream">
                        Explore
                        <Icon
                          name="arrowRight"
                          className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                        />
                      </span>
                    </div>
                  )}
                </div>

                {!large && (
                  <div className="p-4 sm:p-5">
                    <span className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-brass-600">
                      {category.group}
                    </span>
                    <h3 className="mt-1.5 font-display text-[1.2rem] leading-tight text-ink-950">
                      {category.name}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                      {category.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[0.6875rem] font-semibold text-ink-900">
                      Explore
                      <Icon
                        name="arrowRight"
                        className="size-3 transition-transform duration-500 group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <p className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ink-500">
          <Icon name="sparkle" className="size-3.5 text-brass-600" />
          Stock and finishes change with every delivery — message us for what's available today.
        </p>
      </div>

      <Dialog
        open={selected !== null}
        onClose={() => setSelected(null)}
        label={selected?.name ?? "Category"}
      >
        {selected && (
          <div className="grid sm:grid-cols-2">
            <div className="relative h-56 overflow-hidden bg-cream-deep sm:h-full">
              <img
                src={selected.image}
                alt={selected.alt}
                width={960}
                height={720}
                className="size-full object-cover"
              />
            </div>
            <div className="flex flex-col p-6 sm:p-8">
              <span className="eyebrow text-brass-600">
                <span className="h-px w-6 bg-brass-500" aria-hidden="true" />
                {selected.group}
              </span>
              <h3 className="mt-3 font-display text-[2rem] leading-tight text-ink-950">
                {selected.name}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-700/85">
                {selected.description}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-ink-500">
                Availability, finishes and specifications vary by delivery. Ask the showroom
                for what is in stock now before you travel.
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:mt-auto sm:pt-6">
                <a
                  href={whatsappLink(
                    `Hello Laghara Hardwares, I'd like to enquire about ${selected.name}. Could you share availability and details?`,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary h-11 w-full text-xs"
                >
                  <WhatsAppIcon className="size-4" />
                  Enquire on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => {
                    requestEnquiry(selected.name);
                    setSelected(null);
                  }}
                  className="btn btn-outline-dark h-11 w-full text-xs"
                >
                  Send an enquiry
                  <Icon name="arrowUpRight" className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </section>
  );
}
