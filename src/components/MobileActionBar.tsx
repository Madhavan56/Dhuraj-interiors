import { business, whatsappLink } from "../data/site";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { useLayoutEffect, useRef, useState } from "react";

/** Sticky Call / WhatsApp bar for phones, where the floating bubble is hidden. */
export function MobileActionBar() {
  const barRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  // On short phones the hero is taller than the viewport, so a fixed bar would
  // sit on top of the stats row while it scrolls past. The stats carry the same
  // numbers as the header strip, so the bar stays away until they clear it.
  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const stats = document.getElementById("hero-stats");
      if (!stats) {
        setShown(true);
        return;
      }
      const limit = window.innerHeight - bar.offsetHeight;
      setShown(stats.getBoundingClientRect().bottom <= limit);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div
      ref={barRef}
      inert={!shown}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-20px_rgba(20,16,29,0.5)] backdrop-blur-md transition-transform duration-500 ease-out md:hidden ${
        shown ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="grid grid-cols-2 gap-2 px-3 py-2.5">
        <a
          href={business.phoneHref}
          aria-label={`Call ${business.name} on ${business.phone}`}
          className="btn btn-outline-dark w-full touch-manipulation text-xs"
        >
          <Icon name="phone" className="size-4 shrink-0" />
          Call now
        </a>
        <a
          href={whatsappLink("Hello Dhuraj Interiors, I'd like to discuss an interior project.")}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Dhuraj Interiors on WhatsApp"
          className="btn w-full touch-manipulation bg-[#128c4a] text-xs text-white hover:bg-[#0f7a40]"
        >
          <WhatsAppIcon className="size-4 shrink-0" />
          WhatsApp
        </a>
      </div>
    </div>
  );
}
