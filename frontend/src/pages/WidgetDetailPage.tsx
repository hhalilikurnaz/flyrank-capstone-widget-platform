import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import type { Widget, WidgetField, WidgetType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ErrorBanner, PageSpinner } from "@/components/ui/Feedback";
import { FieldBuilder } from "@/components/FieldBuilder";
import { EmbedSnippet } from "@/components/EmbedSnippet";

const typeOptions: { value: WidgetType; label: string }[] = [
  { value: "SIGNUP", label: "Signup form" },
  { value: "CTA", label: "Call to action" },
  { value: "POPOVER", label: "Popover" },
];

export function WidgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [widget, setWidget] = useState<Widget | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    api
      .get<{ widget: Widget }>(`/api/widgets/${id}`)
      .then((res) => setWidget(res.widget))
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : "Failed to load widget"));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  function patchWidget<K extends keyof Widget>(key: K, value: Widget[K]) {
    setWidget((w) => (w ? { ...w, [key]: value } : w));
  }

  async function onSave() {
    if (!widget || !id) return;
    setSaveError(null);
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.patch<{ widget: Widget }>(`/api/widgets/${id}`, {
        type: widget.type,
        title: widget.title,
        description: widget.description || undefined,
        buttonText: widget.buttonText,
        fields: widget.fields,
        isActive: widget.isActive,
      });
      setWidget(res.widget);
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

  if (loadError) return <ErrorBanner message={loadError} />;
  if (!widget) return <PageSpinner />;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{widget.title}</h1>
          <p className="mt-1 text-sm text-slate-500">Edit this widget and grab its embed snippet.</p>
        </div>
        <Button variant="danger" onClick={onDelete} disabled={deleting}>
          {deleting ? "Deleting..." : "Delete widget"}
        </Button>
      </div>

      <div className="mt-6">
        <EmbedSnippet widgetId={widget.id} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Details" />
        <div className="space-y-4 p-5">
          {saveError && <ErrorBanner message={saveError} />}
          <div>
            <Label htmlFor="type">Type</Label>
            <select
              id="type"
              value={widget.type}
              onChange={(e) => patchWidget("type", e.target.value as WidgetType)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" required value={widget.title} onChange={(e) => patchWidget("title", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              value={widget.description ?? ""}
              onChange={(e) => patchWidget("description", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="buttonText">Button text</Label>
            <Input id="buttonText" required value={widget.buttonText} onChange={(e) => patchWidget("buttonText", e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={widget.isActive} onChange={(e) => patchWidget("isActive", e.target.checked)} />
            Active (inactive widgets stop rendering and reject submissions)
          </label>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Fields" />
        <div className="p-5">
          <FieldBuilder fields={widget.fields} onChange={(fields: WidgetField[]) => patchWidget("fields", fields)} />
        </div>
      </Card>

      <div className="mt-6 flex items-center justify-end gap-3">
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
        <Button onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
