import { useEffect, useState } from "react";
import { business, navItems, whatsappLink } from "../data/site";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Logo } from "./ui/Logo";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [active, setActive] = useState("#home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = navItems
      .map((item) => document.querySelector(item.href))
      .filter((el): el is Element => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-42% 0px -50% 0px", threshold: [0, 0.2, 0.6] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const light = !scrolled && !menuOpen;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div
          className={`overflow-hidden bg-plum-950 text-cream/70 transition-[max-height,opacity] duration-500 ${
            scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
          }`}
        >
          <div className="container-page flex h-9 items-center justify-between gap-6 text-[0.6875rem] tracking-wide">
            <p className="flex items-center gap-2.5">
              <span className="size-1.5 rounded-full bg-brass-300" aria-hidden="true" />
              Interior design &amp; custom woodwork in Thanjavur
              <span className="hidden text-cream/30 sm:inline">·</span>
              <span className="hidden sm:inline">Since 1987</span>
            </p>
            <a
              href={business.phoneHref}
              className="hidden items-center gap-2 transition-colors hover:text-cream md:flex"
            >
              <Icon name="phone" className="size-3.5" />
              {business.phone}
            </a>
          </div>
        </div>

        <div
          className={`transition-[background-color,box-shadow,border-color] duration-500 ${
            light
              ? "border-b border-transparent bg-transparent"
              : "border-b border-ink-900/10 bg-cream/95 shadow-[0_8px_30px_-20px_rgba(20,16,29,0.5)] backdrop-blur-md"
          }`}
        >
          <div className="container-page flex h-[4.5rem] items-center justify-between gap-4 lg:h-[5rem]">
            <a
              href="#home"
              aria-label="Dhuraj Interiors — home"
              className="rounded-lg transition-opacity hover:opacity-85"
            >
              <Logo tone={light ? "light" : "dark"} />
            </a>

            <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex xl:gap-8">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  aria-current={active === item.href ? "true" : undefined}
                  className={`link-underline text-[0.8125rem] font-medium tracking-[0.01em] transition-colors ${
                    light
                      ? "text-cream/75 hover:text-cream"
                      : "text-ink-700 hover:text-ink-950"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2.5">
              <a
                href={whatsappLink(
                  "Hello Dhuraj Interiors, I'd like to discuss an interior project.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat with Dhuraj Interiors on WhatsApp"
                className={`grid size-10 place-items-center rounded-full border transition-all hover:scale-105 ${
                  light
                    ? "border-cream/25 text-cream hover:border-cream/60 hover:bg-cream/10"
                    : "border-ink-900/15 text-ink-900 hover:border-ink-900/40 hover:bg-plum-900 hover:text-cream"
                }`}
              >
                <WhatsAppIcon className="size-[1.05rem]" />
              </a>
              <a
                href="#contact"
                className={`btn hidden h-10 px-5 text-xs sm:inline-flex ${
                  light ? "btn-light" : "btn-primary"
                }`}
              >
                Start a project
                <Icon name="arrowUpRight" className="size-3.5" />
              </a>
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                className={`grid size-10 place-items-center rounded-full border transition-colors lg:hidden ${
                  light
                    ? "border-cream/25 text-cream hover:bg-cream/10"
                    : "border-ink-900/15 text-ink-900 hover:bg-ink-900/5"
                }`}
              >
                <Icon name="menu" className="size-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        className={`fixed inset-0 z-[60] flex flex-col bg-plum-950 text-cream transition-[opacity,visibility] duration-500 lg:hidden ${
          menuOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <div className="container-page flex h-[4.5rem] shrink-0 items-center justify-between">
          <Logo tone="light" />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            autoFocus={menuOpen}
            className="grid size-10 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>

        <div className="container-page flex min-h-0 flex-1 flex-col justify-between overflow-y-auto pb-8">
          <nav aria-label="Mobile" className="mt-4">
            <ul className="divide-y divide-cream/10 border-y border-cream/10">
              {navItems.map((item, index) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline justify-between py-3.5"
                  >
                    <span className="flex items-baseline gap-4">
                      <span className="w-5 text-[0.625rem] tabular-nums tracking-widest text-brass-300/80">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-display text-[1.75rem] leading-tight transition-colors group-hover:text-brass-300">
                        {item.label}
                      </span>
                    </span>
                    <Icon
                      name="arrowUpRight"
                      className="size-4 -translate-x-1 text-cream/30 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    />
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-8 space-y-5 text-sm">
            <a
              href={whatsappLink(
                "Hello Dhuraj Interiors, I'd like to discuss an interior project.",
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn w-full bg-[#128c4a] text-white"
            >
              <WhatsAppIcon className="size-4" />
              WhatsApp us
            </a>
            <div className="grid gap-2 text-cream/60">
              <a href={business.phoneHref} className="flex items-center gap-3 hover:text-cream">
                <Icon name="phone" className="size-4 text-brass-300" />
                {business.phone}
              </a>
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-3 break-all hover:text-cream"
              >
                <Icon name="mail" className="size-4 shrink-0 text-brass-300" />
                {business.email}
              </a>
              <p className="flex items-start gap-3">
                <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-brass-300" />
                <span>{business.address}</span>
              </p>
              <p className="flex items-center gap-3">
                <Icon name="clock" className="size-4 text-brass-300" />
                {business.hours}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
