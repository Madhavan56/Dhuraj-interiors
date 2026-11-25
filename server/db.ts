import fs from "node:fs";
import { randomBytes } from "node:crypto";
import type { Client, InStatement, ResultSet } from "@libsql/client";
import { config } from "./config.ts";
import { hashPassword, verifyPassword } from "./password.ts";

// Remote (Turso) in production, a local file for development and tests.
const { createClient } = config.useRemoteDatabase
  ? await import("@libsql/client/web")
  : await import("@libsql/client");

if (!config.useRemoteDatabase) fs.mkdirSync(config.dataDir, { recursive: true });

export const db: Client = createClient(
  config.useRemoteDatabase
    ? { url: config.tursoUrl, authToken: config.tursoToken || undefined }
    : { url: `file:${config.databaseFile.replace(/\\/g, "/")}` },
);

export type SqlParam = string | number | bigint | null | Uint8Array;
export type Executor = { execute: (statement: InStatement) => Promise<ResultSet> };

function toStatement(sql: string, params: SqlParam[]): InStatement {
  return params.length > 0 ? { sql, args: params } : sql;
}

export async function queryAll<T>(sql: string, ...params: SqlParam[]): Promise<T[]> {
  const result = await db.execute(toStatement(sql, params));
  return result.rows as unknown as T[];
}

export async function queryOne<T>(sql: string, ...params: SqlParam[]): Promise<T | undefined> {
  const result = await db.execute(toStatement(sql, params));
  return result.rows[0] as unknown as T | undefined;
}

export async function run(sql: string, ...params: SqlParam[]): Promise<ResultSet> {
  return db.execute(toStatement(sql, params));
}

/** Same as the helpers above, but runs inside an open transaction. */
export async function queryOneIn<T>(
  exec: Executor,
  sql: string,
  ...params: SqlParam[]
): Promise<T | undefined> {
  const result = await exec.execute(toStatement(sql, params));
  return result.rows[0] as unknown as T | undefined;
}

export async function queryAllIn<T>(
  exec: Executor,
  sql: string,
  ...params: SqlParam[]
): Promise<T[]> {
  const result = await exec.execute(toStatement(sql, params));
  return result.rows as unknown as T[];
}

export async function runIn(exec: Executor, sql: string, ...params: SqlParam[]): Promise<ResultSet> {
  return exec.execute(toStatement(sql, params));
}

export async function transaction<T>(work: (tx: Executor) => Promise<T>): Promise<T> {
  const tx = await db.transaction("write");
  try {
    const result = await work(tx);
    await tx.commit();
    return result;
  } catch (error) {
    await tx.rollback().catch(() => undefined);
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

// Each migration runs one statement at a time: Turso rejects several statements
// in a single call.
const migrations: string[][] = [
  // 1 — initial projects schema
  [
    `CREATE TABLE admin_users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      created_at    TEXT NOT NULL
    )`,
    `CREATE TABLE admin_sessions (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      admin_id   INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`,
    `CREATE TABLE project_categories (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL UNIQUE,
      slug          TEXT NOT NULL UNIQUE,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL
    )`,
    `CREATE TABLE projects (
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
    )`,
    `CREATE TABLE project_images (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id    INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      image_path    TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT NOT NULL
    )`,
    `CREATE TABLE settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )`,
    "CREATE INDEX idx_projects_status_order ON projects(status, display_order, created_at)",
    "CREATE INDEX idx_projects_category ON projects(category_id)",
    "CREATE INDEX idx_project_images_project ON project_images(project_id, display_order)",
    "CREATE INDEX idx_admin_sessions_expiry ON admin_sessions(expires_at)",
  ],
];

async function migrate(): Promise<void> {
  const row = await queryOne<{ user_version: number }>("PRAGMA user_version");
  const current = Number(row?.user_version ?? 0);

  for (let version = current; version < migrations.length; version += 1) {
    await transaction(async (tx) => {
      for (const statement of migrations[version]) await tx.execute(statement);
      await tx.execute(`PRAGMA user_version = ${version + 1}`);
    });
  }
}

async function seedCategories(): Promise<void> {
  const existing = await queryOne<{ count: number }>(
    "SELECT COUNT(*) AS count FROM project_categories",
  );
  if (Number(existing?.count ?? 0) > 0) return;

  for (const [index, name] of suggestedCategories.entries()) {
    await run(
      "INSERT INTO project_categories (name, slug, display_order, created_at) VALUES (?, ?, ?, ?)",
      name,
      slugify(name),
      index + 1,
      nowIso(),
    );
  }
}

async function seedSettings(): Promise<void> {
  await run(
    "INSERT INTO settings (key, value) VALUES ('whatsapp_number', ?) ON CONFLICT(key) DO NOTHING",
    config.defaultWhatsapp,
  );
}

async function seedAdmin(): Promise<void> {
  const email = config.adminEmail.toLowerCase();
  const existing = await queryOne<{ id: number; password_hash: string }>(
    "SELECT id, password_hash FROM admin_users WHERE email = ?",
    email,
  );

  if (config.adminPassword) {
    if (!existing) {
      await run(
        "INSERT INTO admin_users (email, password_hash, created_at) VALUES (?, ?, ?)",
        email,
        hashPassword(config.adminPassword),
        nowIso(),
      );
      console.log(`Admin account created for ${email}.`);
    } else if (!verifyPassword(config.adminPassword, existing.password_hash)) {
      // ADMIN_PASSWORD in the environment is the source of truth across restarts.
      await run(
        "UPDATE admin_users SET password_hash = ? WHERE id = ?",
        hashPassword(config.adminPassword),
        existing.id,
      );
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
  await run(
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

async function initialize(): Promise<void> {
  await migrate();
  await seedCategories();
  await seedSettings();
  await seedAdmin();
}

await initialize();

export function closeDatabase(): void {
  db.close();
}

export const categoriesSeed = suggestedCategories;
