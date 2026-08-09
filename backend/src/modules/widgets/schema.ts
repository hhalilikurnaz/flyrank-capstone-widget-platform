import { z } from "zod";

export const widgetFieldSchema = z.object({
  name: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(120),
  type: z.enum(["text", "email", "phone", "textarea"]),
  required: z.boolean().default(false),
});

export type WidgetField = z.infer<typeof widgetFieldSchema>;

const displayOptionsSchema = z
  .object({
    position: z.enum(["bottom-right", "bottom-left", "center", "inline"]).default("bottom-right"),
    delaySeconds: z.number().int().min(0).max(600).default(0),
    theme: z.enum(["light", "dark"]).default("light"),
    primaryColor: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/, "primaryColor must be a hex color like #4f46e5")
      .optional(),
    // Web-safe stacks only — the widget SDK stays zero-dependency, so no
    // external @import/Google Fonts request from a page we don't control.
    fontFamily: z.enum(["system", "serif", "rounded", "mono"]).default("system"),
    borderRadius: z.number().int().min(0).max(24).default(12),
    shadow: z.enum(["none", "soft", "medium", "strong"]).default("medium"),
    animation: z.enum(["none", "fade", "slide-up", "bounce"]).default("fade"),
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
