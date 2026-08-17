import { z } from "zod";

export const createWebhookSchema = z.object({
  url: z.string().url(),
  events: z.array(z.enum(["submission.created", "submission.flagged"])).min(1),
});

export const listWebhooksSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const testWebhookSchema = z.object({
  url: z.string().url(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type ListWebhooksInput = z.infer<typeof listWebhooksSchema>;
export type TestWebhookInput = z.infer<typeof testWebhookSchema>;

export const webhookResponseSchema = z.object({
  id: z.string(),
  url: z.string(),
  events: z.array(z.string()),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
});

export type WebhookResponse = z.infer<typeof webhookResponseSchema>;

export const webhookLogResponseSchema = z.object({
  id: z.string(),
  event: z.string(),
  status: z.number().nullable(),
  error: z.string().nullable(),
  attempts: z.number(),
  createdAt: z.string().datetime(),
});

export type WebhookLogResponse = z.infer<typeof webhookLogResponseSchema>;
