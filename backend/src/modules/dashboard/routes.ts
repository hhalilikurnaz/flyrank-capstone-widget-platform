import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { deviceBreakdownQuerySchema, listSubmissionsQuerySchema, statsQuerySchema } from "./schema";
import * as dashboardService from "./service";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const { days, widgetId } = statsQuerySchema.parse(req.query);
    const stats = await dashboardService.getStats(req.tenantId!, days, widgetId);
    res.json(stats);
  }),
);

dashboardRouter.get(
  "/geo-breakdown",
  asyncHandler(async (req, res) => {
    const breakdown = await dashboardService.getGeoBreakdown(req.tenantId!);
    res.json({ breakdown });
  }),
);

dashboardRouter.get(
  "/device-breakdown",
  asyncHandler(async (req, res) => {
    const { widgetId } = deviceBreakdownQuerySchema.parse(req.query);
    const breakdown = await dashboardService.getDeviceBreakdown(req.tenantId!, widgetId);
    res.json({ breakdown });
  }),
);

dashboardRouter.get(
  "/submissions",
  asyncHandler(async (req, res) => {
    const { widgetId, q, page, pageSize } = listSubmissionsQuerySchema.parse(req.query);
    const result = await dashboardService.getSubmissions(req.tenantId!, widgetId, q, page, pageSize);
    res.json(result);
  }),
);
