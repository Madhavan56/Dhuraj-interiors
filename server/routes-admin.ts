import { Router, type NextFunction, type Request, type Response } from "express";
import {
  clearLoginAttempts,
  clearSessionCookie,
  createSession,
  destroySession,
  loginAllowed,
  recordFailedLogin,
  requireAdmin,
  requireSameOrigin,
  setSessionCookie,
  sessionUser,
} from "./auth.ts";
import { nowIso, queryOne, run, transaction } from "./db.ts";
import { verifyPassword } from "./password.ts";
import {
  adminProjectCounts,
  deleteImageRows,
  getCategoryById,
  getProjectImages,
  getProjectRowById,
  getProjectRowBySlug,
  insertProjectImages,
  listCategories,
  listProjectRows,
  toAdminProject,
  uniqueProjectSlug,
  type ProjectRow,
} from "./projects.ts";
import {
  deleteUploadedImage,
  handleUploadErrors,
  projectImageUpload,
  saveProjectImage,
} from "./uploads.ts";
import { parseKeepImageIds, parseProjectInput, validWhatsapp } from "./validation.ts";

export const adminRouter = Router();

function filesFor(req: Request, field: string): Express.Multer.File[] {
  const files = req.files as Record<string, Express.Multer.File[]> | undefined;
  return files?.[field] ?? [];
}

function imagesOf(projectId: number) {
  return getProjectImages(projectId).map((image) => ({ id: image.id, path: image.image_path }));
}

function adminProject(row: ProjectRow) {
  return toAdminProject(row, imagesOf(row.id));
}

function isUploadError(error: unknown): boolean {
  return error instanceof Error && /^(That image|That file)/.test(error.message);
}

async function removeFiles(paths: string[]): Promise<void> {
  await Promise.all(paths.map((imagePath) => deleteUploadedImage(imagePath)));
}

/* ------------------------------------------------------------------ */
/* Authentication                                                      */
/* ------------------------------------------------------------------ */

adminRouter.post("/login", (req: Request, res: Response) => {
  const key = req.ip ?? "unknown";
  if (!loginAllowed(key)) {
    res.status(429).json({ error: "Too many sign-in attempts. Please try again in 15 minutes." });
    return;
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const password = typeof req.body?.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ error: "Enter your email address and password." });
    return;
  }

  const admin = queryOne<{ id: number; email: string; password_hash: string }>(
    "SELECT id, email, password_hash FROM admin_users WHERE email = ?",
    email,
  );

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    recordFailedLogin(key);
    res.status(401).json({ error: "Those details don't match an admin account." });
    return;
  }

  clearLoginAttempts(key);
  const { token, expires } = createSession(admin.id);
  setSessionCookie(res, token, expires);
  res.json({ admin: { id: admin.id, email: admin.email } });
});

adminRouter.post("/logout", (req: Request, res: Response) => {
  destroySession(req);
  clearSessionCookie(res);
  res.json({ ok: true });
});

adminRouter.get("/me", (req: Request, res: Response) => {
  const user = sessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Not signed in." });
    return;
  }
  res.json({ admin: user });
});

/* Everything below requires a signed-in administrator. */
adminRouter.use(requireSameOrigin);
adminRouter.use(requireAdmin);

adminRouter.get("/categories", (_req, res) => {
  res.json({ categories: listCategories() });
});

adminRouter.get("/settings", (_req, res) => {
  const row = queryOne<{ value: string }>("SELECT value FROM settings WHERE key = 'whatsapp_number'");
  res.json({ whatsapp: row?.value ?? "" });
});

adminRouter.put("/settings", (req, res) => {
  const whatsapp = validWhatsapp(req.body?.whatsapp);
  if (!whatsapp) {
    res.status(422).json({
      error: "Enter a WhatsApp number with country code, using 8 to 15 digits.",
      fields: { whatsapp: "Enter a valid number, for example 917373730340." },
    });
    return;
  }

  run(
    "INSERT INTO settings (key, value) VALUES ('whatsapp_number', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    whatsapp,
  );
  res.json({ whatsapp });
});

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

adminRouter.get("/projects", (req, res) => {
  const page = Number.parseInt(String(req.query.page ?? "1"), 10);
  const limit = Number.parseInt(String(req.query.limit ?? "10"), 10);
  const status = req.query.status === "published" || req.query.status === "draft" ? req.query.status : undefined;

  const { rows, total } = listProjectRows({
    status,
    categorySlug: typeof req.query.category === "string" && req.query.category ? req.query.category : undefined,
    query: typeof req.query.q === "string" ? req.query.q : undefined,
    page: Number.isFinite(page) ? page : 1,
    limit: Number.isFinite(limit) ? limit : 10,
  });

  res.json({
    projects: rows.map((row) => toAdminProject(row, imagesOf(row.id))),
    total,
    page: Number.isFinite(page) ? Math.max(page, 1) : 1,
    limit: Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 100) : 10,
    counts: adminProjectCounts(),
    categories: listCategories(),
  });
});

adminRouter.get("/projects/:id", (req, res) => {
  const id = Number.parseInt(String(req.params.id), 10);
  const row = Number.isInteger(id) ? getProjectRowById(id) : undefined;
  if (!row) {
    res.status(404).json({ error: "Project not found." });
    return;
  }
  res.json({ project: adminProject(row) });
});

adminRouter.post("/projects", projectImageUpload, handleUploadErrors, async (req: Request, res: Response, next: NextFunction) => {
  const { data, errors } = parseProjectInput(req.body ?? {}, getCategoryById);
  const mainFile = filesFor(req, "mainImage")[0];
  const galleryFiles = filesFor(req, "galleryImages");

  if (!mainFile) errors.mainImage = "Upload a main project image.";

  if (Object.keys(errors).length > 0 || !data) {
    res.status(422).json({ error: "Please fix the highlighted fields.", fields: errors });
    return;
  }

  const saved: string[] = [];
  try {
    const mainImage = await saveProjectImage(mainFile);
    saved.push(mainImage);

    const galleryImages: string[] = [];
    for (const file of galleryFiles) {
      const imagePath = await saveProjectImage(file);
      saved.push(imagePath);
      galleryImages.push(imagePath);
    }

    const created = transaction(() => {
      const now = nowIso();
      const result = run(
        `INSERT INTO projects
          (title, slug, short_description, full_description, category_id, main_image, status, is_featured, display_order, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        data.title,
        uniqueProjectSlug(data.title),
        data.shortDescription,
        data.fullDescription,
        data.categoryId,
        mainImage,
        data.status,
        data.isFeatured ? 1 : 0,
        data.displayOrder,
        now,
        now,
      );
      const projectId = Number(result.lastInsertRowid);
      insertProjectImages(projectId, galleryImages);
      return getProjectRowById(projectId)!;
    });

    res.status(201).json({ project: adminProject(created) });
  } catch (error) {
    await removeFiles(saved);
    if (isUploadError(error)) {
      res.status(400).json({ error: (error as Error).message });
      return;
    }
    next(error);
  }
});

adminRouter.put("/projects/:id", projectImageUpload, handleUploadErrors, async (req: Request, res: Response, next: NextFunction) => {
  const id = Number.parseInt(String(req.params.id), 10);
  const existing = Number.isInteger(id) ? getProjectRowById(id) : undefined;
  if (!existing) {
    res.status(404).json({ error: "Project not found." });
    return;
  }

  const { data, errors } = parseProjectInput(req.body ?? {}, getCategoryById);
  if (Object.keys(errors).length > 0 || !data) {
    res.status(422).json({ error: "Please fix the highlighted fields.", fields: errors });
    return;
  }

  const currentImages = getProjectImages(id);
  const keepFieldProvided = typeof req.body?.keepImageIds === "string";
  const keepIds = keepFieldProvided ? parseKeepImageIds(req.body.keepImageIds) : currentImages.map((image) => image.id);
  const keepSet = new Set(keepIds.filter((imageId) => currentImages.some((image) => image.id === imageId)));
  const removeIds = currentImages.filter((image) => !keepSet.has(image.id)).map((image) => image.id);

  const newMainFile = filesFor(req, "mainImage")[0];
  const galleryFiles = filesFor(req, "galleryImages");

  if (!newMainFile && !existing.main_image) {
    res.status(422).json({
      error: "Please fix the highlighted fields.",
      fields: { mainImage: "Upload a main project image." },
    });
    return;
  }

  const saved: string[] = [];
  try {
    const mainImage = newMainFile ? await saveProjectImage(newMainFile) : existing.main_image;
    if (newMainFile) saved.push(mainImage);

    const newGallery: string[] = [];
    for (const file of galleryFiles) {
      const imagePath = await saveProjectImage(file);
      saved.push(imagePath);
      newGallery.push(imagePath);
    }

    const keptCount = keepSet.size;
    const updated = transaction(() => {
      run(
        `UPDATE projects SET
           title = ?, short_description = ?, full_description = ?, category_id = ?,
           main_image = ?, status = ?, is_featured = ?, display_order = ?, updated_at = ?
         WHERE id = ?`,
        data.title,
        data.shortDescription,
        data.fullDescription,
        data.categoryId,
        mainImage,
        data.status,
        data.isFeatured ? 1 : 0,
        data.displayOrder,
        nowIso(),
        id,
      );
      deleteImageRows(id, removeIds);
      insertProjectImages(id, newGallery, keptCount);
      return getProjectRowById(id)!;
    });

    const removedFiles = currentImages
      .filter((image) => removeIds.includes(image.id))
      .map((image) => image.image_path);
    await removeFiles(removedFiles);
    if (newMainFile && existing.main_image && existing.main_image !== mainImage) {
      await deleteUploadedImage(existing.main_image);
    }

    res.json({ project: adminProject(updated) });
  } catch (error) {
    await removeFiles(saved);
    if (isUploadError(error)) {
      res.status(400).json({ error: (error as Error).message });
      return;
    }
    next(error);
  }
});

adminRouter.patch("/projects/:id/status", (req, res) => {
  const id = Number.parseInt(String(req.params.id), 10);
  const row = Number.isInteger(id) ? getProjectRowById(id) : undefined;
  if (!row) {
    res.status(404).json({ error: "Project not found." });
    return;
  }

  const status = req.body?.status;
  if (status !== "published" && status !== "draft") {
    res.status(422).json({ error: "Status must be either published or draft." });
    return;
  }

  run("UPDATE projects SET status = ?, updated_at = ? WHERE id = ?", status, nowIso(), id);
  res.json({ project: adminProject(getProjectRowById(id)!) });
});

adminRouter.delete("/projects/:id", async (req, res, next) => {
  try {
    const id = Number.parseInt(String(req.params.id), 10);
    const row = Number.isInteger(id) ? getProjectRowById(id) : undefined;
    if (!row) {
      res.status(404).json({ error: "Project not found." });
      return;
    }

    const imagePaths = getProjectImages(id).map((image) => image.image_path);
    if (row.main_image) imagePaths.push(row.main_image);

    transaction(() => {
      // project_images rows are removed by ON DELETE CASCADE.
      run("DELETE FROM projects WHERE id = ?", id);
    });

    await removeFiles(imagePaths);
    res.json({ ok: true, id });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/projects-by-slug/:slug", (req, res) => {
  // Used by admin preview links; drafts included.
  const row = getProjectRowBySlug(String(req.params.slug));
  if (!row) {
    res.status(404).json({ error: "Project not found." });
    return;
  }
  res.json({ project: adminProject(row) });
});
