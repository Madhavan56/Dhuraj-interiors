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

const tursoUrl = process.env.TURSO_DATABASE_URL?.trim() ?? "";
const blobToken = process.env.BLOB_READ_WRITE_TOKEN?.trim() ?? "";
const onVercel = Boolean(process.env.VERCEL);

export const config = {
  rootDir,
  dataDir,
  uploadDir: path.join(dataDir, "uploads"),
  databaseFile: path.join(dataDir, "dhuraj.sqlite"),
  distDir: path.join(rootDir, "dist"),
  port: Number(process.env.PORT ?? 4000),
  // Vercel serves the built site from its CDN; the function only handles /api.
  serveStatic: process.env.SERVE_STATIC !== "false" && !onVercel,
  onVercel,

  // Turso (hosted SQLite). Without it the server uses a local file, which is
  // what development and the test suite do.
  tursoUrl,
  tursoToken: process.env.TURSO_AUTH_TOKEN?.trim() ?? "",
  useRemoteDatabase: Boolean(tursoUrl),

  // Vercel Blob for uploads. Locally images are written under data/uploads.
  blobToken,
  useBlobStorage: Boolean(blobToken),

  adminEmail: process.env.ADMIN_EMAIL?.trim() || "admin@dhurajinteriors.com",
  // Empty means "keep the existing password"; a random one is generated on first run.
  adminPassword: process.env.ADMIN_PASSWORD ?? "",
  sessionCookieName: "dhuraj_admin",
  sessionDays: 7,
  cookieSecure: process.env.COOKIE_SECURE === "true",
  // Vercel functions reject request bodies above 4.5 MB.
  maxUploadBytes: (blobToken ? 4 : 10) * 1024 * 1024,
  maxGalleryImages: 12,
  defaultWhatsapp: "917373730340",
} as const;
