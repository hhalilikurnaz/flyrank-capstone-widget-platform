import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { perIpLimiter, perWidgetLimiter } from "@/middleware/rateLimiter";
import { createSubmissionSchema } from "./schema";
import { submitToWidget } from "./service";

export const submissionsRouter = Router();

submissionsRouter.post(
  "/",
  perIpLimiter,
  perWidgetLimiter,
  asyncHandler(async (req, res) => {
    const input = createSubmissionSchema.parse(req.body);
    const submission = await submitToWidget(input, req.ip ?? "unknown");
    res.status(201).json({ id: submission.id, createdAt: submission.createdAt });
  }),
);
