import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import {
  createWebhookSchema,
  listWebhooksSchema,
  testWebhookSchema,
} from "./schema";
import * as service from "./service";

export const webhooksRouter = Router();

webhooksRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = listWebhooksSchema.parse(req.query);
    const result = await service.listWebhooksService(req.tenantId!, input);
    res.status(200).json(result);
  }),
);

webhooksRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createWebhookSchema.parse(req.body);
    const result = await service.createWebhookService(req.tenantId!, input);
    res.status(201).json(result);
  }),
);

webhooksRouter.patch(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createWebhookSchema.partial().parse(req.body);
    const result = await service.updateWebhookService(req.tenantId!, req.params.id, input);
    res.status(200).json(result);
  }),
);

webhooksRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await service.deleteWebhookService(req.tenantId!, req.params.id);
    res.status(200).json(result);
  }),
);

webhooksRouter.get(
  "/:id/logs",
  requireAuth,
  asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const result = await service.listWebhookLogsService(req.params.id, req.tenantId!, page, limit);
    res.status(200).json(result);
  }),
);

webhooksRouter.post(
  "/:id/test",
  requireAuth,
  asyncHandler(async (req, res) => {
    const webhook = await require("@/modules/webhooks/repository").getWebhook(
      req.tenantId!,
      req.params.id,
    );
    if (!webhook) {
      return res.status(404).json({ error: { message: "Webhook not found" } });
    }

    const result = await service.testWebhookService(req.tenantId!, { url: webhook.url });
    res.status(200).json(result);
  }),
);
