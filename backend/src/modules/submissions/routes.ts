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
    const result = await submitToWidget(input, req.ip ?? "unknown");
    // Spam is dropped silently: same 201 shape, no real id, nothing stored —
    // a bot watching the response sees an ordinary "success".
    if (result.spam) {
      res.status(201).json({ id: null, createdAt: new Date().toISOString() });
      return;
    }
    res.status(201).json({ id: result.id, createdAt: result.createdAt });
  }),
);
