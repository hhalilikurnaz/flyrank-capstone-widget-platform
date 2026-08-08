import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { createWidgetSchema, updateWidgetSchema } from "./schema";
import * as widgetService from "./service";
import { buildEmbedSnippet } from "./embed";

export const widgetsRouter = Router();

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
