import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { FileText, ListChecks, Palette, Sparkles, Wand2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Widget, WidgetDraft, WidgetField } from "@/lib/types";
import { blankDraft } from "@/lib/widgetDraft";
import { blankTemplate, widgetTemplates, type WidgetTemplate } from "@/lib/templates";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/Feedback";
import { Tabs } from "@/components/ui/Tabs";
import { FieldBuilder } from "@/components/FieldBuilder";
import { TemplatePicker } from "@/components/TemplatePicker";
import { WidgetTypePicker } from "@/components/WidgetTypePicker";
import { DisplayOptionsEditor } from "@/components/DisplayOptionsEditor";
import { WidgetPreview } from "@/components/WidgetPreview";

function initialDraft(templateId: string | null): WidgetDraft {
  if (!templateId) return blankDraft;
  const match = [...widgetTemplates, blankTemplate].find((t) => t.id === templateId);
  return match?.draft ?? blankDraft;
}

const tabItems = [
  { value: "content", label: "Content", icon: FileText },
  { value: "design", label: "Design", icon: Palette },
];

export function NewWidgetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [draft, setDraft] = useState<WidgetDraft>(() => initialDraft(searchParams.get("template")));
  const [tab, setTab] = useState("content");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function patch<K extends keyof WidgetDraft>(key: K, value: WidgetDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function applyTemplate(template: WidgetTemplate) {
    setDraft(template.draft);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<{ widget: Widget }>("/api/widgets", {
        type: draft.type,
        title: draft.title,
        description: draft.description || undefined,
        buttonText: draft.buttonText,
        fields: draft.fields,
        displayOptions: draft.displayOptions,
      });
      navigate(`/widgets/${res.widget.id}?tab=embed`, { state: { justCreated: true } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create widget");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Link to="/widgets" className="text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200">
        ← Back to widgets
      </Link>
      <div className="mt-2 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" strokeWidth={2} />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">New widget</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Configure the form your visitors will see.</p>

      <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          {error && <ErrorBanner message={error} />}

          <Card>
            <CardHeader icon={Wand2} title="Start from a template" subtitle="Pick one to fill in everything below, or start blank." />
            <div className="p-5">
              <TemplatePicker onSelect={applyTemplate} />
            </div>
          </Card>

          <Tabs items={tabItems} value={tab} onChange={setTab} />

          {tab === "content" ? (
            <div className="space-y-6">
              <Card>
                <CardHeader icon={FileText} title="Details" />
                <div className="space-y-4 p-5">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      required
                      value={draft.title}
                      onChange={(e) => patch("title", e.target.value)}
                      placeholder="Get 10% off your first order"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (optional)</Label>
                    <Textarea
                      id="description"
                      rows={2}
                      value={draft.description}
                      onChange={(e) => patch("description", e.target.value)}
                      placeholder="Join our newsletter for exclusive deals"
                    />
                  </div>
                  <div>
                    <Label htmlFor="buttonText">Button text</Label>
                    <Input id="buttonText" required value={draft.buttonText} onChange={(e) => patch("buttonText", e.target.value)} />
                  </div>
                </div>
              </Card>

              <Card>
                <CardHeader icon={ListChecks} title="Fields" subtitle="What visitors will fill in." />
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

          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => navigate("/widgets")}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create widget"}
            </Button>
          </div>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <WidgetPreview draft={draft} />
        </div>
      </form>
    </div>
  );
}
