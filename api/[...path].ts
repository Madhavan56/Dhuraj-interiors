import type { IncomingMessage, ServerResponse } from "node:http";
import { createApp } from "../server/app.ts";

const app = createApp();

/**
 * Vercel routes every `/api/*` request to this catch-all function and leaves the
 * original path in `req.url`, so Express keeps its normal routing.
 */
export default function handler(req: IncomingMessage, res: ServerResponse) {
  if (!req.url?.startsWith("/api")) req.url = `/api${req.url ?? "/"}`;
  return app(req, res);
}
