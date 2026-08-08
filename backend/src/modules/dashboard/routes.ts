import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { listSubmissionsQuerySchema, statsQuerySchema } from "./schema";
import * as dashboardService from "./service";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/stats",
  asyncHandler(async (req, res) => {
    const { days } = statsQuerySchema.parse(req.query);
    const stats = await dashboardService.getStats(req.tenantId!, days);
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
  "/submissions",
  asyncHandler(async (req, res) => {
    const { widgetId, page, pageSize } = listSubmissionsQuerySchema.parse(req.query);
    const result = await dashboardService.getSubmissions(req.tenantId!, widgetId, page, pageSize);
    res.json(result);
  }),
);
