import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function EmbedSnippet({ widgetId }: { widgetId: string }) {
  const [snippet, setSnippet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api
      .get<{ snippet: string }>(`/api/widgets/${widgetId}/embed`)
      .then((res) => setSnippet(res.snippet))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load embed snippet"));
  }, [widgetId]);

  async function copy() {
    if (!snippet) return;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card>
      <CardHeader title="Embed snippet" subtitle="Paste this one line into any website." />
      <div className="p-5">
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!error && !snippet && <p className="text-sm text-slate-400">Loading...</p>}
        {snippet && (
          <div className="flex items-center gap-2">
            <code className="flex-1 overflow-x-auto whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-100">
              {snippet}
            </code>
            <Button type="button" variant="secondary" onClick={copy}>
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
