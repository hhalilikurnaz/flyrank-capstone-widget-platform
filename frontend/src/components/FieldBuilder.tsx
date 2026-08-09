import type { WidgetField } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const fieldTypes: WidgetField["type"][] = ["text", "email", "phone", "textarea"];

export function FieldBuilder({
  fields,
  onChange,
}: {
  fields: WidgetField[];
  onChange: (fields: WidgetField[]) => void;
}) {
  function updateField(index: number, patch: Partial<WidgetField>) {
    onChange(fields.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function removeField(index: number) {
    onChange(fields.filter((_, i) => i !== index));
  }

  function addField() {
    onChange([...fields, { name: `field_${fields.length + 1}`, label: "New field", type: "text", required: false }]);
  }

  return (
    <div className="space-y-3">
      {fields.map((field, i) => (
        <div key={i} className="flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
          <div className="min-w-[120px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Field name</label>
            <Input
              value={field.name}
              onChange={(e) => updateField(i, { name: e.target.value })}
              placeholder="email"
            />
          </div>
          <div className="min-w-[120px] flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Label</label>
            <Input
              value={field.label}
              onChange={(e) => updateField(i, { label: e.target.value })}
              placeholder="Email address"
            />
          </div>
          <div className="w-32">
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Type</label>
            <select
              value={field.type}
              onChange={(e) => updateField(i, { type: e.target.value as WidgetField["type"] })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {fieldTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-1.5 pb-2 text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => updateField(i, { required: e.target.checked })}
            />
            Required
          </label>
          <Button type="button" variant="danger" onClick={() => removeField(i)}>
            Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addField}>
        + Add field
      </Button>
    </div>
  );
}
