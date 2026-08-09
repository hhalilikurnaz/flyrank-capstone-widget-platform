import { blankTemplate, widgetTemplates, type WidgetTemplate } from "@/lib/templates";

export function TemplatePicker({ onSelect }: { onSelect: (template: WidgetTemplate) => void }) {
  const all = [...widgetTemplates, blankTemplate];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {all.map((template) => {
        const Icon = template.icon;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template)}
            className="flex flex-col items-start gap-2 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
            <span className="text-sm font-medium text-slate-900">{template.name}</span>
            <span className="text-xs leading-snug text-slate-500">{template.description}</span>
          </button>
        );
      })}
    </div>
  );
}
