import fs from "node:fs";
import path from "node:path";
import express, { type NextFunction, type Request, type Response } from "express";
import { config } from "./config.ts";
import { adminRouter } from "./routes-admin.ts";
import { publicRouter } from "./routes-public.ts";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  app.use(express.json({ limit: "200kb" }));

  // Local development serves uploads from disk; production uses Blob URLs.
  if (!config.useBlobStorage) {
    app.use(
      "/uploads",
      express.static(config.uploadDir, {
        fallthrough: false,
        immutable: true,
        maxAge: "365d",
      }),
    );
  }

  app.use("/api/admin", adminRouter);
  app.use("/api", publicRouter);

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "That API endpoint does not exist." });
  });

  // In production the same server serves the built site, including /admin.
  if (config.serveStatic) {
    const indexFile = path.join(config.distDir, "index.html");
    app.use(express.static(config.distDir, { index: false }));
    app.use((req, res, next) => {
      if (req.method !== "GET" || req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
        next();
        return;
      }
      if (!fs.existsSync(indexFile)) {
        next();
        return;
      }
      res.sendFile(indexFile);
    });
  }

  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) {
      next(error);
      return;
    }

    const status = (error as { status?: number } | null)?.status;
    if (status === 404) {
      res.status(404).json({ error: "Not found." });
      return;
    }

    console.error(error);
    res.status(500).json({ error: "Something went wrong on our end. Please try again." });
  });

  return app;
}
