import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Search, X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Submission, Widget } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorBanner, PageSpinner } from "@/components/ui/Feedback";

const PAGE_SIZE = 50;

function toCsv(rows: Submission[]) {
  const dataKeys = Array.from(new Set(rows.flatMap((r) => Object.keys(r.data))));
  const header = ["Widget", ...dataKeys, "Location", "Date"];
  const lines = rows.map((r) => {
    const location = r.country ? `${r.city ?? ""} ${r.country}`.trim() : "";
    const cells = [r.widgetTitle, ...dataKeys.map((k) => r.data[k] ?? ""), location, new Date(r.createdAt).toISOString()];
    return cells.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",");
  });
  return [header.join(","), ...lines].join("\n");
}

function downloadCsv(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function primaryLine(data: Record<string, string>) {
  const values = Object.values(data).filter(Boolean);
  return values.slice(0, 2).join(" · ") || "(no data)";
}

export function SubmissionsTable({ widgetId, lockWidget }: { widgetId?: string; lockWidget?: boolean }) {
  const [widgets, setWidgets] = useState<Widget[] | null>(null);
  const [selectedWidgetId, setSelectedWidgetId] = useState<string>(widgetId ?? "");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Submission[] | null>(null);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Submission | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lockWidget) return;
    api
      .get<{ widgets: Widget[] }>("/api/widgets")
      .then((res) => setWidgets(res.widgets))
      .catch(() => setWidgets([]));
  }, [lockWidget]);

  useEffect(() => {
    setError(null);
    const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) });
    if (selectedWidgetId) params.set("widgetId", selectedWidgetId);
    api
      .get<{ items: Submission[]; total: number }>(`/api/dashboard/submissions?${params}`)
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load submissions"));
  }, [page, selectedWidgetId]);

  const filtered = useMemo(() => {
    if (!items) return [];
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((s) => {
      const haystack = `${s.widgetTitle} ${JSON.stringify(s.data)} ${s.city ?? ""} ${s.country ?? ""}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query]);

  function onWidgetFilterChange(next: string) {
    setSelectedWidgetId(next);
    setPage(1);
  }

  function exportCsv() {
    if (filtered.length === 0) return;
    downloadCsv(toCsv(filtered), `submissions-${new Date().toISOString().slice(0, 10)}.csv`);
  }

  if (error) return <ErrorBanner message={error} />;
  if (!items) return <PageSpinner />;

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" strokeWidth={2} />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, email, location..."
            className="pl-9"
          />
        </div>
        {!lockWidget && (
          <select
            value={selectedWidgetId}
            onChange={(e) => onWidgetFilterChange(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="">All widgets</option>
            {(widgets ?? []).map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
        )}
        <Button type="button" variant="secondary" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </div>

      <Card className="mt-4">
        {filtered.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No submissions found" description="Leads will show up here once visitors start submitting your widgets." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-5 py-3 font-medium">Submission</th>
                {!lockWidget && <th className="px-5 py-3 font-medium">Widget</th>}
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setDetail(s)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-slate-50 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                >
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">{primaryLine(s.data)}</td>
                  {!lockWidget && <td className="px-5 py-3 text-slate-600 dark:text-slate-400">{s.widgetTitle}</td>}
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">
                    {s.country ? `${s.city ?? ""} ${s.country}`.trim() : "Unknown"}
                  </td>
                  <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{new Date(s.createdAt).toLocaleString()}</td>
                  <td className="px-5 py-3 text-right text-xs font-medium text-indigo-600 dark:text-indigo-400">View</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

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

      <AnimatePresence>
        {detail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4"
            onClick={() => setDetail(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Submission detail</h2>
                <button
                  type="button"
                  onClick={() => setDetail(null)}
                  className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-3 p-5">
                {Object.entries(detail.data).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{key}</p>
                    <p className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">{value || "(empty)"}</p>
                  </div>
                ))}
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Widget</p>
                  <p className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">{detail.widgetTitle}</p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Location</p>
                  <p className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">
                    {detail.country ? `${detail.city ?? ""} ${detail.country}`.trim() : "Unknown"}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Submitted</p>
                  <p className="mt-0.5 text-sm text-slate-900 dark:text-slate-100">{new Date(detail.createdAt).toLocaleString()}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
