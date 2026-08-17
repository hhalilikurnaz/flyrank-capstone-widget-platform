import { useEffect, useState } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { listAuditLogs, getAuditLogStats } from "@/lib/audit-logs";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorBanner, PageSpinner, SuccessBanner } from "@/components/ui/Feedback";
import type { AuditLog, AuditLogStats } from "@/lib/types";

const ACTION_COLORS: Record<string, string> = {
  "user.login": "bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200",
  "user.logout": "bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200",
  "widget.create": "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200",
  "widget.update": "bg-amber-50 text-amber-700 dark:bg-amber-900 dark:text-amber-200",
  "widget.delete": "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200",
  "submission.view": "bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200",
  "api-key.create": "bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200",
  "api-key.revoke": "bg-red-50 text-red-700 dark:bg-red-900 dark:text-red-200",
};

function getActionColor(action: string): string {
  return ACTION_COLORS[action] || "bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-200";
}

export function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[] | null>(null);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const PAGE_SIZE = 50;

  useEffect(() => {
    loadData();
  }, [page]);

  async function loadData() {
    try {
      setError(null);
      const [logsRes, statsRes] = await Promise.all([listAuditLogs(page, PAGE_SIZE), getAuditLogStats()]);
      setLogs(logsRes.items);
      setTotal(logsRes.pagination.total);
      setStats(statsRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load audit logs");
    }
  }

  if ((logs === null || stats === null) && !error) return <PageSpinner />;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track all activities in your account</p>
      </div>

      {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

      {stats && (
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <div className="px-5 py-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Logs</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalLogs}</p>
            </div>
          </Card>
          <Card>
            <div className="px-5 py-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Last 30 Days</p>
              <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.logsLast30Days}</p>
            </div>
          </Card>
          <Card>
            <div className="px-5 py-4">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Top Action</p>
              {stats.topActions.length > 0 ? (
                <p className="mt-1 truncate text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {stats.topActions[0].action}
                </p>
              ) : (
                <p className="mt-1 text-slate-500 dark:text-slate-400">No activity</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {logs && logs.length === 0 ? (
        <EmptyState
          title="No audit logs yet"
          description="Activity in your account will appear here"
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Entity</th>
                  <th className="px-5 py-3 font-medium">IP Address</th>
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {logs?.map((log) => (
                  <div key={log.id}>
                    <tr className="border-b border-slate-50 last:border-0 dark:border-slate-800/60">
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${getActionColor(
                            log.action,
                          )}`}
                        >
                          {log.action}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {log.entity}
                        {log.entityId && (
                          <span className="text-xs text-slate-500 dark:text-slate-500">
                            {" "}
                            ({log.entityId.slice(0, 8)})
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {log.ipAddress || "—"}
                      </td>
                      <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {log.changes && (
                          <button
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                          >
                            {expandedId === log.id ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandedId === log.id && log.changes && (
                      <tr className="border-b border-slate-50 dark:border-slate-800/60">
                        <td colSpan={5} className="px-5 py-4">
                          <div className="rounded bg-slate-50 p-3 dark:bg-slate-800/50">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Changes</p>
                            <pre className="text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                              {JSON.stringify(log.changes, null, 2)}
                            </pre>
                          </div>
                        </td>
                      </tr>
                    )}
                  </div>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button type="button" variant="secondary" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next
            </Button>
          </div>
        </div>
      )}

      <Card className="mt-6 bg-blue-50 dark:bg-blue-950">
        <CardHeader title="What are Audit Logs?" subtitle="Activity monitoring for security and compliance" />
        <div className="space-y-2 px-5 pb-5 text-sm text-slate-700 dark:text-slate-300">
          <p>
            Audit logs record all important actions in your account, including user logins, widget modifications, API key
            operations, and submission exports. Use this for:
          </p>
          <ul className="list-inside list-disc space-y-1 text-slate-600 dark:text-slate-400">
            <li>Security monitoring and incident investigation</li>
            <li>Compliance and regulatory requirements</li>
            <li>Tracking who changed what and when</li>
            <li>Detecting unauthorized access attempts</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
