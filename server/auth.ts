import { createHash, randomBytes } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { config } from "./config.ts";
import { nowIso, queryOne, run } from "./db.ts";

export type AdminUser = { id: number; email: string };

type SessionRow = {
  id: number;
  admin_id: number;
  expires_at: string;
  email: string;
};

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function parseCookies(header: string | undefined): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    const value = part.slice(index + 1).trim();
    if (name) cookies[name] = decodeURIComponent(value);
  }
  return cookies;
}

export async function createSession(adminId: number): Promise<{ token: string; expires: Date }> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + config.sessionDays * 24 * 60 * 60 * 1000);

  await run("DELETE FROM admin_sessions WHERE expires_at < ?", nowIso());
  await run(
    "INSERT INTO admin_sessions (admin_id, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?)",
    adminId,
    hashToken(token),
    expires.toISOString(),
    nowIso(),
  );

  return { token, expires };
}

export async function findSessionUser(token: string): Promise<AdminUser | null> {
  if (!token) return null;

  const row = await queryOne<SessionRow>(
    `SELECT s.id, s.admin_id, s.expires_at, u.email
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_id
     WHERE s.token_hash = ?`,
    hashToken(token),
  );

  if (!row) return null;

  if (new Date(row.expires_at).getTime() <= Date.now()) {
    await run("DELETE FROM admin_sessions WHERE id = ?", row.id);
    return null;
  }

  return { id: row.admin_id, email: row.email };
}

export async function sessionUser(req: Request): Promise<AdminUser | null> {
  const token = parseCookies(req.headers.cookie)[config.sessionCookieName];
  return token ? findSessionUser(token) : null;
}

export async function destroySession(req: Request): Promise<void> {
  const token = parseCookies(req.headers.cookie)[config.sessionCookieName];
  if (token) await run("DELETE FROM admin_sessions WHERE token_hash = ?", hashToken(token));
}

export function setSessionCookie(res: Response, token: string, expires: Date): void {
  res.cookie(config.sessionCookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    path: "/",
    expires,
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(config.sessionCookieName, { path: "/" });
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const user = await sessionUser(req);
  if (!user) {
    res.status(401).json({ error: "Sign in to manage projects." });
    return;
  }

  res.locals.admin = user;
  next();
}

/**
 * Blocks cross-site writes to admin endpoints. Browsers send Origin on
 * cross-origin requests; the SameSite cookie is a second line of defence.
 */
export function requireSameOrigin(req: Request, res: Response, next: NextFunction): void {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
    next();
    return;
  }

  const origin = req.headers.origin;
  if (origin) {
    let originHost = "";
    try {
      originHost = new URL(origin).host;
    } catch {
      originHost = "";
    }
    if (!originHost || originHost !== req.headers.host) {
      res.status(403).json({ error: "Request blocked: unexpected origin." });
      return;
    }
  }

  next();
}

const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export function loginAllowed(key: string): boolean {
  const entry = loginAttempts.get(key);
  if (!entry) return true;
  if (Date.now() > entry.resetAt) {
    loginAttempts.delete(key);
    return true;
  }
  return entry.count < MAX_ATTEMPTS;
}

export function recordFailedLogin(key: string): void {
  const entry = loginAttempts.get(key);
  if (!entry || Date.now() > entry.resetAt) {
    loginAttempts.set(key, { count: 1, resetAt: Date.now() + WINDOW_MS });
    return;
  }
  entry.count += 1;
}

export function clearLoginAttempts(key: string): void {
  loginAttempts.delete(key);
}
