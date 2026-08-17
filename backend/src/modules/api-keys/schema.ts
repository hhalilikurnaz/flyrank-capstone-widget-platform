import { z } from "zod";

export const createApiKeySchema = z.object({
  name: z.string().trim().min(1).max(100),
  expiresAt: z.string().datetime().optional(),
});

export const listApiKeysSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type ListApiKeysInput = z.infer<typeof listApiKeysSchema>;

export const apiKeyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  keyPreview: z.string(),
  lastUsedAt: z.string().datetime().nullable(),
  expiresAt: z.string().datetime().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type ApiKeyResponse = z.infer<typeof apiKeyResponseSchema>;
