import { Router } from "express";
import { asyncHandler } from "@/lib/asyncHandler";
import { requireAuth } from "@/middleware/auth";
import { createApiKeySchema, listApiKeysSchema } from "./schema";
import * as service from "./service";

export const apiKeysRouter = Router();

// List all API keys for the tenant
apiKeysRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = listApiKeysSchema.parse(req.query);
    const result = await service.listApiKeysService(req.tenantId!, input);
    res.status(200).json(result);
  }),
);

// Create a new API key
apiKeysRouter.post(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = createApiKeySchema.parse(req.body);
    const result = await service.createApiKeyService(req.tenantId!, input);
    res.status(201).json(result);
  }),
);

// Revoke an API key
apiKeysRouter.patch(
  "/:id/revoke",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await service.revokeApiKeyService(req.tenantId!, req.params.id);
    res.status(200).json(result);
  }),
);

// Delete an API key
apiKeysRouter.delete(
  "/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await service.deleteApiKeyService(req.tenantId!, req.params.id);
    res.status(200).json(result);
  }),
);
