import { useEffect, useState, type FormEvent } from "react";
import { Icon } from "../components/ui/Icons";
import { Logo } from "../components/ui/Logo";
import { apiFetch, ApiError } from "../lib/api";
import { ProjectsManager } from "./ProjectsManager";
import { Toast, type ToastMessage } from "./ui";

type AdminStatus = "checking" | "signedOut" | "signedIn";
type AdminView = "projects" | "settings";

type AdminUser = { id: number; email: string };

function Login({ onSignedIn }: { onSignedIn: (admin: AdminUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email address and password.");
      return;
    }

    setBusy(true);
    try {
      const response = await apiFetch<{ admin: AdminUser }>("/api/admin/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      onSignedIn(response.admin);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Sign-in failed. Please check your connection.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-plum-950 px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex justify-center">
          <Logo tone="light" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-xl bg-cream p-7 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.9)] sm:p-9"
        >
          <p className="eyebrow text-brass-600">Studio admin</p>
          <h1 className="mt-3 font-display text-[2rem] leading-tight text-ink-950">
            Projects Management
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-700/80">
            Sign in to add, edit and publish the projects shown on the website.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-6 flex items-start gap-2 rounded-lg border border-red-900/15 bg-red-50 p-3 text-sm text-red-900"
            >
              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
              {error}
            </p>
          )}

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="admin-email" className="admin-label">
                Email address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="admin-input mt-2"
                placeholder="you@dhurajinteriors.com"
                disabled={busy}
                required
              />
            </div>

            <div>
              <label htmlFor="admin-password" className="admin-label">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="admin-input mt-2"
                placeholder="Your password"
                disabled={busy}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="btn btn-primary mt-7 h-11 w-full text-xs disabled:opacity-60"
          >
            {busy ? (
              <>
                <span className="size-3.5 animate-spin rounded-full border border-cream/40 border-t-cream" />
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <Icon name="arrowRight" className="size-4" />
              </>
            )}
          </button>

          <a
            href="/"
            className="mt-6 flex items-center justify-center gap-2 text-xs text-ink-500 transition-colors hover:text-ink-900"
          >
            <Icon name="arrowLeft" className="size-3.5" />
            Back to the website
          </a>
        </form>
      </div>
    </div>
  );
}

function SettingsPanel({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [whatsapp, setWhatsapp] = useState("");
  const [saved, setSaved] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [fieldError, setFieldError] = useState("");
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    apiFetch<{ whatsapp: string }>("/api/admin/settings", { signal: controller.signal })
      .then((response) => {
        setWhatsapp(response.whatsapp);
        setSaved(response.whatsapp);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (error instanceof ApiError && error.status === 401) {
          onUnauthorized();
          return;
        }
        setToast({
          kind: "error",
          text: error instanceof Error ? error.message : "Settings could not be loaded.",
        });
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [onUnauthorized]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldError("");

    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      setFieldError("Enter a valid number with country code, for example 917373730340.");
      return;
    }

    setBusy(true);
    try {
      const response = await apiFetch<{ whatsapp: string }>("/api/admin/settings", {
        method: "PUT",
        body: { whatsapp: digits },
      });
      setWhatsapp(response.whatsapp);
      setSaved(response.whatsapp);
      setToast({ kind: "success", text: "WhatsApp number updated. Enquiries now open to it." });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        onUnauthorized();
        return;
      }
      setToast({
        kind: "error",
        text: error instanceof Error ? error.message : "That change could not be saved.",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-xl border border-ink-900/8 bg-cream p-6 sm:p-8">
        <p className="eyebrow text-brass-600">Contact</p>
        <h2 className="mt-3 font-display text-[1.75rem] leading-tight text-ink-950">
          WhatsApp enquiries
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-700/80">
          The enquiry button on every project opens this number. Use the full international
          number with the country code and no spaces or symbols.
        </p>

        {loading ? (
          <div className="mt-6 h-11 w-full animate-pulse rounded-lg bg-sand/50" />
        ) : (
          <form onSubmit={handleSubmit} className="mt-6">
            <label htmlFor="admin-whatsapp" className="admin-label">
              WhatsApp number
            </label>
            <input
              id="admin-whatsapp"
              type="tel"
              inputMode="tel"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              className="admin-input mt-2 max-w-sm"
              placeholder="917373730340"
              disabled={busy}
              aria-invalid={fieldError ? "true" : undefined}
            />
            {fieldError && (
              <p className="mt-1.5 flex items-start gap-1.5 text-xs text-red-700">
                <Icon name="alert" className="mt-px size-3.5 shrink-0" />
                {fieldError}
              </p>
            )}
            <p className="mt-2 text-xs text-ink-500">
              Currently in use:{" "}
              <span className="font-medium tabular-nums text-ink-700">
                {saved || "site default"}
              </span>
            </p>

            <button
              type="submit"
              disabled={busy || whatsapp === saved}
              className="btn btn-primary mt-6 h-10 px-5 text-xs disabled:opacity-50"
            >
              {busy ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border border-cream/40 border-t-cream" />
                  Saving…
                </>
              ) : (
                <>
                  <Icon name="check" className="size-3.5" />
                  Save number
                </>
              )}
            </button>
          </form>
        )}
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export function AdminApp() {
  const [status, setStatus] = useState<AdminStatus>("checking");
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [view, setView] = useState<AdminView>("projects");

  useEffect(() => {
    document.title = "Projects Management — Dhuraj Interiors";
    const controller = new AbortController();

    apiFetch<{ admin: AdminUser }>("/api/admin/me", { signal: controller.signal })
      .then((response) => {
        setAdmin(response.admin);
        setStatus("signedIn");
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("signedOut");
      });

    return () => controller.abort();
  }, []);

  async function signOut() {
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
    } catch {
      // The session may already have expired; show the sign-in screen either way.
    }
    setAdmin(null);
    setStatus("signedOut");
  }

  function handleUnauthorized() {
    setAdmin(null);
    setStatus("signedOut");
  }

  if (status === "checking") {
    return (
      <div className="grid min-h-screen place-items-center bg-plum-950">
        <p className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-cream/70">
          <span className="size-4 animate-spin rounded-full border border-cream/30 border-t-cream" />
          Checking session
        </p>
      </div>
    );
  }

  if (status === "signedOut") {
    return (
      <Login
        onSignedIn={(user) => {
          setAdmin(user);
          setStatus("signedIn");
        }}
      />
    );
  }

  const navItems: { key: AdminView; label: string; icon: "grid" | "settings" }[] = [
    { key: "projects", label: "Projects Management", icon: "grid" },
    { key: "settings", label: "Enquiry Settings", icon: "settings" },
  ];

  return (
    <div className="min-h-screen bg-cream-deep">
      <header className="border-b border-cream/10 bg-plum-950 text-cream">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <a href="/" aria-label="Dhuraj Interiors website" className="hover:opacity-85">
              <Logo tone="light" />
            </a>
            <span className="hidden h-6 w-px bg-cream/15 sm:block" aria-hidden="true" />
            <p className="hidden text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brass-300 sm:block">
              Admin dashboard
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden max-w-[16rem] truncate text-cream/60 md:inline">
              {admin?.email}
            </span>
            <a
              href="/"
              className="hidden items-center gap-1.5 rounded-full border border-cream/20 px-3.5 py-2 text-[0.6875rem] font-medium transition-colors hover:bg-cream/10 sm:inline-flex"
            >
              <Icon name="arrowUpRight" className="size-3.5" />
              View website
            </a>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 px-3.5 py-2 text-[0.6875rem] font-medium transition-colors hover:bg-cream/10"
            >
              <Icon name="logout" className="size-3.5" />
              Sign out
            </button>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setView(item.key)}
              aria-current={view === item.key ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-[0.75rem] font-medium transition-colors ${
                view === item.key
                  ? "border-brass-300 text-cream"
                  : "border-transparent text-cream/50 hover:text-cream/85"
              }`}
            >
              <Icon name={item.icon} className="size-4" />
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {view === "projects" ? (
          <ProjectsManager onUnauthorized={handleUnauthorized} />
        ) : (
          <SettingsPanel onUnauthorized={handleUnauthorized} />
        )}
      </main>
    </div>
  );
}
