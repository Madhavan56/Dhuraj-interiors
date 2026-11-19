import { business, categories, navItems, whatsappLink } from "../data/site";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Logo } from "./ui/Logo";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-plum-950 text-cream">
      <div
        className="pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full border border-cream/[0.06]"
        aria-hidden="true"
      />
      <div className="container-page relative">
        <div className="grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12 lg:gap-10 lg:py-20">
          <div className="lg:col-span-4">
            <a href="#home" aria-label="Laghara Hardwares — home" className="inline-block">
              <Logo tone="light" />
            </a>
            <p className="mt-5 max-w-sm text-[0.8125rem] leading-relaxed text-cream/55">
              {business.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <a
                href={whatsappLink("Hello Laghara Hardwares, I'd like to enquire about your materials.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-medium transition-colors hover:border-cream/50 hover:bg-cream/5"
              >
                <WhatsAppIcon className="size-3.5" />
                WhatsApp
              </a>
              <a
                href={business.phoneHref}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-cream/20 px-4 text-xs font-medium transition-colors hover:border-cream/50 hover:bg-cream/5"
              >
                <Icon name="phone" className="size-3.5" />
                Call
              </a>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-300">
              Explore
            </h3>
            <ul className="mt-4 space-y-2.5">
              {navItems.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-[0.8125rem] text-cream/60 transition-colors hover:text-cream"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-300">
              Product categories
            </h3>
            <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-1">
              {categories.slice(0, 7).map((category) => (
                <li key={category.slug}>
                  <a
                    href="#products"
                    className="text-[0.8125rem] text-cream/60 transition-colors hover:text-cream"
                  >
                    {category.name}
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="#products"
                  className="text-[0.8125rem] font-medium text-cream/85 transition-colors hover:text-cream"
                >
                  All 13 categories
                </a>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h3 className="text-[0.625rem] font-semibold uppercase tracking-[0.22em] text-brass-300">
              Visit the showroom
            </h3>
            <ul className="mt-4 space-y-3 text-[0.8125rem] text-cream/60">
              <li>
                <a
                  href={business.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-2.5 transition-colors hover:text-cream"
                >
                  <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-cream/35" />
                  <span className="leading-relaxed">{business.address}</span>
                </a>
              </li>
              <li>
                <a
                  href={business.phoneHref}
                  className="flex items-center gap-2.5 transition-colors hover:text-cream"
                >
                  <Icon name="phone" className="size-4 shrink-0 text-cream/35" />
                  {business.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-start gap-2.5 break-all transition-colors hover:text-cream"
                >
                  <Icon name="mail" className="mt-0.5 size-4 shrink-0 text-cream/35" />
                  {business.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Icon name="clock" className="size-4 shrink-0 text-cream/35" />
                {business.hours}
              </li>
            </ul>

            <a
              href={business.websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[0.8125rem] text-cream/70 underline decoration-cream/25 underline-offset-4 transition-colors hover:text-cream"
            >
              {business.website}
              <Icon name="arrowUpRight" className="size-3.5" />
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-cream/10 py-6 text-[0.6875rem] text-cream/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Laghara Hardwares. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <p>All prices are inclusive of GST.</p>
            <a href="#contact" className="transition-colors hover:text-cream">
              Thanjavur, Tamil Nadu
            </a>
            <a
              href="#home"
              className="inline-flex items-center gap-1.5 transition-colors hover:text-cream"
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
