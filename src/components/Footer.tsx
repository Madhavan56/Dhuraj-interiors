import { business, navItems, services, whatsappLink } from "../data/site";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Logo } from "./ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate overflow-hidden border-t border-ink-900/10 bg-cream-deep text-ink-900">
      {/* The brand lockup, blown up and tinted so it fills the footer rather
          than sitting on it as a panel. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center gap-4 opacity-[0.045] sm:gap-6 lg:gap-8"
      >
        <img
          src="/logo-mark.svg"
          alt=""
          className="h-20 w-20 shrink-0 sm:h-28 sm:w-28 lg:h-36 lg:w-36"
        />
        <span className="whitespace-nowrap font-display text-[clamp(2.25rem,7vw,5.5rem)] leading-[0.9] tracking-[-0.03em] text-ink-950">
          Dhuraj Interiors
        </span>
      </div>

      <div className="container-page relative">
        <div className="grid gap-x-10 gap-y-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-x-0 lg:py-20">
          <div className="lg:col-span-4 lg:pr-14">
            <a href="#home" aria-label="Dhuraj Interiors — home" className="inline-block">
              <Logo />
            </a>
            <p className="mt-6 max-w-sm text-[0.8125rem] leading-relaxed text-ink-500">
              {business.description}
            </p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <a
                href={whatsappLink(
                  "Hello Dhuraj Interiors, I'd like to discuss an interior project.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-full border border-ink-900/15 bg-cream/60 px-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-700 transition-colors hover:border-ink-900/35 hover:bg-cream hover:text-ink-950"
              >
                <WhatsAppIcon className="size-3.5" />
                WhatsApp
              </a>
              <a
                href={business.phoneHref}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-ink-900/15 bg-cream/60 px-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-ink-700 transition-colors hover:border-ink-900/35 hover:bg-cream hover:text-ink-950"
              >
                <Icon name="phone" className="size-3.5" />
                Call
              </a>
            </div>

            <p className="mt-8 flex items-center gap-3 text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-600">
              <span className="h-px w-8 bg-brass-500/50" aria-hidden="true" />
              Crafting interiors since {business.founded}
            </p>
          </div>

          <div className="lg:col-span-2 lg:border-l lg:border-ink-900/10 lg:pl-8">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-600">
              Explore
            </h3>
            <ul className="mt-5 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[0.8125rem] text-ink-500 transition-colors hover:text-ink-950"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 lg:border-l lg:border-ink-900/10 lg:pl-8">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-600">
              Services
            </h3>
            <ul className="mt-5 space-y-2.5">
              {services.map((service) => (
                <li key={service.title}>
                  <a
                    href="#services"
                    className="text-[0.8125rem] text-ink-500 transition-colors hover:text-ink-950"
                  >
                    {service.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3 lg:border-l lg:border-ink-900/10 lg:pl-8">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-600">
              Visit the studio
            </h3>
            <ul className="mt-5 space-y-3.5 text-[0.8125rem] text-ink-500">
              <li>
                <a
                  href={business.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2.5 transition-colors hover:text-ink-950"
                >
                  <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-ink-500/70" />
                  <span className="leading-relaxed">{business.address}</span>
                </a>
              </li>
              <li>
                <a
                  href={business.phoneHref}
                  className="flex items-center gap-2.5 transition-colors hover:text-ink-950"
                >
                  <Icon name="phone" className="size-4 shrink-0 text-ink-500/70" />
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-start gap-2.5 break-all transition-colors hover:text-ink-950"
                >
                  <Icon name="mail" className="mt-0.5 size-4 shrink-0 text-ink-500/70" />
                  {business.email}
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Icon name="clock" className="mt-0.5 size-4 shrink-0 text-ink-500/70" />
                <span className="leading-relaxed">{business.hours}</span>
              </li>
            </ul>

            <div className="mt-6 border-t border-ink-900/10 pt-4">
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-500/70">
                Serving
              </p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-ink-500">
                {business.serviceAreas}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-ink-900/10 py-6 text-[0.6875rem] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Dhuraj Interiors. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <p className="hidden sm:inline">Interior design &amp; custom woodwork, Thanjavur</p>
            <a href="#contact" className="font-medium text-ink-700 transition-colors hover:text-ink-950">
              Start a project
            </a>
            <a
              href="#home"
              aria-label="Back to top"
              className="grid size-9 place-items-center rounded-full border border-ink-900/15 transition-colors hover:border-ink-900/35 hover:bg-cream hover:text-ink-950"
            >
              <Icon name="arrowUpRight" className="size-3.5 -rotate-45" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
