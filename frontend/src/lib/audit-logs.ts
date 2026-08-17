import { api } from "./api";
import type { AuditLog } from "./types";

export interface ListAuditLogsResponse {
  items: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AuditLogStats {
  totalLogs: number;
  logsLast30Days: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
}

export async function listAuditLogs(page = 1, limit = 50): Promise<ListAuditLogsResponse> {
  return api.get(`/api/audit-logs?page=${page}&limit=${limit}`);
}

export async function getAuditLogStats(): Promise<AuditLogStats> {
  return api.get("/api/audit-logs/stats");
}
