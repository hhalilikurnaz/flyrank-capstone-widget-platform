import { AppError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import type { Device } from "@/lib/device";
import * as widgetRepository from "./repository";
import type { CreateWidgetInput, UpdateWidgetInput } from "./schema";

export function getWidgets(tenantId: string) {
  return widgetRepository.listWidgets(tenantId);
}

export async function getWidget(id: string, tenantId: string) {
  const widget = await widgetRepository.findWidgetById(id, tenantId);
  if (!widget) throw AppError.notFound("Widget not found");
  return widget;
}

export function createWidget(tenantId: string, input: CreateWidgetInput) {
  return widgetRepository.createWidget(tenantId, input);
}

export async function updateWidget(id: string, tenantId: string, input: UpdateWidgetInput) {
  const { count } = await widgetRepository.updateWidget(id, tenantId, input);
  if (count === 0) throw AppError.notFound("Widget not found");
  return widgetRepository.findWidgetById(id, tenantId);
}

export async function deleteWidget(id: string, tenantId: string) {
  const { count } = await widgetRepository.deleteWidget(id, tenantId);
  if (count === 0) throw AppError.notFound("Widget not found");
}

// Fire-and-forget: an impression is a metrics side effect, not part of the
// contract the widget SDK is waiting on. A slow or failing insert must never
// delay or break the config response every page load depends on.
export function recordImpressionSafely(widgetId: string, tenantId: string, device: Device) {
  widgetRepository.createImpression(widgetId, tenantId, device).catch((err: unknown) => {
    logger.warn("Failed to record widget impression", { widgetId, error: (err as Error)?.message });
  });
}
