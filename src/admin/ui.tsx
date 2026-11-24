import { useEffect, type ReactNode } from "react";
import { Icon, type IconName } from "../components/ui/Icons";

export type ToastMessage = { kind: "success" | "error"; text: string };

export function Toast({
  toast,
  onDismiss,
}: {
  toast: ToastMessage | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(onDismiss, toast.kind === "error" ? 7000 : 4500);
    return () => window.clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div
      role={toast.kind === "error" ? "alert" : "status"}
      className={`fixed bottom-5 left-4 right-4 z-[120] flex items-start gap-3 rounded-xl border p-4 text-sm shadow-xl sm:left-auto sm:right-6 sm:max-w-md ${
        toast.kind === "success"
          ? "border-emerald-900/15 bg-emerald-50 text-emerald-950"
          : "border-red-900/15 bg-red-50 text-red-950"
      }`}
    >
      <span
        className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${
          toast.kind === "success" ? "bg-emerald-700 text-white" : "bg-red-700 text-white"
        }`}
      >
        <Icon name={toast.kind === "success" ? "check" : "alert"} className="size-3.5" />
      </span>
      <p className="flex-1 leading-relaxed">{toast.text}</p>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="text-current/60 transition-opacity hover:opacity-100"
      >
        <Icon name="close" className="size-4" />
      </button>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  busy = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[130] grid place-items-center bg-plum-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel();
      }}
    >
      <div className="dialog-in w-full max-w-md rounded-xl bg-cream p-6 shadow-2xl">
        <div className="flex items-start gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-700">
            <Icon name="trash" className="size-5" />
          </span>
          <div>
            <h2 id="confirm-title" className="font-display text-2xl leading-tight text-ink-950">
              {title}
            </h2>
            <div className="mt-2 text-sm leading-relaxed text-ink-700">{message}</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="btn btn-outline-dark h-10 px-4 text-xs disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="btn h-10 bg-red-700 px-4 text-xs text-white hover:bg-red-800 disabled:opacity-60"
          >
            {busy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-red-700">
      <Icon name="alert" className="mt-px size-3.5 shrink-0" />
      {message}
    </p>
  );
}

export function EmptyHint({
  icon,
  title,
  children,
  action,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-16 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-cream-deep text-ink-500">
        <Icon name={icon} className="size-5" />
      </span>
      <p className="mt-4 font-display text-2xl text-ink-950">{title}</p>
      <div className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-700/80">{children}</div>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
