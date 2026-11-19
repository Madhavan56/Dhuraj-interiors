import { testimonials } from "../data/site";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

export function Testimonials() {
  return (
    <section className="relative overflow-hidden bg-plum-950 py-24 text-cream md:py-32">
      <div
        className="pointer-events-none absolute -left-40 top-10 size-[30rem] rounded-full border border-cream/[0.06]"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <Reveal>
          <SectionHeading
            index="06"
            eyebrow="Client feedback"
            tone="light"
            title={
              <>
                Kind words, from{" "}
                <em className="font-light italic text-brass-300">real homes.</em>
              </>
            }
            description="A few notes shared by clients who trusted us with their kitchens, wardrobes and interiors."
          />
        </Reveal>

        <div className="mt-12 grid gap-5 md:grid-cols-3 lg:gap-6">
          {testimonials.map((testimonial, index) => (
            <Reveal key={testimonial.name} delay={index * 80}>
              <figure className="flex h-full flex-col rounded-lg border border-cream/12 p-6 sm:p-7">
                <span
                  className="font-display text-[3rem] leading-[0.7] text-brass-300/70"
                  aria-hidden="true"
                >
                  &ldquo;
                </span>
                <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-cream/75">
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-cream/10 pt-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-cream/15 text-[0.6875rem] font-semibold tracking-wider text-brass-300">
                    {testimonial.name.slice(0, 1)}
                  </span>
                  <span className="text-xs font-medium text-cream/85">{testimonial.name}</span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
