import { useCallback, useEffect, useRef, useState } from "react";
import { services } from "../data/site";
import { useEnquiry } from "../context/EnquiryContext";
import { Icon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Services() {
  const { requestEnquiry } = useEnquiry();
  const [active, setActive] = useState(0);
  // Only the active photo is fetched up front; the rest load the first time
  // their row is hovered, so the page's main images are not competing with them.
  const [loaded, setLoaded] = useState<number[]>([0]);
  const [viewing, setViewing] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const current = services[active];

  const focusService = (index: number) => {
    setActive(index);
    setLoaded((current) => (current.includes(index) ? current : [...current, index]));
  };

  const closeViewer = useCallback(() => setViewing(null), []);
  const stepViewer = useCallback((direction: number) => {
    setViewing((index) =>
      index === null ? null : (index + direction + services.length) % services.length,
    );
  }, []);

  // Warm the remaining photos once the section is near the viewport on
  // hover-capable screens, so each swap fades a decoded image instead of
  // stalling on a download. Touch devices still fetch only what they view.
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (min-width: 1024px)").matches) return;
    const node = sectionRef.current;
    if (!node) return;

    let timer = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        timer = window.setTimeout(() => setLoaded(services.map((_, index) => index)), 400);
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (viewing === null) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowRight") stepViewer(1);
      if (event.key === "ArrowLeft") stepViewer(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [viewing, closeViewer, stepViewer]);

  const onTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;

    // Only treat a mainly-horizontal drag as a swipe, so it never fights a scroll.
    if (Math.abs(dx) < 45 || Math.abs(dx) <= Math.abs(dy)) return;
    stepViewer(dx < 0 ? 1 : -1);
  };

  return (
    <section ref={sectionRef} id="services" className="relative bg-plum-950 py-24 text-cream md:py-32">
      {/* Decoration is clipped here, not on the section: an overflow-hidden ancestor
          would stop the sticky photo panel below from sticking while you scroll. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-40 top-0 size-[34rem] rounded-full border border-cream/[0.06]" />
        <div className="absolute -left-24 bottom-0 size-80 rounded-full border border-cream/[0.05]" />
      </div>

      <div className="container-page relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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
              description="Six services, one team. We design, make and install interiors made for the way you live. Hover a service to see the work."
            />
          </Reveal>

          <Reveal delay={140} className="shrink-0">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 border-b border-brass-300/50 pb-1 text-xs font-semibold text-brass-300 transition-colors hover:border-cream hover:text-cream"
            >
              Book a consultation
              <Icon name="arrowRight" className="size-3.5" />
            </a>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ul className="border-b border-cream/12">
              {services.map((service, index) => {
                const isActive = active === index;

                return (
                  <Reveal as="li" key={service.title} delay={index * 50}>
                    <div
                      onMouseEnter={() => focusService(index)}
                      onFocus={() => focusService(index)}
                      className="group border-t border-cream/12 py-6"
                    >
                      <div className="flex items-start gap-4 sm:gap-6">
                        <span
                          className={`mt-2.5 text-[0.625rem] tabular-nums tracking-[0.2em] transition-colors duration-700 ${
                            isActive ? "text-brass-300" : "text-cream/25"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <div className="min-w-0 flex-1">
                          <h3
                            className={`font-display text-[1.45rem] leading-tight transition-colors duration-700 sm:text-[1.65rem] ${
                              isActive ? "text-brass-300" : "text-cream"
                            }`}
                          >
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

                        <button
                          type="button"
                          onClick={() => setViewing(index)}
                          aria-label={`View larger: ${service.title}`}
                          className="shrink-0 overflow-hidden rounded ring-1 ring-cream/10 transition-transform active:scale-95 lg:hidden"
                        >
                          <img
                            src={service.image}
                            alt={service.imageAlt}
                            loading="lazy"
                            decoding="async"
                            className="size-20 object-cover sm:size-24"
                          />
                        </button>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="lg:sticky lg:top-24">
              <Reveal delay={120}>
                <div className="relative aspect-[4/5] max-h-[calc(100svh-8.5rem)] overflow-hidden rounded-lg bg-plum-900 ring-1 ring-cream/10">
                  {loaded.map((index) => {
                    const service = services[index];
                    return (
                      <img
                        key={service.title}
                        src={service.image}
                        alt={active === index ? service.imageAlt : ""}
                        aria-hidden={active === index ? undefined : true}
                        loading="lazy"
                        decoding="async"
                        className={`absolute inset-0 size-full object-cover transition-[opacity,transform] duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] ${
                          active === index
                            ? "scale-100 opacity-100"
                            : "scale-[1.06] opacity-0"
                        }`}
                      />
                    );
                  })}

                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum-950/90 via-plum-950/40 to-transparent p-6 pt-16"
                    aria-live="polite"
                  >
                    <div className="grid">
                      {services.map((service, index) => (
                        <div
                          key={service.title}
                          aria-hidden={active === index ? undefined : true}
                          className={`col-start-1 row-start-1 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            active === index ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <p className="text-[0.625rem] uppercase tracking-[0.2em] text-brass-300">
                            {String(index + 1).padStart(2, "0")}
                          </p>
                          <p className="mt-2 font-display text-[1.25rem] leading-tight text-cream">
                            {service.title}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 inline-flex items-center gap-1.5 text-[0.625rem] uppercase tracking-[0.14em] text-cream/50">
                      View larger
                      <Icon name="arrowUpRight" className="size-3" />
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewing(active)}
                    aria-label={`View larger: ${current.title}`}
                    className="absolute inset-0 z-10 cursor-zoom-in"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </div>

      {viewing !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${services[viewing].title} photo`}
          className="fixed inset-0 z-[90] flex flex-col bg-plum-950/95 backdrop-blur-md"
          onClick={closeViewer}
        >
          <div className="flex items-center justify-between gap-4 px-4 pt-4 sm:px-6">
            <p className="text-[0.6875rem] uppercase tracking-[0.16em] text-cream/70">
              {String(viewing + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")} ·{" "}
              {services[viewing].title}
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={closeViewer}
              aria-label="Close photo"
              className="grid size-10 shrink-0 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:border-cream/50 hover:bg-cream/10"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>

          <div
            className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-4 py-4 sm:px-6"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <img
              src={services[viewing].image}
              alt={services[viewing].imageAlt}
              decoding="async"
              onClick={(event) => event.stopPropagation()}
              className="max-h-full max-w-full rounded object-contain"
            />

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                stepViewer(-1);
              }}
              aria-label="Previous service photo"
              className="absolute left-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream backdrop-blur-sm transition-colors hover:bg-cream/20 sm:left-3"
            >
              <Icon name="arrowLeft" className="size-4" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                stepViewer(1);
              }}
              aria-label="Next service photo"
              className="absolute right-1 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-cream/10 text-cream backdrop-blur-sm transition-colors hover:bg-cream/20 sm:right-3"
            >
              <Icon name="arrowRight" className="size-4" />
            </button>
          </div>

          <p className="px-4 pb-6 text-center text-[0.6875rem] text-cream/40">
            Swipe or use the arrow keys to move between service photos. Tap outside the photo to
            close.
          </p>
        </div>
      )}
    </section>
  );
}
