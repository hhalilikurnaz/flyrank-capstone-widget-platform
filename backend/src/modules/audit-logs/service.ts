import * as repository from "./repository";
import type { ListAuditLogsInput } from "./schema";

export async function listAuditLogsService(tenantId: string, input?: ListAuditLogsInput) {
  const filters = {
    action: input?.action,
    entity: input?.entity,
    startDate: input?.startDate ? new Date(input.startDate) : undefined,
    endDate: input?.endDate ? new Date(input.endDate) : undefined,
  };

  const result = await repository.listAuditLogs(tenantId, input?.page, input?.limit, filters);

  return {
    items: result.items.map((log) => ({
      id: log.id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      changes: log.changes,
      ipAddress: log.ipAddress,
      createdAt: log.createdAt.toISOString(),
    })),
    pagination: {
      page: result.page,
      limit: result.limit,
      total: result.total,
      pages: result.pages,
    },
  };
}

export async function getAuditLogStatsService(tenantId: string) {
  return repository.getAuditLogStats(tenantId);
}
