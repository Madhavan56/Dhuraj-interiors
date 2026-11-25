import {
  nowIso,
  queryAll,
  queryAllIn,
  queryOne,
  queryOneIn,
  runIn,
  slugify,
  type Executor,
} from "./db.ts";

export type ProjectRow = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  full_description: string;
  category_id: number | null;
  main_image: string;
  status: "published" | "draft";
  is_featured: number;
  display_order: number;
  created_at: string;
  updated_at: string;
  category_name: string | null;
  category_slug: string | null;
};

export type ProjectImageRow = {
  id: number;
  project_id: number;
  image_path: string;
  display_order: number;
  created_at: string;
};

export type CategoryRow = {
  id: number;
  name: string;
  slug: string;
  display_order: number;
  created_at: string;
};

export type ProjectImage = { id: number; path: string };
export type ProjectCategory = { id: number; name: string; slug: string };

export type PublicProject = {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  category: ProjectCategory | null;
  mainImage: string;
  isFeatured: boolean;
  createdAt: string;
  images: ProjectImage[];
};

export type PublicProjectDetail = PublicProject & { fullDescription: string };

export type AdminProject = PublicProjectDetail & {
  categoryId: number | null;
  status: "published" | "draft";
  displayOrder: number;
  updatedAt: string;
};

export type CategoryWithCount = ProjectCategory & { projectCount: number };

const selectColumns = `
  p.*,
  c.name AS category_name,
  c.slug AS category_slug
`;
const fromProjects = "FROM projects p LEFT JOIN project_categories c ON c.id = p.category_id";

function categoryFrom(row: ProjectRow): ProjectCategory | null {
  if (row.category_id === null || !row.category_name) return null;
  return { id: row.category_id, name: row.category_name, slug: row.category_slug ?? "" };
}

export async function imagesFor(projectIds: number[]): Promise<Map<number, ProjectImage[]>> {
  const map = new Map<number, ProjectImage[]>();
  if (projectIds.length === 0) return map;

  const placeholders = projectIds.map(() => "?").join(", ");
  const rows = await queryAll<ProjectImageRow>(
    `SELECT * FROM project_images WHERE project_id IN (${placeholders}) ORDER BY display_order ASC, id ASC`,
    ...projectIds,
  );

  for (const row of rows) {
    const list = map.get(row.project_id) ?? [];
    list.push({ id: row.id, path: row.image_path });
    map.set(row.project_id, list);
  }
  return map;
}

export function toPublicProject(row: ProjectRow, images: ProjectImage[]): PublicProject {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    category: categoryFrom(row),
    mainImage: row.main_image,
    isFeatured: row.is_featured === 1,
    createdAt: row.created_at,
    images,
  };
}

export function toProjectDetail(row: ProjectRow, images: ProjectImage[]): PublicProjectDetail {
  return { ...toPublicProject(row, images), fullDescription: row.full_description };
}

export function toAdminProject(row: ProjectRow, images: ProjectImage[]): AdminProject {
  return {
    ...toProjectDetail(row, images),
    categoryId: row.category_id,
    status: row.status,
    displayOrder: row.display_order,
    updatedAt: row.updated_at,
  };
}

type ListOptions = {
  status?: "published" | "draft";
  categorySlug?: string;
  query?: string;
  featuredOnly?: boolean;
  page?: number;
  limit?: number;
};

export async function listProjectRows(
  options: ListOptions,
): Promise<{ rows: ProjectRow[]; total: number }> {
  const where: string[] = [];
  const params: (string | number)[] = [];

  if (options.status) {
    where.push("p.status = ?");
    params.push(options.status);
  }
  if (options.categorySlug) {
    where.push("c.slug = ?");
    params.push(options.categorySlug);
  }
  if (options.featuredOnly) {
    where.push("p.is_featured = 1");
  }
  if (options.query?.trim()) {
    const needle = `%${options.query.trim().replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
    where.push(
      "(p.title LIKE ? ESCAPE '\\' OR p.short_description LIKE ? ESCAPE '\\' OR p.full_description LIKE ? ESCAPE '\\')",
    );
    params.push(needle, needle, needle);
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  const total = Number(
    (
      await queryOne<{ count: number }>(
        `SELECT COUNT(*) AS count ${fromProjects} ${whereSql}`,
        ...params,
      )
    )?.count ?? 0,
  );

  const limit = Math.min(Math.max(options.limit ?? 12, 1), 100);
  const page = Math.max(options.page ?? 1, 1);
  const offset = (page - 1) * limit;

  const rows = await queryAll<ProjectRow>(
    `SELECT ${selectColumns} ${fromProjects} ${whereSql}
     ORDER BY p.display_order ASC, p.created_at DESC, p.id DESC
     LIMIT ? OFFSET ?`,
    ...params,
    limit,
    offset,
  );

  return { rows, total };
}

export async function adminProjectCounts() {
  const row = await queryOne<{
    total: number;
    published: number;
    drafts: number;
    featured: number;
  }>(
    `SELECT COUNT(*) AS total,
            SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) AS published,
            SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) AS drafts,
            SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) AS featured
     FROM projects`,
  );
  return {
    total: Number(row?.total ?? 0),
    published: Number(row?.published ?? 0),
    drafts: Number(row?.drafts ?? 0),
    featured: Number(row?.featured ?? 0),
  };
}

export async function getProjectRowById(
  id: number,
  exec?: Executor,
): Promise<ProjectRow | undefined> {
  const sql = `SELECT ${selectColumns} ${fromProjects} WHERE p.id = ?`;
  return exec
    ? queryOneIn<ProjectRow>(exec, sql, id)
    : queryOne<ProjectRow>(sql, id);
}

export async function getProjectRowBySlug(slug: string): Promise<ProjectRow | undefined> {
  return queryOne<ProjectRow>(`SELECT ${selectColumns} ${fromProjects} WHERE p.slug = ?`, slug);
}

export async function getProjectImages(projectId: number): Promise<ProjectImageRow[]> {
  return queryAll<ProjectImageRow>(
    "SELECT * FROM project_images WHERE project_id = ? ORDER BY display_order ASC, id ASC",
    projectId,
  );
}

export async function listCategories(): Promise<CategoryWithCount[]> {
  const rows = await queryAll<CategoryRow & { project_count: number }>(
    `SELECT c.*, COUNT(p.id) AS project_count
     FROM project_categories c
     LEFT JOIN projects p ON p.category_id = c.id AND p.status = 'published'
     GROUP BY c.id
     ORDER BY c.display_order ASC, c.name ASC`,
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    projectCount: Number(row.project_count ?? 0),
  }));
}

export async function getCategoryById(id: number): Promise<CategoryRow | undefined> {
  return queryOne<CategoryRow>("SELECT * FROM project_categories WHERE id = ?", id);
}

export async function uniqueProjectSlug(
  title: string,
  ignoreId?: number,
  exec?: Executor,
): Promise<string> {
  const base = slugify(title) || "project";
  let candidate = base;

  for (let attempt = 2; attempt < 200; attempt += 1) {
    const sql = "SELECT id FROM projects WHERE slug = ?";
    const existing = exec
      ? await queryOneIn<{ id: number }>(exec, sql, candidate)
      : await queryOne<{ id: number }>(sql, candidate);
    if (!existing || existing.id === ignoreId) return candidate;
    candidate = `${base}-${attempt}`;
  }

  return `${base}-${Date.now()}`;
}

export async function insertProjectImages(
  exec: Executor,
  projectId: number,
  paths: string[],
  startOrder = 0,
): Promise<ProjectImageRow[]> {
  const rows: ProjectImageRow[] = [];

  for (const [index, imagePath] of paths.entries()) {
    const order = startOrder + index;
    const now = nowIso();
    const result = await runIn(
      exec,
      "INSERT INTO project_images (project_id, image_path, display_order, created_at) VALUES (?, ?, ?, ?)",
      projectId,
      imagePath,
      order,
      now,
    );
    rows.push({
      id: Number(result.lastInsertRowid),
      project_id: projectId,
      image_path: imagePath,
      display_order: order,
      created_at: now,
    });
  }

  return rows;
}

export async function deleteImageRows(
  exec: Executor,
  projectId: number,
  ids: number[],
): Promise<string[]> {
  if (ids.length === 0) return [];

  const placeholders = ids.map(() => "?").join(", ");
  const rows = await queryAllIn<ProjectImageRow>(
    exec,
    `SELECT * FROM project_images WHERE project_id = ? AND id IN (${placeholders})`,
    projectId,
    ...ids,
  );
  await runIn(
    exec,
    `DELETE FROM project_images WHERE project_id = ? AND id IN (${placeholders})`,
    projectId,
    ...ids,
  );
  return rows.map((row) => row.image_path);
}
