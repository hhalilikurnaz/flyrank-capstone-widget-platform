import fs from "node:fs";
import path from "node:path";
import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { AppError } from "@/lib/errors";
import { findActiveWidgetById } from "@/modules/widgets/repository";
import { WIDGET_SDK_VERSION } from "@/widget-sdk/version";

export const deliveryRouter = Router();

const WIDGETS_DIR = path.resolve(__dirname, "../../../public/widgets");

// Versioned, immutable bundle — the version in the filename IS the
// cache-busting mechanism, so it's safe to cache forever.
deliveryRouter.get(
  "/widget.:version.js",
  (req, res) => {
    const { version } = req.params;
    const filePath = path.join(WIDGETS_DIR, `widget.${version}.js`);
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Unknown widget SDK version" } });
      return;
    }
    res.set("Cache-Control", "public, max-age=31536000, immutable");
    res.type("application/javascript").sendFile(filePath);
  },
);

// Convenience alias so /widget.js always resolves to the current version —
// customer sites that hardcode it never break across SDK version bumps.
deliveryRouter.get("/widget.js", (_req, res) => {
  res.redirect(302, `/widget.${WIDGET_SDK_VERSION}.js`);
});

// Small, short-lived-cache config payload the widget SDK fetches at render
// time. Public and unauthenticated: any origin may render a live widget.
deliveryRouter.get(
  "/api/widgets/:id/config",
  asyncHandler(async (req, res) => {
    const widget = await findActiveWidgetById(req.params.id!);
    if (!widget) {
      throw AppError.notFound("Widget not found or inactive");
    }

    res.set("Cache-Control", "public, max-age=60");
    res.json({
      id: widget.id,
      type: widget.type,
      title: widget.title,
      description: widget.description,
      fields: widget.fields,
      buttonText: widget.buttonText,
      displayOptions: widget.displayOptions,
    });
  }),
);
