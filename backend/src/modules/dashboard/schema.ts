import { z } from "zod";

export const listSubmissionsQuerySchema = z.object({
  widgetId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const statsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30),
  widgetId: z.string().uuid().optional(),
});

export const deviceBreakdownQuerySchema = z.object({
  widgetId: z.string().uuid().optional(),
});
