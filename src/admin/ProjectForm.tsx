import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Icon } from "../components/ui/Icons";
import { apiFetch, ApiError } from "../lib/api";
import type { AdminProject, ProjectCategory } from "../lib/projects";
import { FieldError } from "./ui";

type ProjectFormProps = {
  project: AdminProject | null;
  categories: ProjectCategory[];
  onClose: () => void;
  onSaved: (message: string) => void;
  onUnauthorized: () => void;
};

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MAX_GALLERY = 12;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) return "Use a JPG, PNG or WebP image.";
  if (file.size > MAX_FILE_BYTES) return "Each image must be smaller than 10 MB.";
  return null;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

type ExistingImage = { id: number; path: string; removed: boolean };
type NewImage = { file: File; url: string };

export function ProjectForm({
  project,
  categories,
  onClose,
  onSaved,
  onUnauthorized,
}: ProjectFormProps) {
  const [title, setTitle] = useState(project?.title ?? "");
  const [shortDescription, setShortDescription] = useState(project?.shortDescription ?? "");
  const [fullDescription, setFullDescription] = useState(project?.fullDescription ?? "");
  const [categoryId, setCategoryId] = useState(
    project?.categoryId ? String(project.categoryId) : "",
  );
  const [status, setStatus] = useState<"published" | "draft">(project?.status ?? "draft");
  const [displayOrder, setDisplayOrder] = useState(String(project?.displayOrder ?? 0));
  const [isFeatured, setIsFeatured] = useState(project?.isFeatured ?? false);

  const [mainFile, setMainFile] = useState<File | null>(null);
  const [mainPreview, setMainPreview] = useState(project?.mainImage ?? "");
  const [gallery, setGallery] = useState<ExistingImage[]>(
    (project?.images ?? []).map((image) => ({ id: image.id, path: image.path, removed: false })),
  );
  const [newImages, setNewImages] = useState<NewImage[]>([]);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  const mainUrlRef = useRef<string | null>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (mainUrlRef.current) URL.revokeObjectURL(mainUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (!busy) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [busy]);

  const keptGallery = gallery.filter((image) => !image.removed);
  const galleryTotal = keptGallery.length + newImages.length;

  function chooseMain(file: File | undefined) {
    if (!file) return;
    const problem = validateImage(file);
    if (problem) {
      setFieldErrors((current) => ({ ...current, mainImage: problem }));
      return;
    }
    if (mainUrlRef.current) URL.revokeObjectURL(mainUrlRef.current);
    const url = URL.createObjectURL(file);
    mainUrlRef.current = url;
    setMainFile(file);
    setMainPreview(url);
    setFieldErrors((current) => ({ ...current, mainImage: "" }));
  }

  function resetMain() {
    if (mainUrlRef.current) {
      URL.revokeObjectURL(mainUrlRef.current);
      mainUrlRef.current = null;
    }
    setMainFile(null);
    setMainPreview(project?.mainImage ?? "");
  }

  function addGalleryFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    const accepted: NewImage[] = [];
    let problem = "";

    for (const file of Array.from(files)) {
      const issue = validateImage(file);
      if (issue) {
        problem = issue;
        continue;
      }
      if (galleryTotal + accepted.length >= MAX_GALLERY) {
        problem = `You can add up to ${MAX_GALLERY} gallery images.`;
        continue;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }

    if (accepted.length > 0) {
      setNewImages((current) => [...current, ...accepted]);
      setFieldErrors((current) => ({ ...current, galleryImages: "" }));
    }
    if (problem) {
      setFieldErrors((current) => ({ ...current, galleryImages: problem }));
    }
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function removeNewImage(url: string) {
    URL.revokeObjectURL(url);
    setNewImages((current) => current.filter((image) => image.url !== url));
  }

  function toggleExisting(id: number) {
    setGallery((current) =>
      current.map((image) => (image.id === id ? { ...image, removed: !image.removed } : image)),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const errors: Record<string, string> = {};
    if (title.trim().length < 2) errors.title = "Give the project a title of at least 2 characters.";
    if (!categoryId) errors.categoryId = "Choose a project category.";
    if (!shortDescription.trim()) errors.shortDescription = "A short description is required.";
    if (shortDescription.trim().length > 300) {
      errors.shortDescription = "Keep the short description under 300 characters.";
    }
    if (!fullDescription.trim()) errors.fullDescription = "A full description is required.";
    if (!project && !mainFile) errors.mainImage = "Upload a main project image.";
    const order = Number(displayOrder);
    if (!Number.isInteger(order) || order < 0 || order > 9999) {
      errors.displayOrder = "Display order must be a whole number between 0 and 9999.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors((current) => ({ ...current, ...errors }));
      return;
    }

    const form = new FormData();
    form.set("title", title.trim());
    form.set("shortDescription", shortDescription.trim());
    form.set("fullDescription", fullDescription.trim());
    form.set("categoryId", categoryId);
    form.set("status", status);
    form.set("displayOrder", String(order));
    form.set("isFeatured", isFeatured ? "true" : "false");
    form.set("keepImageIds", JSON.stringify(keptGallery.map((image) => image.id)));
    if (mainFile) form.set("mainImage", mainFile);
    newImages.forEach((image) => form.append("galleryImages", image.file));

    setBusy(true);
    try {
      await apiFetch(`/api/admin/projects${project ? `/${project.id}` : ""}`, {
        method: project ? "PUT" : "POST",
        body: form,
      });
      onSaved(project ? "Project updated." : "Project created.");
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          onUnauthorized();
          return;
        }
        if (error.fields) setFieldErrors((current) => ({ ...current, ...error.fields }));
        setFormError(error.message);
      } else {
        setFormError("Something went wrong while saving. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[110] overflow-y-auto bg-plum-950/70 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-form-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="dialog-in mx-auto w-full max-w-4xl bg-cream shadow-2xl sm:rounded-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-ink-900/10 bg-cream/95 px-5 py-4 backdrop-blur sm:px-7">
          <div>
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-brass-600">
              {project ? "Projects management" : "New project"}
            </p>
            <h2 id="project-form-title" className="mt-1 font-display text-2xl leading-tight text-ink-950">
              {project ? project.title : "Add a project"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close form"
            className="grid size-9 shrink-0 place-items-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:bg-ink-900 hover:text-cream disabled:opacity-50"
          >
            <Icon name="close" className="size-4" />
          </button>
        </div>

        <div className="space-y-9 px-5 py-7 sm:px-7">
          {formError && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-900/15 bg-red-50 p-3 text-sm text-red-900"
            >
              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
              {formError}
            </p>
          )}

          <section>
            <h3 className="font-display text-lg text-ink-950">Project details</h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="project-title" className="admin-label">
                  Project title
                </label>
                <input
                  id="project-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  maxLength={120}
                  placeholder="e.g. Warm oak modular kitchen"
                  className="admin-input mt-2"
                  aria-invalid={fieldErrors.title ? "true" : undefined}
                  disabled={busy}
                />
                <FieldError message={fieldErrors.title} />
              </div>

              <div>
                <label htmlFor="project-category" className="admin-label">
                  Project category
                </label>
                <select
                  id="project-category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className="admin-input mt-2"
                  aria-invalid={fieldErrors.categoryId ? "true" : undefined}
                  disabled={busy}
                >
                  <option value="">Choose a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError message={fieldErrors.categoryId} />
              </div>

              <div>
                <label htmlFor="project-status" className="admin-label">
                  Project status
                </label>
                <select
                  id="project-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value === "published" ? "published" : "draft")}
                  className="admin-input mt-2"
                  disabled={busy}
                >
                  <option value="draft">Draft — hidden from the website</option>
                  <option value="published">Published — visible on the website</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor="project-short" className="admin-label">
                    Short description
                  </label>
                  <span
                    className={`text-[0.6875rem] tabular-nums ${
                      shortDescription.length > 300 ? "text-red-700" : "text-ink-500"
                    }`}
                  >
                    {shortDescription.length}/300
                  </span>
                </div>
                <textarea
                  id="project-short"
                  value={shortDescription}
                  onChange={(event) => setShortDescription(event.target.value)}
                  rows={2}
                  maxLength={400}
                  placeholder="One or two lines shown on the project card."
                  className="admin-input mt-2 resize-y"
                  aria-invalid={fieldErrors.shortDescription ? "true" : undefined}
                  disabled={busy}
                />
                <FieldError message={fieldErrors.shortDescription} />
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="project-full" className="admin-label">
                  Full description
                </label>
                <textarea
                  id="project-full"
                  value={fullDescription}
                  onChange={(event) => setFullDescription(event.target.value)}
                  rows={8}
                  placeholder="Describe the brief, materials, layout and result. Blank lines are kept."
                  className="admin-input mt-2 resize-y leading-relaxed"
                  aria-invalid={fieldErrors.fullDescription ? "true" : undefined}
                  disabled={busy}
                />
                <FieldError message={fieldErrors.fullDescription} />
              </div>
            </div>
          </section>

          <section className="border-t border-ink-900/10 pt-8">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-display text-lg text-ink-950">Photography</h3>
              <p className="text-xs text-ink-500">
                JPG, PNG or WebP · up to 10 MB each · {galleryTotal}/{MAX_GALLERY} gallery images
              </p>
            </div>

            <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
              <div>
                <p className="admin-label">Main project image</p>
                <div className="mt-2 overflow-hidden rounded-lg border border-ink-900/10 bg-white">
                  {mainPreview ? (
                    <img
                      src={mainPreview}
                      alt="Main project preview"
                      className="aspect-[4/3] w-full object-cover"
                    />
                  ) : (
                    <div className="grid aspect-[4/3] place-items-center bg-cream-deep text-ink-500">
                      <div className="text-center">
                        <Icon name="image" className="mx-auto size-6" />
                        <p className="mt-2 text-xs">No image selected yet</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <label className="btn btn-outline-dark h-9 cursor-pointer px-4 text-xs">
                    {mainPreview ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="sr-only"
                      disabled={busy}
                      onChange={(event: ChangeEvent<HTMLInputElement>) =>
                        chooseMain(event.target.files?.[0])
                      }
                    />
                  </label>
                  {mainFile && project?.mainImage && (
                    <button
                      type="button"
                      onClick={resetMain}
                      disabled={busy}
                      className="btn btn-outline-dark h-9 px-4 text-xs disabled:opacity-50"
                    >
                      Keep current image
                    </button>
                  )}
                </div>
                <FieldError message={fieldErrors.mainImage} />
              </div>

              <div>
                <p className="admin-label">Additional gallery images</p>
                <div className="mt-2 min-h-[7.5rem] rounded-lg border border-dashed border-ink-900/20 bg-white p-3">
                  {gallery.length === 0 && newImages.length === 0 ? (
                    <p className="grid h-[6.2rem] place-items-center text-center text-xs text-ink-500">
                      Add photos showing the finished space from other angles.
                    </p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {gallery.map((image) => (
                        <div
                          key={image.id}
                          className={`relative overflow-hidden rounded-md border ${
                            image.removed ? "border-red-300" : "border-ink-900/10"
                          }`}
                        >
                          <img
                            src={image.path}
                            alt=""
                            className={`aspect-square w-full object-cover ${
                              image.removed ? "opacity-25 grayscale" : ""
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => toggleExisting(image.id)}
                            disabled={busy}
                            aria-label={image.removed ? "Restore image" : "Remove image"}
                            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-plum-950/80 text-cream transition-colors hover:bg-plum-950"
                          >
                            <Icon name={image.removed ? "refresh" : "close"} className="size-3" />
                          </button>
                        </div>
                      ))}

                      {newImages.map((image) => (
                        <div
                          key={image.url}
                          className="relative overflow-hidden rounded-md border border-brass-500/40"
                        >
                          <img src={image.url} alt="" className="aspect-square w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(image.url)}
                            disabled={busy}
                            aria-label="Remove new image"
                            className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-plum-950/80 text-cream transition-colors hover:bg-plum-950"
                          >
                            <Icon name="close" className="size-3" />
                          </button>
                          <span className="absolute inset-x-0 bottom-0 bg-plum-950/70 py-0.5 text-center text-[0.5625rem] uppercase tracking-[0.12em] text-cream">
                            New
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <label className="btn btn-outline-dark mt-3 h-9 cursor-pointer px-4 text-xs">
                  <Icon name="plus" className="size-3.5" />
                  Add gallery images
                  <input
                    ref={galleryInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={busy || galleryTotal >= MAX_GALLERY}
                    onChange={(event) => addGalleryFiles(event.target.files)}
                  />
                </label>
                <p className="mt-2 text-[0.6875rem] leading-relaxed text-ink-500">
                  Images are optimised automatically and stored on the server. Removing an existing
                  image deletes it when you save.
                </p>
                <FieldError message={fieldErrors.galleryImages} />
              </div>
            </div>
          </section>

          <section className="border-t border-ink-900/10 pt-8">
            <h3 className="font-display text-lg text-ink-950">Display</h3>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="project-order" className="admin-label">
                  Display order
                </label>
                <input
                  id="project-order"
                  type="number"
                  min={0}
                  max={9999}
                  step={1}
                  value={displayOrder}
                  onChange={(event) => setDisplayOrder(event.target.value)}
                  className="admin-input mt-2 max-w-[10rem]"
                  aria-invalid={fieldErrors.displayOrder ? "true" : undefined}
                  disabled={busy}
                />
                <p className="mt-1.5 text-xs text-ink-500">
                  Lower numbers appear first on the website.
                </p>
                <FieldError message={fieldErrors.displayOrder} />
              </div>

              <div className="sm:pt-6">
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-ink-900/10 bg-white p-4">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(event) => setIsFeatured(event.target.checked)}
                    className="admin-check mt-0.5"
                    disabled={busy}
                  />
                  <span>
                    <span className="block text-sm font-medium text-ink-900">Featured project</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                      Featured projects are highlighted in the public gallery.
                    </span>
                  </span>
                </label>
                {project && (
                  <p className="mt-3 text-xs text-ink-500">
                    Created {formatDate(project.createdAt)} · last updated{" "}
                    {formatDate(project.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-2.5 border-t border-ink-900/10 bg-cream/95 px-5 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="text-[0.6875rem] text-ink-500">
            {status === "published"
              ? "Saving publishes this project to the website immediately."
              : "Drafts stay hidden from the public website."}
          </p>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="btn btn-outline-dark h-10 flex-1 px-4 text-xs disabled:opacity-50 sm:flex-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary h-10 flex-1 px-5 text-xs disabled:opacity-60 sm:flex-none"
            >
              {busy ? (
                <>
                  <span className="size-3.5 animate-spin rounded-full border border-cream/40 border-t-cream" />
                  Saving…
                </>
              ) : (
                <>
                  <Icon name="check" className="size-3.5" />
                  {project ? "Save changes" : "Create project"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
