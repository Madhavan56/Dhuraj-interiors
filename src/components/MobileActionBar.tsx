import { business, whatsappLink } from "../data/site";
import { Icon, WhatsAppIcon } from "./ui/Icons";

/** Sticky Call / WhatsApp bar for phones, where the floating bubble is hidden. */
export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-900/10 bg-cream/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_-20px_rgba(20,16,29,0.5)] backdrop-blur-md md:hidden">
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
