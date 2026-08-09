import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { appCors, publicCors } from "@/middleware/cors";
import { AppError } from "@/lib/errors";
import { detectDevice } from "@/lib/device";
import { createWidgetSchema, updateWidgetSchema } from "./schema";
import * as widgetService from "./service";
import { buildEmbedSnippet } from "./embed";
import { findActiveWidgetById } from "./repository";

export const widgetsRouter = Router();

// Public delivery path: registered before appCors/requireAuth below, and
// CORS'd per-route (get + options) rather than as a blanket app-level
// middleware, so it can be public without opening up the rest of this
// router (see delivery/routes.ts for why that matters).
widgetsRouter.get(
  "/:id/config",
  publicCors,
  asyncHandler(async (req, res) => {
    const widget = await findActiveWidgetById(req.params.id!);
    if (!widget) {
      throw AppError.notFound("Widget not found or inactive");
    }

    widgetService.recordImpressionSafely(widget.id, widget.tenantId, detectDevice(req.header("user-agent")));

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
widgetsRouter.options("/:id/config", publicCors);

widgetsRouter.use(appCors);
widgetsRouter.use(requireAuth);

widgetsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const widgets = await widgetService.getWidgets(req.tenantId!);
    res.json({ widgets });
  }),
);

widgetsRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const input = createWidgetSchema.parse(req.body);
    const widget = await widgetService.createWidget(req.tenantId!, input);
    res.status(201).json({ widget });
  }),
);

widgetsRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const widget = await widgetService.getWidget(req.params.id!, req.tenantId!);
    res.json({ widget });
  }),
);

widgetsRouter.get(
  "/:id/embed",
  asyncHandler(async (req, res) => {
    const widget = await widgetService.getWidget(req.params.id!, req.tenantId!);
    res.json({ snippet: buildEmbedSnippet(widget.id) });
  }),
);

widgetsRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const input = updateWidgetSchema.parse(req.body);
    const widget = await widgetService.updateWidget(req.params.id!, req.tenantId!, input);
    res.json({ widget });
  }),
);

widgetsRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await widgetService.deleteWidget(req.params.id!, req.tenantId!);
    res.status(204).send();
  }),
);
