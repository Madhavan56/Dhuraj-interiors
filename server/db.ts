import fs from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { randomBytes } from "node:crypto";
import { config } from "./config.ts";
import { hashPassword, verifyPassword } from "./password.ts";

fs.mkdirSync(config.dataDir, { recursive: true });

export const db = new DatabaseSync(config.databaseFile);
db.exec("PRAGMA journal_mode = WAL");
db.exec("PRAGMA foreign_keys = ON");

const migrations: string[] = [
  // 1 — initial projects schema
  `
  CREATE TABLE admin_users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE admin_sessions (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id   INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE project_categories (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT NOT NULL UNIQUE,
    slug          TEXT NOT NULL UNIQUE,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE projects (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    title             TEXT NOT NULL,
    slug              TEXT NOT NULL UNIQUE,
    short_description TEXT NOT NULL DEFAULT '',
    full_description  TEXT NOT NULL DEFAULT '',
    category_id       INTEGER REFERENCES project_categories(id) ON DELETE SET NULL,
    main_image        TEXT NOT NULL DEFAULT '',
    status            TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft')),
    is_featured       INTEGER NOT NULL DEFAULT 0,
    display_order     INTEGER NOT NULL DEFAULT 0,
    created_at        TEXT NOT NULL,
    updated_at        TEXT NOT NULL
  );

  CREATE TABLE project_images (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    image_path    TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT NOT NULL
  );

  CREATE TABLE settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE INDEX idx_projects_status_order ON projects(status, display_order, created_at);
  CREATE INDEX idx_projects_category ON projects(category_id);
  CREATE INDEX idx_project_images_project ON project_images(project_id, display_order);
  CREATE INDEX idx_admin_sessions_expiry ON admin_sessions(expires_at);
  `,
];

export type SqlParam = string | number | bigint | null | Uint8Array;

export function queryAll<T>(sql: string, ...params: SqlParam[]): T[] {
  return db.prepare(sql).all(...params) as unknown as T[];
}

export function queryOne<T>(sql: string, ...params: SqlParam[]): T | undefined {
  return db.prepare(sql).get(...params) as unknown as T | undefined;
}

export function run(sql: string, ...params: SqlParam[]) {
  return db.prepare(sql).run(...params);
}

export function transaction<T>(work: () => T): T {
  db.exec("BEGIN");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

export function nowIso(): string {
  return new Date().toISOString();
}

const suggestedCategories = [
  "Residential Interiors",
  "Living Room",
  "Modular Kitchen",
  "Bedroom Interiors",
  "Commercial Interiors",
  "Office Interiors",
  "Wardrobe Design",
  "Custom Interior Projects",
];

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function migrate() {
  const row = queryOne<{ user_version: number }>("PRAGMA user_version");
  const current = Number(row?.user_version ?? 0);

  for (let version = current; version < migrations.length; version += 1) {
    transaction(() => {
      db.exec(migrations[version]);
      db.exec(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

function seedCategories() {
  const existing = queryOne<{ count: number }>("SELECT COUNT(*) AS count FROM project_categories");
  if (Number(existing?.count ?? 0) > 0) return;

  const insert = db.prepare(
    "INSERT INTO project_categories (name, slug, display_order, created_at) VALUES (?, ?, ?, ?)",
  );
  suggestedCategories.forEach((name, index) => {
    insert.run(name, slugify(name), index + 1, nowIso());
  });
}

function seedSettings() {
  run(
    "INSERT INTO settings (key, value) VALUES ('whatsapp_number', ?) ON CONFLICT(key) DO NOTHING",
    config.defaultWhatsapp,
  );
}

function seedAdmin() {
  const email = config.adminEmail.toLowerCase();
  const existing = queryOne<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM admin_users WHERE email = ?",
    email,
  );

  if (config.adminPassword) {
    if (!existing) {
      run(
        "INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)",
        email,
        hashPassword(config.adminPassword),
        nowIso(),
      );
      console.log(`Admin account created for ${email}.`);
    } else if (!verifyPassword(config.adminPassword, existing.password_hash)) {
      // ADMIN_PASSWORD in the environment is the source of truth across restarts.
      run("UPDATE admin_users SET password_hash = ? WHERE id = ?", hashPassword(config.adminPassword), existing.id);
      console.log(`Admin password updated for ${email} from ADMIN_PASSWORD.`);
    }
    return;
  }

  if (existing) {
    console.warn(
      `ADMIN_PASSWORD is not set — keeping the existing password for ${email}. Set it in .env to choose a password.`,
    );
    return;
  }

  const generated = randomBytes(9).toString("base64url");
  run(
    "INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)",
    email,
    hashPassword(generated),
    nowIso(),
  );
  console.warn(
    [
      "",
      "  ┌─────────────────────────────────────────────────────────────",
      "  │ Admin account created with a generated password.",
      `  │   Email:    ${email}`,
      `  │   Password: ${generated}`,
      "  │ This is shown once. Set ADMIN_EMAIL and ADMIN_PASSWORD in .env",
      "  │ and restart to choose your own credentials.",
      "  └─────────────────────────────────────────────────────────────",
      "",
    ].join("\n"),
  );
}

migrate();
seedCategories();
seedSettings();
seedAdmin();

export const categoriesSeed = suggestedCategories;
