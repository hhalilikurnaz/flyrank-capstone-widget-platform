import * as dashboardRepository from "./repository";

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getStats(tenantId: string, days = 30, widgetId?: string) {
  const since = new Date(Date.now() - days * DAY_MS);

  const [total, today, widgetCount, totalImpressions, performance, recent] = await Promise.all([
    dashboardRepository.countTotalSubmissions(tenantId, widgetId),
    dashboardRepository.countSubmissionsSince(tenantId, new Date(Date.now() - DAY_MS), widgetId),
    dashboardRepository.countWidgets(tenantId),
    dashboardRepository.countTotalImpressions(tenantId, widgetId),
    dashboardRepository.widgetPerformance(tenantId),
    dashboardRepository.submissionsSince(tenantId, since, widgetId),
  ]);

  const countsByDay = new Map<string, number>();
  for (const { createdAt } of recent) {
    const key = dayKey(createdAt);
    countsByDay.set(key, (countsByDay.get(key) ?? 0) + 1);
  }

  const timeSeries = Array.from({ length: days }, (_, i) => {
    const date = new Date(Date.now() - (days - 1 - i) * DAY_MS);
    const key = dayKey(date);
    return { date: key, count: countsByDay.get(key) ?? 0 };
  });

  return {
    totalSubmissions: total,
    submissionsLast24h: today,
    totalWidgets: widgetCount,
    totalImpressions,
    conversionRate: totalImpressions > 0 ? total / totalImpressions : 0,
    submissionsPerWidget: performance,
    timeSeries,
  };
}

export function getGeoBreakdown(tenantId: string) {
  return dashboardRepository.geoBreakdown(tenantId);
}

export function getDeviceBreakdown(tenantId: string, widgetId?: string) {
  return dashboardRepository.deviceBreakdown(tenantId, widgetId);
}

export async function getSubmissions(
  tenantId: string,
  widgetId: string | undefined,
  q: string | undefined,
  page: number,
  pageSize: number,
) {
  const { items, total } = await dashboardRepository.listSubmissions({ tenantId, widgetId, q, page, pageSize });
  return {
    items: items.map((s) => ({
      id: s.id,
      widgetId: s.widgetId,
      widgetTitle: s.widget.title,
      data: s.data,
      country: s.country,
      city: s.city,
      createdAt: s.createdAt,
    })),
    total,
    page,
    pageSize,
  };
}
