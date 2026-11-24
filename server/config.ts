import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Load `.env` if present. Node does this natively; ignore when the file is absent.
try {
  process.loadEnvFile();
} catch {
  // No .env file — values come from the real environment.
}

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.resolve(rootDir, process.env.DATA_DIR ?? "data");

export const config = {
  rootDir,
  dataDir,
  uploadDir: path.join(dataDir, "uploads"),
  databaseFile: path.join(dataDir, "dhuraj.sqlite"),
  distDir: path.join(rootDir, "dist"),
  port: Number(process.env.PORT ?? 4000),
  serveStatic: process.env.SERVE_STATIC !== "false",
  adminEmail: process.env.ADMIN_EMAIL?.trim() || "admin@dhurajinteriors.com",
  // Empty means "keep the existing password"; a random one is generated on first run.
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  sessionCookieName: "dhuraj_admin",
  sessionDays: 7,
  cookieSecure: process.env.COOKIE_SECURE === "true",
  maxUploadBytes: 10 * 1024 * 1024,
  maxGalleryImages: 12,
  defaultWhatsapp: "917373730340",
} as const;

fs.mkdirSync(config.uploadDir, { recursive: true });
