import { whatsappLink } from "../data/site";
import { WhatsAppIcon } from "./ui/Icons";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink("Hello Laghara Hardwares, I'd like to enquire about your materials.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Laghara Hardwares on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex size-14 items-center justify-center rounded-full bg-[#128c4a] text-white shadow-[0_12px_30px_-8px_rgba(18,140,74,0.6)] transition-transform duration-300 hover:scale-105 hover:bg-[#0f7a40] sm:bottom-6 sm:right-6"
    >
      <span
        className="absolute inset-0 -z-10 animate-[ping_2.6s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full bg-[#128c4a]/30 motion-reduce:hidden"
        aria-hidden="true"
      />
      <WhatsAppIcon className="size-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-full bg-plum-950 px-3 py-1.5 text-[0.6875rem] font-medium text-cream opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 lg:block">
        Chat on WhatsApp
      </span>
    </a>
  );
}
