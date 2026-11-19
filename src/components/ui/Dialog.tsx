import { useEffect, useId, useRef, type ReactNode } from "react";
import { Icon } from "./Icons";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  label: string;
  className?: string;
};

export function Dialog({ open, onClose, children, label, className = "" }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => closeRef.current?.focus(), 40);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="backdrop-in absolute inset-0 bg-plum-950/75 backdrop-blur-[3px]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`dialog-in relative max-h-[92svh] w-full overflow-y-auto rounded-t-2xl bg-cream shadow-2xl sm:max-w-3xl sm:rounded-lg ${className}`}
      >
        <span id={titleId} className="sr-only">
          {label}
        </span>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-cream/90 text-ink-900 shadow-sm backdrop-blur transition-colors hover:bg-white"
        >
          <Icon name="close" className="size-4" />
        </button>
        {children}
      </div>
    </div>
  );
}
