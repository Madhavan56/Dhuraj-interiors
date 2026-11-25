import type { IncomingMessage, ServerResponse } from "node:http";
import type { Express } from "express";

let appPromise: Promise<Express> | null = null;

function loadApp(): Promise<Express> {
  appPromise ??= import("../server/app.ts").then((module) => module.createApp());
  return appPromise;
}

/**
 * Vercel routes every `/api/*` request to this catch-all function and leaves the
 * original path in `req.url`, so Express keeps its normal routing.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  let app: Express;
  try {
    app = await loadApp();
  } catch (error) {
    console.error("API failed to start:", error);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "The API is not configured correctly." }));
    return;
  }

  if (!req.url?.startsWith("/api")) req.url = `/api${req.url ?? "/"}`;
  return app(req, res);
}
