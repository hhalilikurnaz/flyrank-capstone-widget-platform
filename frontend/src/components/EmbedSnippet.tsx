import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { DashboardStats } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const POLL_MS = 5000;

export function EmbedSnippet({ widgetId }: { widgetId: string }) {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [impressions, setImpressions] = useState<number | null>(null);

  useEffect(() => {
    api
      .get<{ snippet: string }>(`/api/widgets/${widgetId}/embed`)
      .then((res) => setSnippet(res.snippet))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load embed snippet"));
  }, [widgetId]);

  useEffect(() => {
    let cancelled = false;
    function poll() {
      api
        .get<DashboardStats>(`/api/dashboard/stats?days=1&widgetId=${widgetId}`)
        .then((res) => {
          if (!cancelled) setImpressions(res.totalImpressions);
        })
        .catch(() => {});
    }
    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [widgetId]);

  async function copy() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardHeader title="Install on your website" subtitle="Paste this one line into any website, right before the closing body tag." />
      <div className="p-5">
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        {!error && !snippet && <p className="text-sm text-slate-400 dark:text-slate-500">Loading...</p>}
        {snippet && (
          <>
            <div className="flex items-center gap-2">
              <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-100 dark:bg-slate-800">
                {snippet}
              </code>
              <Button type="button" variant="secondary" onClick={copy}>
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm dark:border-slate-800 dark:bg-slate-800/60">
              <Eye className="h-4 w-4 text-slate-400" strokeWidth={2} />
              {impressions === null ? (
                <span className="text-slate-500 dark:text-slate-400">Checking for views...</span>
              ) : impressions === 0 ? (
                <span className="text-slate-500 dark:text-slate-400">Waiting for the first view. Paste the snippet on a live page to see it here.</span>
              ) : (
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {impressions} view{impressions === 1 ? "" : "s"} in the last 24 hours
                </span>
              )}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
