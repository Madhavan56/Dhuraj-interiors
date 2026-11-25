import { useCallback, useEffect, useRef, useState } from "react";
import { business } from "../data/site";
import { apiFetch } from "../lib/api";
import type { ProjectCategory, PublicProject, PublicProjectDetail } from "../lib/projects";
import { Icon, WhatsAppIcon } from "./ui/Icons";
import { Reveal } from "./ui/Reveal";
import { SectionHeading } from "./ui/SectionHeading";

type ProjectsResponse = {
  projects: PublicProject[];
  categories: ProjectCategory[];
  total: number;
  whatsapp: string;
};

type ProjectResponse = {
  project: PublicProjectDetail;
  whatsapp: string;
};

function enquiryLink(whatsapp: string, message: string) {
  const digits = (whatsapp || business.whatsapp).replace(/\D/g, "") || business.whatsapp;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

export function Projects() {
  const [category, setCategory] = useState("");
  const [data, setData] = useState<ProjectsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [detail, setDetail] = useState<PublicProjectDetail | null>(null);
  const [detailWhatsapp, setDetailWhatsapp] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const closeRef = useRef<HTMLButtonElement>(null);
  const requestedSlug = useRef<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({ canScroll: false, atStart: true, atEnd: true });

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");

    apiFetch<ProjectsResponse>(
      `/api/projects${category ? `?category=${encodeURIComponent(category)}` : ""}`,
      { signal: controller.signal },
    )
      .then((response) => {
        setData(response);
        // If the selected category loses its last published project, fall back to all work.
        if (category && !response.categories.some((entry) => entry.slug === category)) {
          setCategory("");
        }
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Projects could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [category, reloadKey]);

  const openProject = useCallback(async (slug: string) => {
    setDetailLoading(true);
    setDetailError("");

    try {
      const response = await apiFetch<ProjectResponse>(`/api/projects/${encodeURIComponent(slug)}`);
      setDetail(response.project);
      setDetailWhatsapp(response.whatsapp);
      const url = new URL(window.location.href);
      url.searchParams.set("project", response.project.slug);
      window.history.replaceState({}, "", url);
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "That project could not be loaded right now.",
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  // Supports shared links such as /?project=warm-living-room.
  useEffect(() => {
    if (!data || requestedSlug.current) return;
    const slug = new URLSearchParams(window.location.search).get("project");
    if (!slug) return;
    requestedSlug.current = slug;
    void openProject(slug);
  }, [data, openProject]);

  const closeDetail = useCallback(() => {
    setDetail(null);
    setViewerIndex(null);
    setDetailError("");
    const url = new URL(window.location.href);
    if (url.searchParams.has("project")) {
      url.searchParams.delete("project");
      window.history.replaceState({}, "", url);
    }
  }, []);

  const galleryImages = detail
    ? [detail.mainImage, ...detail.images.map((image) => image.path)].filter(Boolean)
    : [];

  useEffect(() => {
    if (!detail) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (viewerIndex === null) closeDetail();
        else setViewerIndex(null);
        return;
      }
      if (viewerIndex === null) return;
      if (event.key === "ArrowRight") {
        setViewerIndex((viewerIndex + 1) % galleryImages.length);
      }
      if (event.key === "ArrowLeft") {
        setViewerIndex((viewerIndex - 1 + galleryImages.length) % galleryImages.length);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [detail, viewerIndex, galleryImages.length, closeDetail]);

  const projects = data?.projects ?? [];

  // Slider: arrows appear only when the cards overflow, and disable at each end.
  const measureTrack = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setScrollState({
      canScroll: max > 8,
      atStart: track.scrollLeft <= 2,
      atEnd: track.scrollLeft >= max - 2,
    });
  }, []);

  useEffect(() => {
    measureTrack();
    window.addEventListener("resize", measureTrack);
    return () => window.removeEventListener("resize", measureTrack);
  }, [measureTrack, projects.length]);

  useEffect(() => {
    trackRef.current?.scrollTo({ left: 0 });
    measureTrack();
  }, [category, measureTrack]);

  const slide = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.firstElementChild as HTMLElement | null;
    const gap = 20;
    const step = card ? card.offsetWidth + gap : Math.round(track.clientWidth * 0.85);
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <section id="projects" className="bg-cream-deep py-24 md:py-32">
      <div className="container-page">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <Reveal>
            <SectionHeading
              index="05"
              eyebrow="Our work"
              title={
                <>
                  Our Projects &ndash; Transforming{" "}
                  <em className="font-light italic text-brass-600">Spaces</em> into Experiences
                </>
              }
              description="Explore our collection of interior design projects, thoughtfully crafted to combine functionality, comfort and timeless aesthetics."
            />
          </Reveal>
          <Reveal delay={100} className="shrink-0">
            <p className="max-w-[16rem] text-xs leading-relaxed text-ink-500">
              Every project here is designed and built by our studio. Select one to see the full
              story and more photographs.
            </p>
          </Reveal>
        </div>

        {data && data.categories.length > 0 && (
          <Reveal delay={60}>
            <div
              className="mt-10 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Filter projects by category"
            >
              <button
                type="button"
                onClick={() => setCategory("")}
                aria-pressed={category === ""}
                className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                  category === ""
                    ? "border-plum-900 bg-plum-900 text-cream"
                    : "border-ink-900/15 text-ink-700 hover:border-ink-900/35 hover:text-ink-950"
                }`}
              >
                All projects
              </button>
              {data.categories.map((entry) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => setCategory(entry.slug)}
                  aria-pressed={category === entry.slug}
                  className={`shrink-0 rounded-full border px-4 py-2 text-xs font-medium transition-colors ${
                    category === entry.slug
                      ? "border-plum-900 bg-plum-900 text-cream"
                      : "border-ink-900/15 text-ink-700 hover:border-ink-900/35 hover:text-ink-950"
                  }`}
                >
                  {entry.name}
                </button>
              ))}
            </div>
          </Reveal>
        )}

        {loading && !data ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-lg border border-ink-900/8 bg-cream"
              >
                <div className="aspect-[4/3] animate-pulse bg-sand/60" />
                <div className="space-y-3 p-6">
                  <div className="h-2.5 w-24 animate-pulse rounded-full bg-sand/70" />
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-sand/60" />
                  <div className="h-3 w-full animate-pulse rounded-full bg-sand/50" />
                </div>
              </div>
            ))}
          </div>
        ) : error && !data ? (
          <div className="mt-12 rounded-lg border border-ink-900/10 bg-cream p-8 text-center">
            <p className="text-sm text-ink-700">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="btn btn-outline-dark mt-5 h-11 px-5 text-xs"
            >
              Try again
            </button>
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-12 rounded-lg border border-ink-900/10 bg-cream p-10 text-center">
            <p className="font-display text-2xl text-ink-950">New projects are on their way.</p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-700/80">
              {category
                ? "There are no published projects in this category yet. Browse all work or talk to us about what you have in mind."
                : "Our completed projects are being photographed and added to the gallery. In the meantime, we would be glad to show you our work."}
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {category && (
                <button
                  type="button"
                  onClick={() => setCategory("")}
                  className="btn btn-outline-dark h-11 px-5 text-xs"
                >
                  View all projects
                </button>
              )}
              <a
                href={enquiryLink(
                  data?.whatsapp ?? business.whatsapp,
                  "Hello Dhuraj Interiors, I'd like to see examples of your recent interior projects.",
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary h-11 px-5 text-xs"
              >
                <WhatsAppIcon className="size-4" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="relative mt-10">
              <div
                ref={trackRef}
                onScroll={measureTrack}
                role="group"
                aria-label="Project gallery"
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
              {projects.map((project, index) => (
                <Reveal
                  key={project.id}
                  delay={Math.min(index, 3) * 60}
                  className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.625rem)] lg:w-[calc((100%-2.5rem)/3)]"
                >
                  <button
                    type="button"
                    onClick={() => void openProject(project.slug)}
                    className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-ink-900/8 bg-cream text-left transition-[box-shadow,transform] duration-500 hover:-translate-y-1 hover:shadow-[0_28px_60px_-38px_rgba(20,16,29,0.65)]"
                  >
                    <span className="relative block aspect-[4/3] overflow-hidden bg-cream-deep">
                      <img
                        src={project.mainImage}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                      />
                      <span
                        className="absolute inset-0 bg-gradient-to-t from-plum-950/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        aria-hidden="true"
                      />
                      {project.isFeatured && (
                        <span className="absolute left-4 top-4 rounded-full bg-cream/90 px-3 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-plum-900 backdrop-blur-sm">
                          Featured
                        </span>
                      )}
                      <span className="absolute bottom-4 right-4 grid size-9 translate-y-2 place-items-center rounded-full bg-cream/90 text-plum-900 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        <Icon name="arrowUpRight" className="size-4" />
                      </span>
                    </span>

                    <span className="flex flex-1 flex-col p-5 sm:p-6">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-brass-600">
                        {project.category?.name ?? "Interior project"}
                        <span className="size-1 rounded-full bg-brass-500/60" aria-hidden="true" />
                        <span className="font-medium tracking-[0.12em] text-ink-500">
                          {dateLabel(project.createdAt)}
                        </span>
                      </span>
                      <span className="mt-3 block font-display text-[1.375rem] leading-snug text-ink-950">
                        {project.title}
                      </span>
                      <span className="mt-2 line-clamp-2 block text-[0.8125rem] leading-relaxed text-ink-700/80">
                        {project.shortDescription}
                      </span>
                      <span className="mt-auto flex items-center gap-2 pt-5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-900">
                        View Project
                        <Icon
                          name="arrowRight"
                          className="size-3.5 transition-transform duration-500 group-hover:translate-x-1"
                        />
                      </span>
                    </span>
                  </button>
                </Reveal>
              ))}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-[0.6875rem] text-ink-500">
                  {data && data.total > projects.length
                    ? `Showing ${projects.length} of ${data.total} projects.`
                    : `${projects.length} project${projects.length === 1 ? "" : "s"}${
                        category ? " in this category" : ""
                      }.`}{" "}
                  {scrollState.canScroll && "Swipe or use the arrows to browse."}
                </p>
                {scrollState.canScroll && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => slide(-1)}
                      disabled={scrollState.atStart}
                      aria-label="Previous projects"
                      className="grid size-10 place-items-center rounded-full border border-ink-900/15 text-ink-800 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-ink-900/15 disabled:hover:bg-transparent disabled:hover:text-ink-800"
                    >
                      <Icon name="arrowLeft" className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => slide(1)}
                      disabled={scrollState.atEnd}
                      aria-label="Next projects"
                      className="grid size-10 place-items-center rounded-full border border-ink-900/15 text-ink-800 transition-colors hover:border-ink-900 hover:bg-ink-900 hover:text-cream disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-ink-900/15 disabled:hover:bg-transparent disabled:hover:text-ink-800"
                    >
                      <Icon name="arrowRight" className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {detailError && !detail && (
        <div
          className="fixed inset-x-4 bottom-6 z-[95] rounded-lg border border-ink-900/10 bg-cream p-4 text-sm text-ink-900 shadow-xl sm:left-auto sm:max-w-sm"
          role="alert"
        >
          <div className="flex items-start justify-between gap-4">
            <p>{detailError}</p>
            <button
              type="button"
              onClick={() => setDetailError("")}
              aria-label="Dismiss message"
              className="text-ink-500 hover:text-ink-900"
            >
              <Icon name="close" className="size-4" />
            </button>
          </div>
        </div>
      )}

      {detailLoading && !detail && (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-plum-950/80 backdrop-blur-sm">
          <p className="flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-cream/70">
            <span className="size-4 animate-spin rounded-full border border-cream/30 border-t-cream" />
            Loading project
          </p>
        </div>
      )}

      {detail && (
        <div
          className="fixed inset-0 z-[90] overflow-y-auto bg-plum-950/85 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-detail-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetail();
          }}
        >
          <div className="dialog-in mx-auto w-full max-w-6xl overflow-hidden rounded-xl bg-cream shadow-2xl">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="bg-plum-950">
                <button
                  type="button"
                  onClick={() => setViewerIndex(0)}
                  className="group relative block aspect-[16/11] w-full overflow-hidden"
                  aria-label="View project images full screen"
                >
                  <img
                    src={detail.mainImage}
                    alt={detail.title}
                    className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-plum-950/70 px-3 py-1.5 text-[0.625rem] uppercase tracking-[0.14em] text-cream backdrop-blur-sm">
                    <Icon name="image" className="size-3.5" />
                    {galleryImages.length} {galleryImages.length === 1 ? "photo" : "photos"}
                  </span>
                </button>

                {galleryImages.length > 1 && (
                  <div className="grid grid-cols-4 gap-2 p-3 sm:grid-cols-5">
                    {galleryImages.map((source, index) => (
                      <button
                        key={`${source}-${index}`}
                        type="button"
                        onClick={() => setViewerIndex(index)}
                        aria-label={`Open photo ${index + 1}`}
                        className="aspect-square overflow-hidden rounded-md border border-cream/10 opacity-75 transition-opacity hover:opacity-100 focus-visible:opacity-100"
                      >
                        <img
                          src={source}
                          alt=""
                          loading="lazy"
                          className="size-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative flex max-h-[calc(100vh-3.5rem)] flex-col overflow-y-auto p-6 sm:p-8">
                <button
                  ref={closeRef}
                  type="button"
                  onClick={closeDetail}
                  aria-label="Close project"
                  className="absolute right-4 top-4 grid size-9 place-items-center rounded-full border border-ink-900/15 text-ink-700 transition-colors hover:bg-ink-900 hover:text-cream"
                >
                  <Icon name="close" className="size-4" />
                </button>

                <p className="eyebrow pr-12 text-brass-600">
                  {detail.category?.name ?? "Interior project"}
                </p>
                <h3
                  id="project-detail-title"
                  className="mt-4 pr-10 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.08] text-ink-950"
                >
                  {detail.title}
                </h3>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-700">
                  {detail.shortDescription}
                </p>

                <div className="mt-6 whitespace-pre-line border-t border-ink-900/10 pt-6 text-[0.875rem] leading-relaxed text-ink-700/90">
                  {detail.fullDescription}
                </div>

                <div className="mt-8 rounded-lg bg-cream-deep p-5">
                  <p className="font-display text-xl leading-snug text-ink-950">
                    Interested in a Similar Design?
                  </p>
                  <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-700/80">
                    Share your space with us and we will help you plan something that fits it.
                  </p>
                  <a
                    href={enquiryLink(
                      detailWhatsapp,
                      `Hello Dhuraj Interiors, I'm interested in a design similar to "${detail.title}". Could we discuss my project?`,
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn mt-4 h-11 w-full bg-[#128c4a] px-5 text-xs text-white hover:bg-[#0f7a40]"
                  >
                    <WhatsAppIcon className="size-4" />
                    Contact Us on WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {detail && viewerIndex !== null && galleryImages.length > 0 && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-plum-950/97 p-4 text-cream sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Project image viewer"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-[0.6875rem] uppercase tracking-[0.18em] text-cream/55">
              {detail.title}
              <span className="ml-2 text-cream/30">
                {String(viewerIndex + 1).padStart(2, "0")} /{" "}
                {String(galleryImages.length).padStart(2, "0")}
              </span>
            </p>
            <button
              type="button"
              onClick={() => setViewerIndex(null)}
              aria-label="Close image viewer"
              className="grid size-10 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
            >
              <Icon name="close" className="size-5" />
            </button>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center py-4">
            <img
              src={galleryImages[viewerIndex]}
              alt={`${detail.title} — photo ${viewerIndex + 1}`}
              className="max-h-full max-w-full rounded-md object-contain"
            />
          </div>

          <div className="mx-auto flex items-center gap-3 pb-1">
            <button
              type="button"
              onClick={() =>
                setViewerIndex((viewerIndex - 1 + galleryImages.length) % galleryImages.length)
              }
              aria-label="Previous image"
              className="grid size-11 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
            >
              <Icon name="arrowLeft" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setViewerIndex((viewerIndex + 1) % galleryImages.length)}
              aria-label="Next image"
              className="grid size-11 place-items-center rounded-full border border-cream/25 transition-colors hover:bg-cream/10"
            >
              <Icon name="arrowRight" className="size-5" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
