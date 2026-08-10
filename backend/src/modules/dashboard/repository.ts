import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function countTotalSubmissions(tenantId: string, widgetId?: string) {
  return prisma.submission.count({ where: { tenantId, ...(widgetId ? { widgetId } : {}) } });
}

export function countSubmissionsSince(tenantId: string, since: Date, widgetId?: string) {
  return prisma.submission.count({ where: { tenantId, createdAt: { gte: since }, ...(widgetId ? { widgetId } : {}) } });
}

export function countWidgets(tenantId: string) {
  return prisma.widget.count({ where: { tenantId } });
}

export function countTotalImpressions(tenantId: string, widgetId?: string) {
  return prisma.impression.count({ where: { tenantId, ...(widgetId ? { widgetId } : {}) } });
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

export async function deviceBreakdown(tenantId: string, widgetId?: string) {
  const grouped = await prisma.impression.groupBy({
    by: ["device"],
    where: { tenantId, ...(widgetId ? { widgetId } : {}) },
    _count: { _all: true },
  });
  return grouped
    .map((g) => ({ device: g.device, count: g._count._all }))
    .sort((a, b) => b.count - a.count);
}

export function submissionsSince(tenantId: string, since: Date, widgetId?: string) {
  return prisma.submission.findMany({
    where: { tenantId, createdAt: { gte: since }, ...(widgetId ? { widgetId } : {}) },
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
  q?: string;
  page: number;
  pageSize: number;
}

interface RawSubmissionRow {
  id: string;
  widgetId: string;
  widgetTitle: string;
  data: unknown;
  country: string | null;
  city: string | null;
  createdAt: Date;
}

export async function listSubmissions({ tenantId, widgetId, q, page, pageSize }: ListSubmissionsParams) {
  if (!q) {
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

  // The `data` JSON column has no fixed keys (they come from each widget's
  // own field definitions), so Prisma's typed JSON filters can't search it
  // generically. Casting to text and ILIKE-ing it is the pragmatic way to
  // get a real substring search across arbitrary field values without
  // knowing the key names up front.
  const pattern = `%${q}%`;
  const widgetFilter = widgetId ? Prisma.sql`AND s."widgetId" = ${widgetId}` : Prisma.empty;
  const matchClause = Prisma.sql`(
    s.data::text ILIKE ${pattern}
    OR w.title ILIKE ${pattern}
    OR s.country ILIKE ${pattern}
    OR s.city ILIKE ${pattern}
  )`;

  const [rows, countRows] = await Promise.all([
    prisma.$queryRaw<RawSubmissionRow[]>`
      SELECT s.id, s."widgetId", w.title AS "widgetTitle", s.data, s.country, s.city, s."createdAt"
      FROM "Submission" s
      JOIN "Widget" w ON w.id = s."widgetId"
      WHERE s."tenantId" = ${tenantId} ${widgetFilter} AND ${matchClause}
      ORDER BY s."createdAt" DESC
      LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
    `,
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "Submission" s
      JOIN "Widget" w ON w.id = s."widgetId"
      WHERE s."tenantId" = ${tenantId} ${widgetFilter} AND ${matchClause}
    `,
  ]);

  const items = rows.map((r) => ({
    id: r.id,
    widgetId: r.widgetId,
    data: r.data,
    country: r.country,
    city: r.city,
    createdAt: r.createdAt,
    widget: { title: r.widgetTitle },
  }));
  return { items, total: Number(countRows[0]?.count ?? 0) };
}
