import { Router } from "express";
import { queryOne } from "./db.ts";
import {
  getProjectImages,
  getProjectRowBySlug,
  imagesFor,
  listCategories,
  listProjectRows,
  toProjectDetail,
  toPublicProject,
} from "./projects.ts";

export const publicRouter = Router();

function whatsappNumber(): string {
  return (
    queryOne<{ value: string }>("SELECT value FROM settings WHERE key = 'whatsapp_number'")?.value ??
    ""
  );
}

publicRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

publicRouter.get("/settings", (_req, res) => {
  res.json({ whatsapp: whatsappNumber() });
});

publicRouter.get("/project-categories", (_req, res) => {
  const categories = listCategories().filter((category) => category.projectCount > 0);
  res.json({ categories });
});

publicRouter.get("/projects/featured", (_req, res) => {
  const { rows } = listProjectRows({ status: "published", featuredOnly: true, limit: 6 });
  const images = imagesFor(rows.map((row) => row.id));
  res.json({
    projects: rows.map((row) => toPublicProject(row, images.get(row.id) ?? [])),
    whatsapp: whatsappNumber(),
  });
});

publicRouter.get("/projects", (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const page = Number.parseInt(String(req.query.page ?? "1"), 10);
  const limit = Number.parseInt(String(req.query.limit ?? "60"), 10);

  const { rows, total } = listProjectRows({
    status: "published",
    categorySlug: category || undefined,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 60,
  });

  const images = imagesFor(rows.map((row) => row.id));
  const categories = listCategories().filter((entry) => entry.projectCount > 0);

  res.json({
    projects: rows.map((row) => toPublicProject(row, images.get(row.id) ?? [])),
    categories,
    total,
    whatsapp: whatsappNumber(),
  });
});

publicRouter.get("/projects/:slug", (req, res) => {
  const row = getProjectRowBySlug(String(req.params.slug));

  // Drafts are invisible to the public.
  if (!row || row.status !== "published") {
    res.status(404).json({ error: "That project could not be found." });
    return;
  }

  const images = getProjectImages(row.id).map((image) => ({ id: image.id, path: image.image_path }));
  res.json({ project: toProjectDetail(row, images), whatsapp: whatsappNumber() });
});
