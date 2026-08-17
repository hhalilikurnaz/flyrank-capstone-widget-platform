import { z } from "zod";

export const listAuditLogsSchema = z.object({
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  action: z.string().optional(),
  entity: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>;

export const auditLogResponseSchema = z.object({
  id: z.string(),
  action: z.string(),
  entity: z.string(),
  entityId: z.string().nullable(),
  changes: z.record(z.unknown()).nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type AuditLogResponse = z.infer<typeof auditLogResponseSchema>;
