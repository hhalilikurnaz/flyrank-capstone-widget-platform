import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { listAuditLogsSchema } from "./schema";
import * as service from "./service";

export const auditLogsRouter = Router();

auditLogsRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = listAuditLogsSchema.parse(req.query);
    const result = await service.listAuditLogsService(req.tenantId!, input);
    res.status(200).json(result);
  }),
);

auditLogsRouter.get(
  "/stats",
  requireAuth,
  asyncHandler(async (req, res) => {
    const stats = await service.getAuditLogStatsService(req.tenantId!);
    res.status(200).json(stats);
  }),
);
