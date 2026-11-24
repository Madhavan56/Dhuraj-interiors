import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import type { Server } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

/**
 * End-to-end check of the projects workflow: sign in, create a project with an
 * image, see it on the public API, edit it, unpublish it, then delete it.
 * Runs against a throwaway SQLite database so it never touches real data.
 */

let dataDir = "";
let server: Server | undefined;
let baseUrl = "";
let cookie = "";

const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

type Json = Record<string, unknown>;

async function api<T = Json>(
  pathname: string,
  options: { method?: string; body?: unknown; form?: FormData } = {},
): Promise<{ status: number; body: T; headers: Headers }> {
  const headers: Record<string, string> = {};
  if (cookie) headers.cookie = cookie;

  let body: RequestInit["body"];
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers["content-type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });

  for (const value of response.headers.getSetCookie()) {
    if (value.startsWith("dhuraj_admin=")) cookie = value.split(";")[0];
  }

  const raw = await response.text();
  const parsed = raw ? (JSON.parse(raw) as T) : ({} as T);
  return { status: response.status, body: parsed, headers: response.headers };
}

function projectForm(overrides: Record<string, string> = {}) {
  const form = new FormData();
  form.set("title", "Warm oak living room");
  form.set("shortDescription", "A calm living room in oak and lime plaster.");
  form.set("fullDescription", "The brief was a quiet, warm room for a young family.\nWe rebuilt the layout around daylight.");
  form.set("status", "published");
  form.set("displayOrder", "10");
  form.set("isFeatured", "true");
  for (const [key, value] of Object.entries(overrides)) form.set(key, value);
  form.append("mainImage", new Blob([new Uint8Array(PNG)], { type: "image/png" }), "main.png");
  return form;
}

before(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), "dhuraj-workflow-"));
  process.env.DATA_DIR = dataDir;
  process.env.ADMIN_EMAIL = "admin@example.test";
  process.env.ADMIN_PASSWORD = "test-password-123";
  process.env.SERVE_STATIC = "false";

  const { createApp } = await import("../app.ts");
  server = createApp().listen(0);
  await new Promise<void>((resolve) => server!.once("listening", resolve));

  const address = server.address();
  assert.ok(address && typeof address === "object");
  baseUrl = `http://127.0.0.1:${address.port}`;
});

after(async () => {
  if (server) await new Promise<void>((resolve) => server!.close(() => resolve()));

  // Close SQLite so Windows releases the WAL files before the temp folder is removed.
  const { db } = await import("../db.ts");
  db.close();

  if (dataDir) await rm(dataDir, { recursive: true, force: true });
});

test("project management workflow", async () => {
  // The public gallery starts empty and admin routes are private.
  const emptyPublic = await api<{ projects: unknown[]; total: number }>("/api/projects");
  assert.equal(emptyPublic.status, 200);
  assert.deepEqual(emptyPublic.body.projects, []);

  const anonymous = await api("/api/admin/projects");
  assert.equal(anonymous.status, 401);

  const badLogin = await api("/api/admin/login", {
    method: "POST",
    body: { email: "admin@example.test", password: "wrong-password" },
  });
  assert.equal(badLogin.status, 401);

  const login = await api("/api/admin/login", {
    method: "POST",
    body: { email: "admin@example.test", password: "test-password-123" },
  });
  assert.equal(login.status, 200);
  assert.match(cookie, /^dhuraj_admin=.+/);

  const adminList = await api<{ categories: { id: number; name: string }[]; total: number }>(
    "/api/admin/projects",
  );
  assert.equal(adminList.status, 200);
  assert.equal(adminList.body.total, 0);
  const category = adminList.body.categories.find((entry) => entry.name === "Living Room");
  assert.ok(category);

  // A project cannot be created without its main image.
  const missingImage = new FormData();
  missingImage.set("title", "No photo");
  missingImage.set("shortDescription", "Short");
  missingImage.set("fullDescription", "Full");
  missingImage.set("categoryId", String(category.id));
  const rejected = await api("/api/admin/projects", { method: "POST", form: missingImage });
  assert.equal(rejected.status, 422);

  // Create.
  const created = await api<{ project: { id: number; slug: string; mainImage: string } }>(
    "/api/admin/projects",
    {
      method: "POST",
      form: projectForm({ categoryId: String(category.id) }),
    },
  );
  assert.equal(created.status, 201);
  const projectId = created.body.project.id;
  const slug = created.body.project.slug;
  assert.equal(slug, "warm-oak-living-room");
  assert.match(created.body.project.mainImage, /^\/uploads\/projects\/.+\.webp$/);

  const mainPath = path.join(dataDir, "uploads", created.body.project.mainImage.replace("/uploads/", ""));
  assert.ok(existsSync(mainPath), "the optimised main image should exist on disk");

  // Published project appears on the public site.
  const publicList = await api<{
    total: number;
    projects: { title: string; category: { name: string } | null }[];
    whatsapp: string;
  }>("/api/projects");
  assert.equal(publicList.status, 200);
  assert.equal(publicList.body.total, 1);
  assert.equal(publicList.body.projects[0]?.title, "Warm oak living room");
  assert.equal(publicList.body.projects[0]?.category?.name, "Living Room");
  assert.equal(publicList.body.whatsapp, "917373730340");

  const featured = await api<{ projects: unknown[] }>("/api/projects/featured");
  assert.equal(featured.body.projects.length, 1);

  const detail = await api<{ project: { fullDescription: string } }>(
    `/api/projects/${slug}`,
  );
  assert.equal(detail.status, 200);
  assert.match(detail.body.project.fullDescription, /young family/);

  // Edit the copy and replace the main image.
  const editForm = new FormData();
  editForm.set("title", "Warm oak living room");
  editForm.set("shortDescription", "Updated: oak, lime plaster and a reading corner.");
  editForm.set("fullDescription", "A revised description written from the admin dashboard.");
  editForm.set("categoryId", String(category.id));
  editForm.set("status", "published");
  editForm.set("displayOrder", "5");
  editForm.set("isFeatured", "false");
  editForm.set("keepImageIds", "[]");
  editForm.append("mainImage", new Blob([new Uint8Array(PNG)], { type: "image/png" }), "new-main.png");

  const updated = await api<{ project: { mainImage: string; displayOrder: number } }>(
    `/api/admin/projects/${projectId}`,
    { method: "PUT", form: editForm },
  );
  assert.equal(updated.status, 200);
  assert.notEqual(updated.body.project.mainImage, created.body.project.mainImage);
  assert.equal(updated.body.project.displayOrder, 5);
  assert.equal(existsSync(mainPath), false, "the replaced image should be cleaned up");

  const updatedDetail = await api<{ project: { shortDescription: string; fullDescription: string } }>(
    `/api/projects/${slug}`,
  );
  assert.match(updatedDetail.body.project.shortDescription, /reading corner/);
  assert.equal(
    updatedDetail.body.project.fullDescription,
    "A revised description written from the admin dashboard.",
  );

  // Unpublish — it disappears from the public gallery and detail pages.
  const drafted = await api(`/api/admin/projects/${projectId}/status`, {
    method: "PATCH",
    body: { status: "draft" },
  });
  assert.equal(drafted.status, 200);

  const hiddenList = await api<{ total: number }>("/api/projects");
  assert.equal(hiddenList.body.total, 0);
  const hiddenDetail = await api(`/api/projects/${slug}`);
  assert.equal(hiddenDetail.status, 404);

  // Republish, then delete with its images.
  await api(`/api/admin/projects/${projectId}/status`, {
    method: "PATCH",
    body: { status: "published" },
  });
  const republished = await api<{ total: number }>("/api/projects");
  assert.equal(republished.body.total, 1);

  const deletePath = path.join(dataDir, "uploads", updated.body.project.mainImage.replace("/uploads/", ""));
  const deleted = await api(`/api/admin/projects/${projectId}`, { method: "DELETE" });
  assert.equal(deleted.status, 200);
  assert.equal(existsSync(deletePath), false, "deleting a project should remove its images");

  const afterDelete = await api<{ total: number }>("/api/projects");
  assert.equal(afterDelete.body.total, 0);
  const gone = await api(`/api/admin/projects/${projectId}`);
  assert.equal(gone.status, 404);
});

test("rejects unauthenticated mutations and uploads", async () => {
  const previous = cookie;
  cookie = "";

  try {
    const create = await api("/api/admin/projects", { method: "POST", form: projectForm() });
    assert.equal(create.status, 401);

    const remove = await api("/api/admin/projects/1", { method: "DELETE" });
    assert.equal(remove.status, 401);
  } finally {
    cookie = previous;
  }
});
