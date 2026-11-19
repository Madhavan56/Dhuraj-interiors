import { stats } from "../data/site";
import { Icon } from "./ui/Icons";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-[100svh] flex-col overflow-hidden bg-plum-950 text-cream"
    >
      <div className="absolute inset-0">
        <img
          src="/images/hero.jpg"
          alt="Warm timber-panelled living room and fitted kitchen"
          width={1920}
          height={1280}
          fetchPriority="high"
          decoding="async"
          className="hero-image size-full object-cover object-[62%_center]"
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-plum-950 via-plum-950/82 to-plum-950/25"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-plum-950 via-plum-950/10 to-plum-950/35"
          aria-hidden="true"
        />
      </div>

      <div className="container-page relative z-10 flex flex-1 flex-col justify-end pb-24 pt-40 sm:pb-10 sm:pt-44 lg:pt-40">
        <div className="max-w-4xl">
          <p className="hero-fade eyebrow text-cream/65" style={{ "--delay": "150ms" } as React.CSSProperties}>
            <span className="size-1.5 bg-brass-300" aria-hidden="true" />
            Thanjavur · Interior &amp; furniture materials
          </p>

          <h1 className="mt-7 text-[clamp(2.7rem,7.2vw,6.2rem)] leading-[0.96] tracking-[-0.03em]">
            <span className="hero-rise">
              <span style={{ "--delay": "220ms" } as React.CSSProperties}>Everything for</span>
            </span>
            <span className="hero-rise">
              <span style={{ "--delay": "330ms" } as React.CSSProperties}>the build.</span>
            </span>
            <span className="hero-rise">
              <span
                className="text-[0.86em] font-light italic text-brass-300"
                style={{ "--delay": "440ms" } as React.CSSProperties}
              >
                Delivered fast.
              </span>
            </span>
          </h1>

          <p
            className="hero-fade mt-7 max-w-xl text-[0.9375rem] leading-relaxed text-cream/75 sm:text-base"
            style={{ "--delay": "600ms" } as React.CSSProperties}
          >
            Plywood, laminates and every fitting in between — thirteen categories of
            trade-grade material, in stock at our Thanjavur showroom and delivered across
            Tamil Nadu.
          </p>

          <div
            className="hero-fade mt-9 flex flex-wrap items-center gap-3"
            style={{ "--delay": "720ms" } as React.CSSProperties}
          >
            <a href="#products" className="btn btn-light">
              Explore products
              <Icon name="arrowRight" className="size-4" />
            </a>
            <a href="#contact" className="btn btn-outline">
              Contact us
              <Icon name="arrowUpRight" className="size-4" />
            </a>
          </div>
        </div>

        <div
          className="hero-fade-in mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-cream/15 pt-5 sm:mt-16 lg:mt-16"
          style={{ "--delay": "900ms" } as React.CSSProperties}
        >
          <dl className="grid w-full grid-cols-2 gap-x-6 gap-y-5 sm:w-auto sm:grid-cols-4 sm:gap-x-10 lg:gap-x-14">
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-[1.65rem] leading-none text-cream sm:text-2xl">
                  {stat.value}
                </dd>
                <p className="mt-1.5 text-[0.6875rem] leading-snug tracking-wide text-cream/50">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
