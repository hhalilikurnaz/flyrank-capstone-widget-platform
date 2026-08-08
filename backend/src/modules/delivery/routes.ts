import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { publicCors } from "@/middleware/cors";
import { WIDGET_SDK_VERSION } from "@/widget-sdk/version";

export const deliveryRouter = Router();

const WIDGETS_DIR = path.resolve(__dirname, "../../../public/widgets");

// publicCors is applied per-route (get + options), never as a blanket
// app.use(cors(), router) with no path — that would intercept every OPTIONS
// preflight in the whole app, including ones meant for other routers (this
// broke PATCH/DELETE preflights on /api/widgets/:id once; see git history).

// Versioned, immutable bundle — the version in the filename IS the
// cache-busting mechanism, so it's safe to cache forever.
deliveryRouter.get("/widget.:version.js", publicCors, (req, res) => {
  const { version } = req.params;
  const filePath = path.join(WIDGETS_DIR, `widget.${version}.js`);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown widget SDK version" } });
    return;
  }
  res.set("Cache-Control", "public, max-age=31536000, immutable");
  res.type("application/javascript").sendFile(filePath);
});
deliveryRouter.options("/widget.:version.js", publicCors);

// Convenience alias so /widget.js always resolves to the current version —
// customer sites that hardcode it never break across SDK version bumps.
deliveryRouter.get("/widget.js", publicCors, (_req, res) => {
  res.redirect(302, `/widget.${WIDGET_SDK_VERSION}.js`);
});
deliveryRouter.options("/widget.js", publicCors);
