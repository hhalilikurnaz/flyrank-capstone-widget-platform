import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import { blankTemplate, widgetTemplates, type WidgetTemplate } from "@/lib/templates";
import type { WidgetType } from "@/lib/types";
import { WidgetBox } from "@/components/WidgetPreview";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const typeFilters: { value: WidgetType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SIGNUP", label: "Signup" },
  { value: "CTA", label: "CTA" },
  { value: "POPOVER", label: "Popover" },
];

function TemplateCard({ template }: { template: WidgetTemplate }) {
  const navigate = useNavigate();
  const Icon = template.icon;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-44 items-start justify-center overflow-hidden bg-[#f6f6f4] pt-4">
        <div className="w-[220px] origin-top scale-[.85]">
          <WidgetBox draft={template.draft} staticLayout />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </span>
          <p className="text-sm font-medium text-slate-900">{template.name}</p>
        </div>
        <p className="flex-1 text-xs leading-snug text-slate-500">{template.description}</p>
        <Button
          type="button"
          variant="secondary"
          className="mt-1 w-full"
          onClick={() => navigate(`/widgets/new?template=${template.id}`)}
        >
          Use this template
        </Button>
      </div>
    </div>
  );
}

export function TemplatesPage() {
  const [typeFilter, setTypeFilter] = useState<WidgetType | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const all = useMemo(() => [...widgetTemplates, blankTemplate], []);

  const filtered = all.filter((t) => {
    const matchesType = typeFilter === "ALL" || t.draft.type === typeFilter;
    const matchesSearch = search.trim().length === 0 || t.name.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Template marketplace</h1>
      <p className="mt-1 text-sm text-slate-500">Start from a proven layout — every card below is a live preview, not a screenshot.</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === f.value ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-56">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-8"
          />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((template) => (
          <TemplateCard key={template.id} template={template} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-slate-400">No templates match your search.</p>
      )}
    </div>
  );
}
