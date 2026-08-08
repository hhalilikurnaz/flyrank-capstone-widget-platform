import rateLimit from "express-rate-limit";
import type { NextFunction, Request, Response } from "express";
import { env } from "@/lib/env";

// Per-IP: a blunt but essential guard against a single flooding client.
// Single-process in-memory store — fine for one instance; note in README
// that horizontal scaling needs a shared store (e.g. Redis) instead.
export const perIpLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX_PER_IP,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    res.status(429).json({ error: { code: "TOO_MANY_REQUESTS", message: "Too many requests, slow down" } });
  },
});

// Per-widget: caps total submission volume a single widget can absorb,
// independent of how many distinct IPs are hitting it (a distributed flood
// spread across many IPs would sail through perIpLimiter alone).
const widgetHits = new Map<string, number[]>();

export function perWidgetLimiter(req: Request, res: Response, next: NextFunction) {
  const widgetId = typeof req.body?.widgetId === "string" ? req.body.widgetId : undefined;
  if (!widgetId) {
    next();
    return;
  }

  const now = Date.now();
  const windowStart = now - env.RATE_LIMIT_WINDOW_MS;
  const hits = (widgetHits.get(widgetId) ?? []).filter((t) => t > windowStart);

  if (hits.length >= env.RATE_LIMIT_MAX_PER_WIDGET) {
    res.status(429).json({ error: { code: "TOO_MANY_REQUESTS", message: "This widget is receiving too many submissions right now" } });
    return;
  }

  hits.push(now);
  widgetHits.set(widgetId, hits);
  next();
}

export function _resetRateLimitStateForTests() {
  widgetHits.clear();
}
