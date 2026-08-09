import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LayoutTemplate, MousePointerClick, UserPlus } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Widget } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Switch } from "@/components/ui/Switch";
import { EmptyState, ErrorBanner, PageSpinner } from "@/components/ui/Feedback";

const typeLabels: Record<Widget["type"], string> = {
  SIGNUP: "Signup form",
  CTA: "Call to action",
  POPOVER: "Popover",
};

const typeIcons: Record<Widget["type"], typeof UserPlus> = {
  SIGNUP: UserPlus,
  CTA: MousePointerClick,
  POPOVER: LayoutTemplate,
};

export function WidgetsPage() {
  const [widgets, setWidgets] = useState<Widget[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ widgets: Widget[] }>("/api/widgets")
      .then((res) => setWidgets(res.widgets))
      .catch((err) => setError(err instanceof ApiError ? err.message : "Failed to load widgets"));
  }, []);

  async function toggleActive(widget: Widget, next: boolean) {
    setTogglingId(widget.id);
    setWidgets((list) => list?.map((w) => (w.id === widget.id ? { ...w, isActive: next } : w)) ?? list);
    try {
      await api.patch(`/api/widgets/${widget.id}`, { isActive: next });
    } catch {
      // Revert on failure — the toggle is optimistic, but the truth is the server's.
      setWidgets((list) => list?.map((w) => (w.id === widget.id ? { ...w, isActive: !next } : w)) ?? list);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Widgets</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage your embeddable widgets.</p>
        </div>
        <Link to="/widgets/new">
          <Button>New widget</Button>
        </Link>
      </div>

      <div className="mt-6">
        {error && <ErrorBanner message={error} />}
        {!error && widgets === null && <PageSpinner />}
        {widgets !== null && widgets.length === 0 && (
          <EmptyState
            title="No widgets yet"
            description="Create your first widget to get an embed snippet you can paste into any site."
            action={
              <Link to="/widgets/new">
                <Button>New widget</Button>
              </Link>
            }
          />
        )}
        {widgets !== null && widgets.length > 0 && (
          <Card>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3 font-medium">Title</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Active</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {widgets.map((widget) => {
                  const Icon = typeIcons[widget.type];
                  return (
                    <tr key={widget.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ background: widget.displayOptions.primaryColor || "#4f46e5" }}
                          />
                          <span className="font-medium text-slate-900">{widget.title}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                          {typeLabels[widget.type]}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <Switch
                          checked={widget.isActive}
                          disabled={togglingId === widget.id}
                          onChange={(next) => toggleActive(widget, next)}
                          label={`${widget.isActive ? "Deactivate" : "Activate"} ${widget.title}`}
                        />
                      </td>
                      <td className="px-5 py-3 text-slate-500">{new Date(widget.createdAt).toLocaleDateString()}</td>
                      <td className="px-5 py-3 text-right">
                        <Link to={`/widgets/${widget.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </div>
  );
}
