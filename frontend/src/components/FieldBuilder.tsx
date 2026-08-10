import { AnimatePresence, motion } from "framer-motion";
import { AlignLeft, ChevronDown, ChevronUp, Mail, Phone, Trash2, Type as TypeIcon } from "lucide-react";
import type { WidgetField } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const fieldTypes: { value: WidgetField["type"]; label: string; icon: typeof TypeIcon }[] = [
  { value: "text", label: "Text", icon: TypeIcon },
  { value: "email", label: "Email", icon: Mail },
  { value: "phone", label: "Phone", icon: Phone },
  { value: "textarea", label: "Long text", icon: AlignLeft },
];

const fieldIcons: Record<WidgetField["type"], typeof TypeIcon> = {
  text: TypeIcon,
  email: Mail,
  phone: Phone,
  textarea: AlignLeft,
};

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

  function moveField(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  function addField() {
    onChange([...fields, { name: `field_${fields.length + 1}`, label: "New field", type: "text", required: false }]);
  }

  return (
    <div className="space-y-3">
      <AnimatePresence initial={false}>
        {fields.map((field, i) => {
          const Icon = fieldIcons[field.type];
          return (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-800/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700">
                  {i + 1}
                </span>
                <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{field.name || "field"}</span>
                <div className="ml-auto flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveField(i, -1)}
                    disabled={i === 0}
                    aria-label="Move field up"
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveField(i, 1)}
                    disabled={i === fields.length - 1}
                    aria-label="Move field down"
                    className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-slate-700 dark:hover:text-slate-300"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeField(i)}
                    aria-label="Remove field"
                    className="ml-1 rounded p-1 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-3">
                <div className="flex flex-wrap gap-2">
                  <div className="min-w-[120px] flex-1">
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Field name</label>
                    <Input value={field.name} onChange={(e) => updateField(i, { name: e.target.value })} placeholder="email" />
                  </div>
                  <div className="min-w-[120px] flex-1">
                    <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Label</label>
                    <Input value={field.label} onChange={(e) => updateField(i, { label: e.target.value })} placeholder="Email address" />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {fieldTypes.map((t) => {
                      const TIcon = t.icon;
                      const active = t.value === field.type;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => updateField(i, { type: t.value })}
                          className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            active
                              ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                              : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
                          }`}
                        >
                          <TIcon className="h-3.5 w-3.5" strokeWidth={2} />
                          {t.label}
                        </button>
                      );
                    })}
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={field.required}
                      onChange={(e) => updateField(i, { required: e.target.checked })}
                    />
                    Required
                  </label>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <Button
        type="button"
        variant="secondary"
        onClick={addField}
        className="w-full justify-center border-dashed"
      >
        + Add field
      </Button>
    </div>
  );
}
