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

export function countTotalImpressions(tenantId: string) {
  return prisma.impression.count({ where: { tenantId } });
}

export async function widgetPerformance(tenantId: string) {
  const [submissionGroups, impressionGroups, widgets] = await Promise.all([
    prisma.submission.groupBy({ by: ["widgetId"], where: { tenantId }, _count: { _all: true } }),
    prisma.impression.groupBy({ by: ["widgetId"], where: { tenantId }, _count: { _all: true } }),
    prisma.widget.findMany({ where: { tenantId }, select: { id: true, title: true } }),
  ]);

  const submissionsById = new Map(submissionGroups.map((g) => [g.widgetId, g._count._all]));
  const impressionsById = new Map(impressionGroups.map((g) => [g.widgetId, g._count._all]));

  return widgets
    .map((w) => {
      const submissions = submissionsById.get(w.id) ?? 0;
      const impressions = impressionsById.get(w.id) ?? 0;
      return {
        widgetId: w.id,
        title: w.title,
        submissions,
        impressions,
        conversionRate: impressions > 0 ? submissions / impressions : 0,
      };
    })
    .filter((w) => w.submissions > 0 || w.impressions > 0)
    .sort((a, b) => b.submissions - a.submissions);
}

export async function deviceBreakdown(tenantId: string) {
  const grouped = await prisma.impression.groupBy({
    by: ["device"],
    where: { tenantId },
    _count: { _all: true },
  });
  return grouped
    .map((g) => ({ device: g.device, count: g._count._all }))
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
