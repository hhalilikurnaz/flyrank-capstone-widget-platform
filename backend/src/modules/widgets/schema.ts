import { z } from "zod";

const widgetFieldSchema = z.object({
  name: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(120),
  type: z.enum(["text", "email", "phone", "textarea"]),
  required: z.boolean().default(false),
});

const displayOptionsSchema = z
  .object({
    position: z.enum(["bottom-right", "bottom-left", "center", "inline"]).default("bottom-right"),
    delaySeconds: z.number().int().min(0).max(600).default(0),
    theme: z.enum(["light", "dark"]).default("light"),
  })
  .partial()
  .default({});

export const createWidgetSchema = z.object({
  type: z.enum(["SIGNUP", "CTA", "POPOVER"]),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
  fields: z.array(widgetFieldSchema).min(1).max(20).default([
    { name: "email", label: "Email", type: "email", required: true },
  ]),
  buttonText: z.string().trim().min(1).max(60).default("Submit"),
  displayOptions: displayOptionsSchema,
  isActive: z.boolean().default(true),
});

export const updateWidgetSchema = createWidgetSchema.partial();

export type CreateWidgetInput = z.infer<typeof createWidgetSchema>;
export type UpdateWidgetInput = z.infer<typeof updateWidgetSchema>;
