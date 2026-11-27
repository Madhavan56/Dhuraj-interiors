import { useCallback, useEffect, useState } from "react";
import { Icon } from "../components/ui/Icons";
import { apiFetch, ApiError } from "../lib/api";
import type { AdminProject, ProjectCategory, ProjectCounts } from "../lib/projects";
import { ProjectForm } from "./ProjectForm";
import { ConfirmDialog, EmptyHint, Toast, type ToastMessage } from "./ui";

type ProjectsResponse = {
  projects: AdminProject[];
  total: number;
  page: number;
  limit: number;
  counts: ProjectCounts;
  categories: ProjectCategory[];
};

type StatusFilter = "" | "published" | "draft";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: "published" | "draft" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] ${
        status === "published"
          ? "bg-emerald-700/10 text-emerald-800"
          : "bg-ink-900/8 text-ink-500"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "published" ? "bg-emerald-600" : "bg-ink-500/60"
        }`}
        aria-hidden="true"
      />
      {status === "published" ? "Published" : "Draft"}
    </span>
  );
}

function PreviewModal({
  project,
  onClose,
}: {
  project: AdminProject;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const images = [project.mainImage, ...project.images.map((image) => image.path)].filter(Boolean);

  return (
    <div
      className="fixed inset-0 z-[110] overflow-y-auto bg-ink-950/45 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-preview-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-in mx-auto w-full max-w-4xl overflow-hidden rounded-xl border border-ink-900/10 bg-cream shadow-[0_40px_90px_-45px_rgba(35,26,18,0.55)]">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink-900/10 bg-cream/95 px-5 py-3.5 backdrop-blur">
          <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-brass-600">
            Project preview
          </p>
          <div className="flex items-center gap-3">
            {project.status === "published" ? (
              <a
                href={`/?project=${encodeURIComponent(project.slug)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium text-ink-700 hover:text-ink-950"
              >
                Open on website
                <Icon name="arrowUpRight" className="size-3.5" />
              </a>
            ) : (
              <span className="text-[0.6875rem] text-ink-500">Draft — visible only to you</span>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="grid size-8 place-items-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:bg-ink-900 hover:text-cream"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="bg-ink-900">
            <img
              src={project.mainImage}
              alt={project.title}
              className="aspect-[16/11] w-full object-cover"
            />
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2 p-3">
                {images.map((source, index) => (
                  <img
                    key={`${source}-${index}`}
                    src={source}
                    alt=""
                    className="aspect-square w-full rounded-md border border-white/10 object-cover"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="max-h-[70vh] overflow-y-auto p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow text-brass-600">
                {project.category?.name ?? "Uncategorised"}
              </p>
              <StatusBadge status={project.status} />
              {project.isFeatured && (
                <span className="rounded-full bg-brass-500/15 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-brass-600">
                  Featured
                </span>
              )}
            </div>
            <h2
              id="admin-preview-title"
              className="mt-4 font-display text-[clamp(1.6rem,3vw,2.25rem)] leading-[1.1] text-ink-950"
            >
              {project.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-700">{project.shortDescription}</p>
            <div className="mt-5 whitespace-pre-line border-t border-ink-900/10 pt-5 text-sm leading-relaxed text-ink-700/90">
              {project.fullDescription}
            </div>
            <p className="mt-6 border-t border-ink-900/10 pt-4 text-xs text-ink-500">
              Created {formatDate(project.createdAt)} · Display order {project.displayOrder}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProjectsManager({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [page, setPage] = useState(1);

  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProject | null>(null);
  const [deleting, setDeleting] = useState<AdminProject | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [previewing, setPreviewing] = useState<AdminProject | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      limit: "10",
    });
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (category) params.set("category", category);
    if (status) params.set("status", status);

    apiFetch<ProjectsResponse>(`/api/admin/projects?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((response) => {
        setData(response);
        const pages = Math.max(1, Math.ceil(response.total / response.limit));
        if (page > pages) setPage(pages);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized();
          return;
        }
        setError(err instanceof Error ? err.message : "Projects could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [page, debouncedQuery, category, status, reloadKey, onUnauthorized]);

  const projects = data?.projects ?? [];
  const counts = data?.counts;
  const total = data?.total ?? 0;
  const limit = data?.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  const hasFilters = Boolean(debouncedQuery || category || status);

  function startCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function startEdit(project: AdminProject) {
    setEditing(project);
    setFormOpen(true);
  }

  async function togglePublished(project: AdminProject) {
    setBusyId(project.id);
    try {
      const nextStatus = project.status === "published" ? "draft" : "published";
      await apiFetch(`/api/admin/projects/${project.id}/status`, {
        method: "PATCH",
        body: { status: nextStatus },
      });
      setToast({
        kind: "success",
        text:
          nextStatus === "published"
            ? `“${project.title}” is now live on the website.`
            : `“${project.title}” was moved to drafts and hidden from the website.`,
      });
      reload();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setToast({
        kind: "error",
        text: err instanceof Error ? err.message : "The status could not be changed.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);

    try {
      await apiFetch(`/api/admin/projects/${deleting.id}`, { method: "DELETE" });
      setToast({ kind: "success", text: `“${deleting.title}” was deleted.` });
      setDeleting(null);
      if (projects.length === 1 && page > 1) setPage(page - 1);
      else reload();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized();
        return;
      }
      setToast({
        kind: "error",
        text: err instanceof Error ? err.message : "The project could not be deleted.",
      });
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-brass-600">Dashboard</p>
          <h1 className="mt-2 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-tight text-ink-950">
            Projects Management
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-700/80">
            Everything published here appears on the public website immediately. Drafts stay
            hidden until you publish them.
          </p>
        </div>
        <button
          type="button"
          onClick={startCreate}
          className="btn btn-primary h-11 px-5 text-xs"
        >
          <Icon name="plus" className="size-4" />
          Add new project
        </button>
      </div>

      {counts && (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total projects", value: counts.total },
            { label: "Published", value: counts.published },
            { label: "Drafts", value: counts.drafts },
            { label: "Featured", value: counts.featured },
          ].map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-ink-900/8 bg-cream px-4 py-4"
            >
              <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-500">
                {card.label}
              </p>
              <p className="mt-1.5 font-display text-[1.75rem] leading-none text-ink-950">
                {card.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-7 rounded-xl border border-ink-900/8 bg-cream">
        <div className="flex flex-col gap-3 border-b border-ink-900/8 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Search by project name or description"
              aria-label="Search projects"
              className="admin-input pl-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 lg:w-auto lg:grid-cols-[11rem_10rem]">
            <label className="sr-only" htmlFor="filter-category">
              Filter by category
            </label>
            <select
              id="filter-category"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
              className="admin-input"
            >
              <option value="">All categories</option>
              {(data?.categories ?? []).map((entry) => (
                <option key={entry.id} value={entry.slug}>
                  {entry.name}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="filter-status">
              Filter by status
            </label>
            <select
              id="filter-status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as StatusFilter);
                setPage(1);
              }}
              className="admin-input"
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {loading && !data ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-12 w-16 animate-pulse rounded-md bg-sand/60" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-1/3 animate-pulse rounded-full bg-sand/60" />
                  <div className="h-2.5 w-1/5 animate-pulse rounded-full bg-sand/50" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm text-ink-700">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="btn btn-outline-dark mt-4 h-10 px-4 text-xs"
            >
              <Icon name="refresh" className="size-3.5" />
              Try again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <EmptyHint
            icon="image"
            title={hasFilters ? "No matching projects" : "No projects yet"}
            action={
              hasFilters ? (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setCategory("");
                    setStatus("");
                    setPage(1);
                  }}
                  className="btn btn-outline-dark h-10 px-4 text-xs"
                >
                  Clear filters
                </button>
              ) : (
                <button type="button" onClick={startCreate} className="btn btn-primary h-10 px-4 text-xs">
                  <Icon name="plus" className="size-3.5" />
                  Add your first project
                </button>
              )
            }
          >
            {hasFilters
              ? "Try a different search term or clear the filters to see every project."
              : "Add a project with photographs, a description and a category. It will appear on the website as soon as you publish it."}
          </EmptyHint>
        ) : (
          <>
            <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
              {/* Desktop table */}
              <table className="hidden w-full border-collapse text-left md:table">
                <thead>
                  <tr className="border-b border-ink-900/8 text-[0.625rem] uppercase tracking-[0.14em] text-ink-500">
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Image
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Project Name
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Category
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Featured
                    </th>
                    <th scope="col" className="px-3 py-3 font-semibold">
                      Created
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-900/6">
                  {projects.map((project) => (
                    <tr key={project.id} className="align-middle transition-colors hover:bg-cream-deep/45">
                      <td className="px-5 py-3">
                        <button
                          type="button"
                          onClick={() => setPreviewing(project)}
                          aria-label={`View the full image for ${project.title}`}
                          title="View full image"
                          className="block overflow-hidden rounded-md border border-ink-900/8 transition-opacity hover:opacity-80"
                        >
                          <img
                            src={project.mainImage}
                            alt=""
                            loading="lazy"
                            className="h-12 w-16 object-cover"
                          />
                        </button>
                      </td>
                      <td className="max-w-[16rem] px-3 py-3">
                        <p className="truncate text-sm font-medium text-ink-950">{project.title}</p>
                        <p className="mt-0.5 truncate text-[0.6875rem] text-ink-500">
                          /{project.slug}
                        </p>
                      </td>
                      <td className="px-3 py-3 text-[0.8125rem] text-ink-700">
                        {project.category?.name ?? "—"}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={project.status} />
                      </td>
                      <td className="px-3 py-3 text-[0.8125rem] text-ink-700">
                        {project.isFeatured ? "Yes" : "No"}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-[0.75rem] tabular-nums text-ink-700">
                        {formatDate(project.createdAt)}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setPreviewing(project)}
                            aria-label={`Preview ${project.title}`}
                            title="Preview"
                            className="grid size-8 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-950"
                          >
                            <Icon name="eye" className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startEdit(project)}
                            aria-label={`Edit ${project.title}`}
                            title="Edit"
                            className="grid size-8 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-950"
                          >
                            <Icon name="edit" className="size-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void togglePublished(project)}
                            disabled={busyId === project.id}
                            aria-label={
                              project.status === "published"
                                ? `Move ${project.title} to drafts`
                                : `Publish ${project.title}`
                            }
                            title={project.status === "published" ? "Unpublish" : "Publish"}
                            className="grid size-8 place-items-center rounded-md text-ink-500 transition-colors hover:bg-ink-900/5 hover:text-ink-950 disabled:opacity-40"
                          >
                            {busyId === project.id ? (
                              <span className="size-3.5 animate-spin rounded-full border border-ink-900/25 border-t-ink-900" />
                            ) : (
                              <Icon name="refresh" className="size-4" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleting(project)}
                            aria-label={`Delete ${project.title}`}
                            title="Delete"
                            className="grid size-8 place-items-center rounded-md text-red-700/70 transition-colors hover:bg-red-50 hover:text-red-800"
                          >
                            <Icon name="trash" className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile cards */}
              <ul className="divide-y divide-ink-900/8 md:hidden">
                {projects.map((project) => (
                  <li key={project.id} className="p-4">
                    <div className="flex gap-3.5">
                      <button
                        type="button"
                        onClick={() => setPreviewing(project)}
                        aria-label={`View the full image for ${project.title}`}
                        title="View full image"
                        className="h-20 w-24 shrink-0 overflow-hidden rounded-md border border-ink-900/8 transition-opacity hover:opacity-80"
                      >
                        <img
                          src={project.mainImage}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink-950">{project.title}</p>
                        <p className="mt-0.5 text-[0.6875rem] text-ink-500">
                          {project.category?.name ?? "Uncategorised"}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <StatusBadge status={project.status} />
                          {project.isFeatured && (
                            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-brass-600">
                              Featured
                            </span>
                          )}
                        </div>
                        <p className="mt-1.5 text-[0.6875rem] tabular-nums text-ink-500">
                          {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewing(project)}
                        className="btn btn-outline-dark h-9 flex-1 px-3 text-[0.6875rem]"
                      >
                        <Icon name="eye" className="size-3.5" />
                        Preview
                      </button>
                      <button
                        type="button"
                        onClick={() => startEdit(project)}
                        className="btn btn-outline-dark h-9 flex-1 px-3 text-[0.6875rem]"
                      >
                        <Icon name="edit" className="size-3.5" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void togglePublished(project)}
                        disabled={busyId === project.id}
                        className="btn btn-outline-dark h-9 flex-1 px-3 text-[0.6875rem]"
                      >
                        {project.status === "published" ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(project)}
                        aria-label={`Delete ${project.title}`}
                        className="btn h-9 border border-red-900/20 px-3 text-[0.6875rem] text-red-800"
                      >
                        <Icon name="trash" className="size-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-ink-900/8 px-4 py-3.5">
              <p className="text-[0.6875rem] tabular-nums text-ink-500">
                Showing {from}–{to} of {total} {total === 1 ? "project" : "projects"}
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page <= 1 || loading}
                  className="btn btn-outline-dark h-8 px-3 text-[0.6875rem] disabled:opacity-40"
                >
                  <Icon name="arrowLeft" className="size-3.5" />
                  Previous
                </button>
                <span className="px-2 text-[0.6875rem] tabular-nums text-ink-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page >= totalPages || loading}
                  className="btn btn-outline-dark h-8 px-3 text-[0.6875rem] disabled:opacity-40"
                >
                  Next
                  <Icon name="arrowRight" className="size-3.5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {formOpen && (
        <ProjectForm
          project={editing}
          categories={data?.categories ?? []}
          onClose={() => setFormOpen(false)}
          onSaved={(message) => {
            setFormOpen(false);
            setToast({ kind: "success", text: message });
            reload();
          }}
          onUnauthorized={onUnauthorized}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Delete this project?"
          message={
            <>
              <strong className="font-semibold text-ink-900">{deleting.title}</strong> will be
              removed from the website along with its uploaded photographs. This cannot be undone.
            </>
          }
          busy={deleteBusy}
          onCancel={() => setDeleting(null)}
          onConfirm={() => void confirmDelete()}
        />
      )}

      {previewing && <PreviewModal project={previewing} onClose={() => setPreviewing(null)} />}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
