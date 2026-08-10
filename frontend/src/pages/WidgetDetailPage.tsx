import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Code2,
  Copy,
  Eye,
  FileText,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  ListChecks,
  Palette,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { DashboardStats, DeviceBreakdownEntry, Widget, WidgetDraft, WidgetField } from "@/lib/types";
import { widgetToDraft } from "@/lib/widgetDraft";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { ErrorBanner, PageSpinner } from "@/components/ui/Feedback";
import { Tabs } from "@/components/ui/Tabs";
import { StatTile } from "@/components/charts/StatTile";
import { TimeSeriesChart } from "@/components/charts/TimeSeriesChart";
import { DeviceDonut } from "@/components/charts/DeviceDonut";
import { FieldBuilder } from "@/components/FieldBuilder";
import { EmbedSnippet } from "@/components/EmbedSnippet";
import { WidgetTypePicker } from "@/components/WidgetTypePicker";
import { DisplayOptionsEditor } from "@/components/DisplayOptionsEditor";
import { WidgetPreview } from "@/components/WidgetPreview";
import { SubmissionsTable } from "@/components/SubmissionsTable";

const tabItems = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "edit", label: "Edit", icon: FileText },
  { value: "preview", label: "Preview", icon: Eye },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "submissions", label: "Submissions", icon: Inbox },
  { value: "embed", label: "Embed", icon: Code2 },
  { value: "settings", label: "Settings", icon: SettingsIcon },
];
const validTabs = new Set(tabItems.map((t) => t.value));

const editTabItems = [
  { value: "content", label: "Content", icon: FileText },
  { value: "design", label: "Design", icon: Palette },
];

export function WidgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const tab = requestedTab && validTabs.has(requestedTab) ? requestedTab : "overview";
  const [editSection, setEditSection] = useState("content");

  const [widget, setWidget] = useState<Widget | null>(null);
  const [draft, setDraft] = useState<WidgetDraft | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [showBanner, setShowBanner] = useState(Boolean((location.state as { justCreated?: boolean } | null)?.justCreated));

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [devices, setDevices] = useState<DeviceBreakdownEntry[] | null>(null);
  const [analyticsError, setAnalyticsError] = useState<string | null>(null);

  useEffect(() => {
    if (showBanner) {
      navigate(location.pathname + location.search, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = useCallback(() => {
    if (!id) return;
    api
      .get<{ widget: Widget }>(`/api/widgets/${id}`)
      .then((res) => {
        setWidget(res.widget);
        setDraft(widgetToDraft(res.widget));
        setIsActive(res.widget.isActive);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Failed to load widget"));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!id || (tab !== "analytics" && tab !== "overview")) return;
    setAnalyticsError(null);
    Promise.all([
      api.get<DashboardStats>(`/api/dashboard/stats?days=30&widgetId=${id}`),
      api.get<{ breakdown: DeviceBreakdownEntry[] }>(`/api/dashboard/device-breakdown?widgetId=${id}`),
    ])
      .then(([statsRes, deviceRes]) => {
        setStats(statsRes);
        setDevices(deviceRes.breakdown);
      })
      .catch((err) => setAnalyticsError(err instanceof ApiError ? err.message : "Failed to load analytics"));
  }, [id, tab]);

  function setTab(value: string) {
    setSearchParams({ tab: value }, { replace: true });
  }

  function patch<K extends keyof WidgetDraft>(key: K, value: WidgetDraft[K]) {
    setDraft((d) => (d ? { ...d, [key]: value } : d));
  }

  async function onSave() {
    if (!draft || !id) return;
    setSaveError(null);
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.patch<{ widget: Widget }>(`/api/widgets/${id}`, {
        type: draft.type,
        title: draft.title,
        description: draft.description || undefined,
        buttonText: draft.buttonText,
        fields: draft.fields,
        displayOptions: draft.displayOptions,
        isActive,
      });
      setWidget(res.widget);
      setDraft(widgetToDraft(res.widget));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function onToggleActive(next: boolean) {
    if (!id) return;
    setIsActive(next);
    setSaveError(null);
    try {
      const res = await api.patch<{ widget: Widget }>(`/api/widgets/${id}`, { isActive: next });
      setWidget(res.widget);
    } catch (err) {
      setIsActive(!next);
      setSaveError(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Delete this widget? This also removes it from any site it's embedded on.")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/widgets/${id}`);
      navigate("/widgets");
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to delete widget");
      setDeleting(false);
    }
  }

  async function onDuplicate() {
    if (!draft) return;
    setDuplicating(true);
    setSaveError(null);
    try {
      const res = await api.post<{ widget: Widget }>("/api/widgets", {
        type: draft.type,
        title: `${draft.title} (Copy)`,
        description: draft.description || undefined,
        buttonText: draft.buttonText,
        fields: draft.fields,
        displayOptions: draft.displayOptions,
      });
      navigate(`/widgets/${res.widget.id}`);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to duplicate widget");
      setDuplicating(false);
    }
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-2xl">
        <Link to="/widgets" className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
          ← Back to widgets
        </Link>
        <div className="mt-4">
          <ErrorBanner message={loadError} />
        </div>
      </div>
    );
  }
  if (!draft || !widget) return <PageSpinner />;

  const showPreviewColumn = tab === "edit";

  return (
    <div>
      <Link to="/widgets" className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        ← Back to widgets
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{draft.title || "Untitled widget"}</h1>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isActive
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <Button variant="secondary" onClick={onDuplicate} disabled={duplicating}>
          <Copy className="h-3.5 w-3.5" /> {duplicating ? "Duplicating..." : "Duplicate"}
        </Button>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage this widget: content, design, analytics, and leads.</p>

      {showBanner && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
          <p className="flex-1">Your widget is published. Copy the snippet below to add it to your site.</p>
          <button type="button" onClick={() => setShowBanner(false)} className="shrink-0 opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="mt-6">
        <Tabs items={tabItems} value={tab} onChange={setTab} />
      </div>

      {saveError && (
        <div className="mt-4">
          <ErrorBanner message={saveError} />
        </div>
      )}

      <div className={showPreviewColumn ? "mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]" : "mt-6"}>
        <div className="space-y-6">
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <StatTile label="Impressions" value={stats?.totalImpressions ?? 0} />
                <StatTile label="Submissions" value={stats?.totalSubmissions ?? 0} />
                <StatTile
                  label="Conversion rate"
                  value={(stats?.conversionRate ?? 0) * 100}
                  format={(n) => `${n.toFixed(1)}%`}
                />
              </div>
              <Card>
                <CardHeader title="Widget details" />
                <div className="space-y-3 p-5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Type</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{draft.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Created</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(widget.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Last updated</span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">{new Date(widget.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </Card>
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => setTab("embed")}>
                  Go to embed code
                </Button>
                <Button type="button" variant="secondary" onClick={() => setTab("edit")}>
                  Edit widget
                </Button>
              </div>
            </>
          )}

          {tab === "edit" && (
            <>
              <Tabs items={editTabItems} value={editSection} onChange={setEditSection} />
              {editSection === "content" ? (
                <div className="space-y-6">
                  <Card>
                    <CardHeader icon={FileText} title="Details" />
                    <div className="space-y-4 p-5">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" required value={draft.title} onChange={(e) => patch("title", e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          rows={2}
                          value={draft.description}
                          onChange={(e) => patch("description", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="buttonText">Button text</Label>
                        <Input id="buttonText" required value={draft.buttonText} onChange={(e) => patch("buttonText", e.target.value)} />
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <CardHeader icon={ListChecks} title="Fields" />
                    <div className="p-5">
                      <FieldBuilder fields={draft.fields} onChange={(fields: WidgetField[]) => patch("fields", fields)} />
                    </div>
                  </Card>
                </div>
              ) : (
                <div className="space-y-6">
                  <Card>
                    <CardHeader icon={LayoutGrid} title="Type" />
                    <div className="p-5">
                      <WidgetTypePicker value={draft.type} onChange={(type) => patch("type", type)} />
                    </div>
                  </Card>

                  <Card>
                    <CardHeader icon={Palette} title="Appearance" subtitle="Position, theme, brand color, and timing." />
                    <div className="p-5">
                      <DisplayOptionsEditor value={draft.displayOptions} onChange={(opts) => patch("displayOptions", opts)} />
                    </div>
                  </Card>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                {saved && <span className="text-sm text-emerald-600 dark:text-emerald-400">Saved</span>}
                <Button onClick={onSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </>
          )}

          {tab === "preview" && (
            <Card>
              <CardHeader title="Preview" subtitle="Exactly what visitors will see, across devices." />
              <div className="p-5">
                <WidgetPreview draft={draft} />
              </div>
            </Card>
          )}

          {tab === "analytics" &&
            (analyticsError ? (
              <ErrorBanner message={analyticsError} />
            ) : !stats || !devices ? (
              <PageSpinner />
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <StatTile label="Impressions" value={stats.totalImpressions} />
                  <StatTile label="Submissions" value={stats.totalSubmissions} />
                  <StatTile label="Conversion rate" value={stats.conversionRate * 100} format={(n) => `${n.toFixed(1)}%`} />
                </div>
                <Card>
                  <CardHeader title="Submissions over time" subtitle="Last 30 days" />
                  <div className="p-5">
                    <TimeSeriesChart data={stats.timeSeries} />
                  </div>
                </Card>
                <Card>
                  <CardHeader title="Device breakdown" subtitle="From widget config requests" />
                  <div className="p-5">
                    <DeviceDonut data={devices} emptyLabel="No views yet" />
                  </div>
                </Card>
              </>
            ))}

          {tab === "submissions" && <SubmissionsTable widgetId={id} lockWidget />}

          {tab === "embed" && <EmbedSnippet widgetId={id!} />}

          {tab === "settings" && (
            <>
              <Card>
                <CardHeader title="Status" subtitle="Inactive widgets stop rendering and reject submissions." />
                <div className="flex items-center justify-between p-5">
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    {isActive ? "Active: live on your site" : "Inactive: not rendering"}
                  </span>
                  <Switch checked={isActive} onChange={onToggleActive} label="Toggle widget active status" />
                </div>
              </Card>

              <Card>
                <CardHeader title="Duplicate" subtitle="Create a copy of this widget to start a new variant." />
                <div className="p-5">
                  <Button variant="secondary" onClick={onDuplicate} disabled={duplicating}>
                    <Copy className="h-3.5 w-3.5" /> {duplicating ? "Duplicating..." : "Duplicate widget"}
                  </Button>
                </div>
              </Card>

              <Card className="border-red-200 dark:border-red-900/60">
                <CardHeader
                  icon={AlertTriangle}
                  title="Danger zone"
                  subtitle="Deleting a widget also removes it from any site it's embedded on."
                />
                <div className="p-5">
                  <Button variant="danger" onClick={onDelete} disabled={deleting}>
                    {deleting ? "Deleting..." : "Delete widget"}
                  </Button>
                </div>
              </Card>
            </>
          )}
        </div>

        {showPreviewColumn && (
          <div className="lg:sticky lg:top-8 lg:self-start">
            <WidgetPreview draft={draft} />
          </div>
        )}
      </div>
    </div>
  );
}
