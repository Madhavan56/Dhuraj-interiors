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

async function whatsappNumber(): Promise<string> {
  const row = await queryOne<{ value: string }>(
    "SELECT value FROM settings WHERE key = 'whatsapp_number'",
  );
  return row?.value ?? "";
}

publicRouter.get("/health", (_req, res) => {
  res.json({ ok: true });
});

publicRouter.get("/settings", async (_req, res) => {
  res.json({ whatsapp: await whatsappNumber() });
});

publicRouter.get("/project-categories", async (_req, res) => {
  const categories = (await listCategories()).filter((category) => category.projectCount > 0);
  res.json({ categories });
});

publicRouter.get("/projects/featured", async (_req, res) => {
  const { rows } = await listProjectRows({ status: "published", featuredOnly: true, limit: 6 });
  const images = await imagesFor(rows.map((row) => row.id));
  res.json({
    projects: rows.map((row) => toPublicProject(row, images.get(row.id) ?? [])),
    whatsapp: await whatsappNumber(),
  });
});

publicRouter.get("/projects", async (req, res) => {
  const category = typeof req.query.category === "string" ? req.query.category.trim() : "";
  const page = Number.parseInt(String(req.query.page ?? "1"), 10);
  const limit = Number.parseInt(String(req.query.limit ?? "60"), 10);

  const { rows, total } = await listProjectRows({
    status: "published",
    categorySlug: category || undefined,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 60,
  });

  const images = await imagesFor(rows.map((row) => row.id));
  const categories = (await listCategories()).filter((entry) => entry.projectCount > 0);

  res.json({
    projects: rows.map((row) => toPublicProject(row, images.get(row.id) ?? [])),
    categories,
    total,
    whatsapp: await whatsappNumber(),
  });
});

publicRouter.get("/projects/:slug", async (req, res) => {
  const row = await getProjectRowBySlug(String(req.params.slug));

  // Drafts are invisible to the public.
  if (!row || row.status !== "published") {
    res.status(404).json({ error: "That project could not be found." });
    return;
  }

  const images = (await getProjectImages(row.id)).map((image) => ({
    id: image.id,
    path: image.image_path,
  }));
  res.json({ project: toProjectDetail(row, images), whatsapp: await whatsappNumber() });
});
