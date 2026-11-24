import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import multer from "multer";
import sharp from "sharp";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.ts";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const storage = multer.memoryStorage();

const uploader = multer({
  storage,
  limits: {
    fileSize: config.maxUploadBytes,
    files: config.maxGalleryImages + 1,
    fields: 20,
  },
  fileFilter: (_req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (!allowedMimeTypes.has(file.mimetype) || !allowedExtensions.has(extension)) {
      callback(new Error("Images must be JPG, PNG or WebP files."));
      return;
    }
    callback(null, true);
  },
});

/** `mainImage` (one file) plus `galleryImages` (up to 12) for project create/update. */
export const projectImageUpload = uploader.fields([
  { name: "mainImage", maxCount: 1 },
  { name: "galleryImages", maxCount: config.maxGalleryImages },
]);

/** Turns multer errors into friendly JSON instead of an HTML error page. */
export function handleUploadErrors(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `Each image must be smaller than ${Math.round(config.maxUploadBytes / 1024 / 1024)} MB.`
        : err.code === "LIMIT_FILE_COUNT" || err.code === "LIMIT_UNEXPECTED_FILE"
          ? `You can upload at most ${config.maxGalleryImages} gallery images at a time.`
          : "That upload could not be processed.";
    res.status(400).json({ error: message });
    return;
  }

  if (err instanceof Error && err.message.startsWith("Images must be")) {
    res.status(400).json({ error: err.message });
    return;
  }

  next(err);
}

/**
 * Re-encodes an upload to WebP at a sensible web size. Returns the public path
 * stored in the database, e.g. `/uploads/projects/<uuid>.webp`.
 */
export async function saveProjectImage(file: Express.Multer.File): Promise<string> {
  const metadata = await sharp(file.buffer).metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error("That file does not look like an image.");
  }
  if (metadata.width * metadata.height > 80_000_000) {
    throw new Error("That image is too large. Please upload a smaller version.");
  }

  const directory = path.join(config.uploadDir, "projects");
  await fs.mkdir(directory, { recursive: true });
  const filename = `${randomUUID()}.webp`;
  const destination = path.join(directory, filename);

  try {
    await sharp(file.buffer, { failOn: "error" })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toFile(destination);
  } catch {
    await fs.rm(destination, { force: true });
    throw new Error("That image could not be processed. Try another JPG, PNG or WebP file.");
  }

  return `/uploads/projects/${filename}`;
}

/** Deletes an uploaded file, refusing anything outside the uploads folder. */
export async function deleteUploadedImage(publicPath: string): Promise<void> {
  if (!publicPath.startsWith("/uploads/")) return;

  const relative = publicPath.replace(/^\/uploads\//, "");
  const resolved = path.resolve(config.uploadDir, relative);
  const root = path.resolve(config.uploadDir) + path.sep;

  if (!resolved.startsWith(root)) return;

  try {
    await fs.unlink(resolved);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error(`Could not delete ${publicPath}:`, error);
    }
  }
}
