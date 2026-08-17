import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { exportSubmissionsSchema } from "./schema";
import * as service from "./service";

export const exportsRouter = Router();

exportsRouter.post(
  "/submissions",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = exportSubmissionsSchema.parse(req.body);
    const filename = await service.getExportFilename(input.format);

    if (input.format === "json") {
      const data = await service.exportSubmissionsAsJSON(req.tenantId!, input);
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.json(data);
    } else {
      const csv = await service.exportSubmissionsAsCSV(req.tenantId!, input);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    }
  }),
);
