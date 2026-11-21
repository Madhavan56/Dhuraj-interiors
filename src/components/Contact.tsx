import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  budgetOptions,
  business,
  enquiryTypes,
  web3formsAccessKey,
  whatsappLink,
} from "../data/site";
import { useEnquiry } from "../context/EnquiryContext";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

type Fields = {
  name: string;
  phone: string;
  email: string;
  type: string;
  budget: string;
  message: string;
};

type Errors = Partial<Record<keyof Fields, string>>;

const emptyFields: Fields = {
  name: "",
  phone: "",
  email: "",
  type: enquiryTypes[0],
  budget: budgetOptions[0],
  message: "",
};

type Status = "idle" | "sending" | "sent" | "error" | "whatsapp";

// 16px on phones — anything smaller makes iOS Safari zoom when a field is tapped.
const inputClass =
  "w-full rounded-md border border-ink-900/15 bg-cream px-3.5 py-3 text-base text-ink-900 placeholder:text-ink-500/60 transition-colors focus:border-plum-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-plum-900/10 sm:text-sm";

export function Contact() {
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const { prefill } = useEnquiry();
  const messageRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!prefill) return;
    setFields((current) => ({
      ...current,
      type: prefill.type,
      message: prefill.message,
    }));
    setStatus("idle");
    setErrors({});
    const timer = window.setTimeout(() => messageRef.current?.focus({ preventScroll: true }), 500);
    return () => window.clearTimeout(timer);
  }, [prefill]);

  const update = (key: keyof Fields, value: string) => {
    setFields((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
    setStatus("idle");
  };

  const validate = () => {
    const next: Errors = {};
    if (fields.name.trim().length < 2) next.name = "Please tell us your name.";
    const digits = fields.phone.replace(/[^\d]/g, "");
    if (digits.length < 7 || digits.length > 15) next.phone = "Enter a valid phone number.";
    if (fields.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fields.email.trim())) {
      next.email = "Enter a valid email address, or leave it blank.";
    }
    if (fields.message.trim().length < 5) next.message = "Add a short note about what you need.";
    setErrors(next);

    // On a phone the error can sit above the fold, so bring the first bad field into view.
    const firstInvalid = (["name", "phone", "email", "message"] as const).find((key) => next[key]);
    if (firstInvalid) {
      window.setTimeout(() => {
        document
          .getElementById(firstInvalid)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
        document.getElementById(firstInvalid)?.focus({ preventScroll: true });
      }, 60);
    }

    return Object.keys(next).length === 0;
  };

  const buildMessage = () =>
    [
      `New enquiry — ${fields.type}`,
      "",
      `Name: ${fields.name.trim()}`,
      `Phone: ${fields.phone.trim()}`,
      fields.email.trim() ? `Email: ${fields.email.trim()}` : null,
      `Budget: ${fields.budget}`,
      "",
      fields.message.trim(),
    ]
      .filter((line) => line !== null)
      .join("\n");

  // Phones block `window.open` from a submit handler and leave a blank tab, so
  // navigate in place there; desktops still get a new tab.
  const openLink = (href: string) => {
    const onTouchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

    if (onTouchDevice) {
      window.location.href = href;
      return;
    }

    const tab = window.open(href, "_blank", "noopener,noreferrer");
    if (!tab) window.location.href = href;
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate() || status === "sending") return;
    setStatus("sending");

    // Form-encoded rather than JSON on purpose: Web3Forms rejects the CORS
    // preflight that a JSON content type would trigger, and a simple request
    // never sends one.
    const payload = new URLSearchParams({
      access_key: web3formsAccessKey,
      subject: `New enquiry — ${fields.type}`,
      from_name: `${business.name} website`,
      name: fields.name.trim(),
      phone: fields.phone.trim(),
      project_type: fields.type,
      budget: fields.budget,
      message: fields.message.trim(),
    });
    // Left out when blank, so the reply-to falls back to the key's owner.
    if (fields.email.trim()) payload.set("email", fields.email.trim());

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: payload,
      });
      const result = (await response.json()) as { success?: boolean };
      if (!response.ok || !result.success) throw new Error("Web3Forms rejected the enquiry.");
      setFields(emptyFields);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  const onWhatsApp = () => {
    if (!validate()) return;
    setStatus("whatsapp");
    openLink(whatsappLink(buildMessage()));
  };

  return (
    <section id="contact" className="bg-cream-deep/45 py-24 md:py-32">
      <div className="container-page">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <Reveal>
              <SectionHeading
                index="06"
                eyebrow="Start a project"
                title={
                  <>
                    Let's design a home
                    <br className="hidden sm:block" /> that{" "}
                    <em className="font-light italic text-brass-600">fits you.</em>
                  </>
                }
                description="Tell us what you have in mind — a kitchen, wardrobes or a full home. We'll arrange a consultation at our studio or on site."
              />
            </Reveal>

            <div className="mt-9 divide-y divide-ink-900/10 border-y border-ink-900/10">
              <Reveal delay={60}>
                <a
                  href={business.mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 py-4"
                >
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-plum-900/[0.06] text-plum-800">
                    <Icon name="pin" className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-ink-500">
                      Visit us
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-900 transition-colors group-hover:text-iris-700">
                      {business.address}
                    </span>
                  </span>
                  <Icon name="arrowUpRight" className="ml-auto mt-1 size-4 shrink-0 text-ink-500" />
                </a>
              </Reveal>

              <Reveal delay={100}>
                <a href={business.phoneHref} className="group flex items-start gap-4 py-4">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-plum-900/[0.06] text-plum-800">
                    <Icon name="phone" className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-ink-500">
                      Call us
                    </span>
                    <span className="mt-1 block text-sm text-ink-900 transition-colors group-hover:text-iris-700">
                      {business.phone}
                    </span>
                  </span>
                </a>
              </Reveal>

              <Reveal delay={140}>
                <a href={`mailto:${business.email}`} className="group flex items-start gap-4 py-4">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-plum-900/[0.06] text-plum-800">
                    <Icon name="mail" className="size-4" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-ink-500">
                      Email us
                    </span>
                    <span className="mt-1 block break-all text-sm text-ink-900 transition-colors group-hover:text-iris-700">
                      {business.email}
                    </span>
                  </span>
                </a>
              </Reveal>

              <Reveal delay={180}>
                <div className="flex items-start gap-4 py-4">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-plum-900/[0.06] text-plum-800">
                    <Icon name="clock" className="size-4" />
                  </span>
                  <span>
                    <span className="block text-[0.625rem] uppercase tracking-[0.18em] text-ink-500">
                      Hours
                    </span>
                    <span className="mt-1 block text-sm text-ink-900">{business.hours}</span>
                    <span className="mt-0.5 block text-xs text-ink-500">
                      Consultations at the studio or on site
                    </span>
                  </span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={120}>
              <a
                href={whatsappLink(
                  "Hello Dhuraj Interiors, I'd like to discuss an interior project.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-7 w-full sm:w-auto"
              >
                <WhatsAppIcon className="size-4" />
                Chat on WhatsApp
              </a>
            </Reveal>
          </div>

          <Reveal delay={100} className="lg:col-span-7">
            <div className="rounded-xl border border-ink-900/10 bg-cream p-6 shadow-[0_30px_60px_-45px_rgba(20,16,29,0.5)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display text-[1.6rem] leading-tight text-ink-950">
                    Tell us about your project
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-500">
                    Fill in the details and we'll reply within one working day.
                  </p>
                </div>
                <span className="hidden size-10 shrink-0 place-items-center rounded-full bg-plum-900/[0.06] text-plum-800 sm:grid">
                  <Icon name="mail" className="size-4" />
                </span>
              </div>

              <form onSubmit={onSubmit} noValidate className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-ink-700">
                      Name <span className="text-brass-600">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your name"
                      value={fields.name}
                      onChange={(event) => update("name", event.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "name-error" : undefined}
                      className={inputClass}
                    />
                    {errors.name && (
                      <p id="name-error" className="mt-1.5 text-[0.6875rem] text-red-700">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="mb-1.5 block text-xs font-medium text-ink-700">
                      Phone <span className="text-brass-600">*</span>
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="+91"
                      value={fields.phone}
                      onChange={(event) => update("phone", event.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? "phone-error" : undefined}
                      className={inputClass}
                    />
                    {errors.phone && (
                      <p id="phone-error" className="mt-1.5 text-[0.6875rem] text-red-700">
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="type" className="mb-1.5 block text-xs font-medium text-ink-700">
                      Project type
                    </label>
                    <div className="relative">
                      <select
                        id="type"
                        name="type"
                        value={fields.type}
                        onChange={(event) => update("type", event.target.value)}
                        className={`${inputClass} appearance-none pr-9`}
                      >
                        {enquiryTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <Icon
                        name="chevronDown"
                        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="budget" className="mb-1.5 block text-xs font-medium text-ink-700">
                      Budget <span className="font-normal text-ink-500">(approx.)</span>
                    </label>
                    <div className="relative">
                      <select
                        id="budget"
                        name="budget"
                        value={fields.budget}
                        onChange={(event) => update("budget", event.target.value)}
                        className={`${inputClass} appearance-none pr-9`}
                      >
                        {budgetOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <Icon
                        name="chevronDown"
                        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-500"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-ink-700">
                      Email <span className="font-normal text-ink-500">(optional)</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={fields.email}
                      onChange={(event) => update("email", event.target.value)}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "email-error" : undefined}
                      className={inputClass}
                    />
                    {errors.email && (
                      <p id="email-error" className="mt-1.5 text-[0.6875rem] text-red-700">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label htmlFor="message" className="mb-1.5 block text-xs font-medium text-ink-700">
                    Message <span className="text-brass-600">*</span>
                  </label>
                  <textarea
                    ref={messageRef}
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell us about the space, the work you're planning and where it is."
                    value={fields.message}
                    onChange={(event) => update("message", event.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "message-error" : undefined}
                    className={`${inputClass} resize-none leading-relaxed`}
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-1.5 text-[0.6875rem] text-red-700">
                      {errors.message}
                    </p>
                  )}
                </div>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="btn btn-primary w-full touch-manipulation disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <Icon name="mail" className="size-4 shrink-0" />
                    {status === "sending" ? "Sending…" : "Send enquiry"}
                  </button>
                  <button
                    type="button"
                    onClick={onWhatsApp}
                    className="btn btn-outline-dark w-full touch-manipulation"
                  >
                    <WhatsAppIcon className="size-4 shrink-0" />
                    Send on WhatsApp
                  </button>
                </div>

                <p aria-live="polite" className="mt-3 min-h-4 text-[0.6875rem] leading-relaxed">
                  {status === "sent" && (
                    <span className="flex items-start gap-1.5 text-iris-700">
                      <Icon name="check" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
                      Thank you — your enquiry is with us. We'll reply within one working day.
                    </span>
                  )}
                  {status === "error" && (
                    <span className="flex items-start gap-1.5 text-red-700">
                      <Icon name="alert" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
                      We couldn't send that just now. Please try again, or call{" "}
                      {business.phone}.
                    </span>
                  )}
                  {status === "whatsapp" && (
                    <span className="flex items-start gap-1.5 text-iris-700">
                      <Icon name="check" className="mt-0.5 size-3.5 shrink-0" strokeWidth={2.2} />
                      WhatsApp is opening with your message. If nothing happened, send the form
                      instead or call {business.phone}.
                    </span>
                  )}
                  {status === "idle" && (
                    <span className="text-ink-500">
                      We use your details only to reply to this enquiry.
                    </span>
                  )}
                </p>
              </form>
            </div>
          </Reveal>
        </div>

        <Reveal delay={80} className="mt-14">
          <div className="overflow-hidden rounded-xl border border-ink-900/10 bg-cream-deep">
            <div className="flex flex-col justify-between gap-3 border-b border-ink-900/10 px-5 py-4 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 text-xs text-ink-700">
                <Icon name="pin" className="size-4 text-brass-600" />
                {business.address}
              </p>
              <a
                href={business.mapsHref}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline inline-flex items-center gap-1.5 text-xs font-semibold text-ink-900"
              >
                Get directions
                <Icon name="arrowUpRight" className="size-3.5" />
              </a>
            </div>
            <iframe
              title="Map showing Dhuraj Interiors in Thanjavur"
              src={business.mapEmbed}
              width="100%"
              height="380"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[300px] w-full border-0 grayscale-[0.25] sm:h-[380px]"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
