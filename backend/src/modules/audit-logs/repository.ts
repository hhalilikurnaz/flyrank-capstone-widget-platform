import { prisma } from "@/lib/prisma";

export interface LogAuditParams {
  tenantId: string;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}

export async function logAudit(params: LogAuditParams) {
  return prisma.auditLog.create({
    data: {
      tenantId: params.tenantId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      changes: params.changes,
      ipAddress: params.ipAddress,
    },
  });
}

export async function listAuditLogs(
  tenantId: string,
  page = 1,
  limit = 50,
  filters?: {
    action?: string;
    entity?: string;
    startDate?: Date;
    endDate?: Date;
  },
) {
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { tenantId };

  if (filters?.action) {
    where.action = filters.action;
  }
  if (filters?.entity) {
    where.entity = filters.entity;
  }
  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      (where.createdAt as Record<string, unknown>).gte = filters.startDate;
    }
    if (filters.endDate) {
      (where.createdAt as Record<string, unknown>).lte = filters.endDate;
    }
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  };
}

export async function getAuditLogStats(tenantId: string) {
  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);

  const [allTime, last30d] = await Promise.all([
    prisma.auditLog.count({ where: { tenantId } }),
    prisma.auditLog.count({
      where: {
        tenantId,
        createdAt: { gte: last30Days },
      },
    }),
  ]);

  // Get most active actions
  const actions = await prisma.auditLog.groupBy({
    by: ["action"],
    where: { tenantId },
    _count: true,
    orderBy: { _count: { action: "desc" } },
    take: 5,
  });

  return {
    totalLogs: allTime,
    logsLast30Days: last30d,
    topActions: actions.map((a) => ({
      action: a.action,
      count: a._count,
    })),
  };
}
