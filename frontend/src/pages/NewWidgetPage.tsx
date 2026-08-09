import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import type { Widget, WidgetField, WidgetType } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/Feedback";
import { FieldBuilder } from "@/components/FieldBuilder";

const typeOptions: { value: WidgetType; label: string }[] = [
  { value: "SIGNUP", label: "Signup form" },
  { value: "CTA", label: "Call to action" },
  { value: "POPOVER", label: "Popover" },
];

export function NewWidgetPage() {
  const navigate = useNavigate();
  const [type, setType] = useState<WidgetType>("SIGNUP");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [buttonText, setButtonText] = useState("Submit");
  const [fields, setFields] = useState<WidgetField[]>([
    { name: "email", label: "Email", type: "email", required: true },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post<{ widget: Widget }>("/api/widgets", {
        type,
        title,
        description: description || undefined,
        buttonText,
        fields,
      });
      navigate(`/widgets/${res.widget.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create widget");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/widgets" className="text-sm text-slate-500 hover:text-slate-800">
        ← Back to widgets
      </Link>
      <h1 className="mt-2 text-xl font-semibold text-slate-900">New widget</h1>
      <p className="mt-1 text-sm text-slate-500">Configure the form your visitors will see.</p>

      <form onSubmit={onSubmit} className="mt-6">
        <Card>
          <CardHeader title="Details" />
          <div className="space-y-4 p-5">
            {error && <ErrorBanner message={error} />}
            <div>
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value as WidgetType)}
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
              <Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Get 10% off your first order" />
            </div>
            <div>
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea id="description" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Join our newsletter for exclusive deals" />
            </div>
            <div>
              <Label htmlFor="buttonText">Button text</Label>
              <Input id="buttonText" required value={buttonText} onChange={(e) => setButtonText(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="mt-6">
          <CardHeader title="Fields" subtitle="What visitors will fill in." />
          <div className="p-5">
            <FieldBuilder fields={fields} onChange={setFields} />
          </div>
        </Card>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate("/widgets")}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create widget"}
          </Button>
        </div>
      </form>
    </div>
  );
}
