import { useEffect, useState } from "react";
import { whatsappLink } from "../data/site";
import { WhatsAppIcon } from "./ui/Icons";

export function FloatingWhatsApp() {
  const [visible, setVisible] = useState(false);
  const [nearContact, setNearContact] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.55);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Step aside while the enquiry form is on screen so the bubble never sits on
  // top of the Send enquiry / Send on WhatsApp buttons on a phone.
  useEffect(() => {
    const contact = document.getElementById("contact");
    if (!contact) return;

    const observer = new IntersectionObserver(
      ([entry]) => setNearContact(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(contact);
    return () => observer.disconnect();
  }, []);

  const shown = visible && !nearContact;

  return (
    <a
      href={whatsappLink("Hello Dhuraj Interiors, I'd like to discuss an interior project.")}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Dhuraj Interiors on WhatsApp"
      aria-hidden={!shown}
      tabIndex={shown ? undefined : -1}
      className={`group fixed bottom-5 right-5 z-40 flex size-14 max-md:hidden items-center justify-center rounded-full bg-[#128c4a] text-white shadow-[0_12px_30px_-8px_rgba(18,140,74,0.6)] transition-all duration-500 hover:scale-105 hover:bg-[#0f7a40] sm:bottom-6 sm:right-6 ${
        shown
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
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
