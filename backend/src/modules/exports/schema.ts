import { z } from "zod";

export const exportSubmissionsSchema = z.object({
  format: z.enum(["csv", "json"]),
  widgetId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export type ExportSubmissionsInput = z.infer<typeof exportSubmissionsSchema>;
