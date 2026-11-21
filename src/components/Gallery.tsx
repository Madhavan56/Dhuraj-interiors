import { useCallback, useEffect, useRef, useState } from "react";
import { gallery } from "../data/site";
import { Icon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Gallery() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback((direction: number) => {
    setOpenIndex((current) =>
      current === null ? null : (current + direction + gallery.length) % gallery.length,
    );
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close, step]);

  const spanFor = (index: number) => {
    if (index === 0) return "col-span-2 row-span-2";
    if (index === gallery.length - 1) return "col-span-2";
    return "";
  };

  return (
    <section id="gallery" className="bg-cream py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              index="05"
              eyebrow="Gallery"
              title={
                <>
                  A sense of
                  <br className="hidden sm:block" /> the{" "}
                  <em className="font-light italic text-brass-600">work.</em>
                </>
              }
              description="Kitchens, wardrobes, flooring and woodwork — the materials and finishes we bring together."
            />
          </Reveal>
          <Reveal delay={100} className="shrink-0">
            <p className="max-w-[16rem] text-xs leading-relaxed text-ink-500">
              Click any image to view it larger. Use the arrow keys to move through the gallery.
            </p>
          </Reveal>
        </div>

        <div className="mt-12 grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[11rem] sm:grid-cols-3 lg:auto-rows-[12.5rem] lg:grid-cols-4 lg:gap-4">
          {gallery.map((item, index) => (
            <Reveal
              key={item.src + item.caption}
              delay={Math.min(index, 5) * 50}
              className={spanFor(index)}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                aria-label={`View larger: ${item.caption}`}
                className="group relative block h-full w-full overflow-hidden rounded-lg bg-cream-deep"
              >
                <img
                  src={item.src}
                  alt={item.alt}
                  width={960}
                  height={720}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover transition-transform duration-[1000ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
                />
                <span
                  className="absolute inset-0 bg-gradient-to-t from-plum-950/75 via-plum-950/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  aria-hidden="true"
                />
                <span className="absolute inset-x-4 bottom-4 flex translate-y-2 items-center justify-between gap-2 text-cream opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
                    {item.caption}
                  </span>
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-cream/15 backdrop-blur-sm">
                    <Icon name="arrowUpRight" className="size-3.5" />
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>

        <p className="mt-6 text-[0.6875rem] leading-relaxed text-ink-500">
          Images are representative of the styles and finishes we work with. Ask at the
          studio to see completed project photography.
        </p>
      </div>

      {isOpen && openIndex !== null && (
        <div
          className="fixed inset-0 z-[90] flex flex-col bg-plum-950/96 p-4 text-cream backdrop-blur-sm sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-cream/55">
              {gallery[openIndex].caption}
              <span className="ml-2 text-cream/30">
                {String(openIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
              </span>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close image viewer"
              className="grid size-10 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
            >
              <Icon name="close" className="size-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center py-4">
            <img
              src={gallery[openIndex].src}
              alt={gallery[openIndex].alt}
              className="max-h-full max-w-full rounded-md object-contain"
            />
          </div>

          <div className="mx-auto flex items-center gap-3 pb-1">
            <button
              type="button"
              onClick={() => step(-1)}
              aria-label="Previous image"
              className="grid size-11 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
            >
              <Icon name="arrowLeft" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => step(1)}
              aria-label="Next image"
              className="grid size-11 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
            >
              <Icon name="arrowRight" className="size-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
