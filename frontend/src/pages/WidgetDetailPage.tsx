import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Copy, FileText, ListChecks, Palette } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Widget, WidgetDraft, WidgetField } from "@/lib/types";
import { widgetToDraft } from "@/lib/widgetDraft";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ErrorBanner, PageSpinner } from "@/components/ui/Feedback";
import { Tabs } from "@/components/ui/Tabs";
import { FieldBuilder } from "@/components/FieldBuilder";
import { EmbedSnippet } from "@/components/EmbedSnippet";
import { WidgetTypePicker } from "@/components/WidgetTypePicker";
import { DisplayOptionsEditor } from "@/components/DisplayOptionsEditor";
import { WidgetPreview } from "@/components/WidgetPreview";

const tabItems = [
  { value: "content", label: "Content", icon: FileText },
  { value: "design", label: "Design", icon: Palette },
];

export function WidgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<WidgetDraft | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [tab, setTab] = useState("content");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    api
      .get<{ widget: Widget }>(`/api/widgets/${id}`)
      .then((res) => {
        setDraft(widgetToDraft(res.widget));
        setIsActive(res.widget.isActive);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Failed to load widget"));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

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
      setDraft(widgetToDraft(res.widget));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
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
  if (!draft) return <PageSpinner />;

  return (
    <div>
      <Link to="/widgets" className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        ← Back to widgets
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{draft.title || "Untitled widget"}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Edit this widget and grab its embed snippet.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onDuplicate} disabled={duplicating}>
            <Copy className="h-3.5 w-3.5" /> {duplicating ? "Duplicating..." : "Duplicate"}
          </Button>
          <Button variant="danger" onClick={onDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete widget"}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {saveError && <ErrorBanner message={saveError} />}

          <EmbedSnippet widgetId={id!} />

          <Tabs items={tabItems} value={tab} onChange={setTab} />

          {tab === "content" ? (
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
                  <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                    <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                    Active (inactive widgets stop rendering and reject submissions)
                  </label>
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
                <CardHeader title="Type" />
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
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <WidgetPreview draft={draft} />
        </div>
      </div>
    </div>
  );
}
