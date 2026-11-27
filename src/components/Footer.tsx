import { business, navItems, services, whatsappLink } from "../data/site";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Logo } from "./ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden border-t border-ink-900/10 bg-cream-deep text-ink-900">
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full border border-ink-900/[0.06]"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <div className="lg:col-span-4">
            <a href="#home" aria-label="Dhuraj Interiors — home" className="inline-block">
              <Logo />
            </a>
            <p className="mt-5 max-w-sm text-[0.8125rem] leading-relaxed text-ink-500">
              {business.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={whatsappLink(
                  "Hello Dhuraj Interiors, I'd like to discuss an interior project.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-900/15 px-4 text-xs font-medium transition-colors hover:border-ink-900/40 hover:bg-ink-900/5"
              >
                <WhatsAppIcon className="size-3.5" />
                WhatsApp
              </a>
              <a
                href={business.phoneHref}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-ink-900/15 px-4 text-xs font-medium transition-colors hover:border-ink-900/40 hover:bg-ink-900/5"
              >
                <Icon name="phone" className="size-3.5" />
                Call
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-600">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
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

          <div className="lg:col-span-3">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-600">
              Services
            </h3>
            <ul className="mt-4 space-y-2.5">
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

          <div className="lg:col-span-3">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-600">
              Visit the studio
            </h3>
            <ul className="mt-4 space-y-3 text-[0.8125rem] text-ink-500">
              <li>
                <a
                  href={business.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-ink-950"
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
              <li className="flex items-center gap-2.5">
                <Icon name="clock" className="size-4 shrink-0 text-ink-500/70" />
                {business.hours}
              </li>
            </ul>
            <p className="mt-4 text-[0.6875rem] leading-relaxed text-ink-500/80">
              {business.serviceAreas}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-ink-900/10 py-6 text-[0.6875rem] text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Dhuraj Interiors. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p>Interior design &amp; custom woodwork, Thanjavur</p>
            <a href="#contact" className="transition-colors hover:text-ink-950">
              Start a project
            </a>
            <a
              href="#home"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-ink-950"
            >
              Back to top
              <Icon name="arrowUpRight" className="size-3 -rotate-45" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
