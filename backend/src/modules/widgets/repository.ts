import { prisma } from "@/lib/prisma";
import type { CreateWidgetInput, UpdateWidgetInput } from "./schema";

export function listWidgets(tenantId: string) {
  return prisma.widget.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } });
}

export function findWidgetById(id: string, tenantId: string) {
  return prisma.widget.findFirst({ where: { id, tenantId } });
}

// Public delivery path: no tenant scoping (any origin may fetch config for a live widget).
export function findActiveWidgetById(id: string) {
  return prisma.widget.findFirst({ where: { id, isActive: true } });
}

export function createWidget(tenantId: string, input: CreateWidgetInput) {
  return prisma.widget.create({ data: { ...input, tenantId } });
}

export function updateWidget(id: string, tenantId: string, input: UpdateWidgetInput) {
  return prisma.widget.updateMany({ where: { id, tenantId }, data: input });
}

export function deleteWidget(id: string, tenantId: string) {
  return prisma.widget.deleteMany({ where: { id, tenantId } });
}
