import { prisma } from "@/lib/prisma";

export function countTotalSubmissions(tenantId: string) {
  return prisma.submission.count({ where: { tenantId } });
}

export function countSubmissionsSince(tenantId: string, since: Date) {
  return prisma.submission.count({ where: { tenantId, createdAt: { gte: since } } });
}

export function countWidgets(tenantId: string) {
  return prisma.widget.count({ where: { tenantId } });
}

export async function submissionsPerWidget(tenantId: string) {
  const grouped = await prisma.submission.groupBy({
    by: ["widgetId"],
    where: { tenantId },
    _count: { _all: true },
  });
  const widgets = await prisma.widget.findMany({
    where: { tenantId },
    select: { id: true, title: true },
  });
  const titleById = new Map(widgets.map((w) => [w.id, w.title]));
  return grouped
    .map((g) => ({ widgetId: g.widgetId, title: titleById.get(g.widgetId) ?? "Unknown", count: g._count._all }))
    .sort((a, b) => b.count - a.count);
}

export function submissionsSince(tenantId: string, since: Date) {
  return prisma.submission.findMany({
    where: { tenantId, createdAt: { gte: since } },
    select: { createdAt: true },
  });
}

export async function geoBreakdown(tenantId: string) {
  const grouped = await prisma.submission.groupBy({
    by: ["country"],
    where: { tenantId, country: { not: null } },
    _count: { _all: true },
  });
  return grouped
    .map((g) => ({ country: g.country as string, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
}

interface ListSubmissionsParams {
  tenantId: string;
  widgetId?: string;
  page: number;
  pageSize: number;
}

export async function listSubmissions({ tenantId, widgetId, page, pageSize }: ListSubmissionsParams) {
  const where = { tenantId, ...(widgetId ? { widgetId } : {}) };
  const [items, total] = await Promise.all([
    prisma.submission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { widget: { select: { title: true } } },
    }),
    prisma.submission.count({ where }),
  ]);
  return { items, total };
}
