import { z } from "zod";

export const createSubmissionSchema = z.object({
  widgetId: z.string().uuid("widgetId must be a valid widget id"),
  data: z
    .record(z.string().min(1).max(60), z.string().max(2000))
    .refine((obj) => Object.keys(obj).length <= 20, "Too many fields submitted"),
  // Honeypot: real visitors never see or fill this field (hidden by the widget SDK's CSS).
  // Present on every submission so bots that auto-fill every input get caught.
  website: z.string().max(500).default(""),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
