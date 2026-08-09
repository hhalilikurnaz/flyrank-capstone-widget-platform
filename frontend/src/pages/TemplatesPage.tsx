import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Sparkles } from "lucide-react";
import { blankTemplate, widgetTemplates, type WidgetTemplate } from "@/lib/templates";
import type { WidgetType } from "@/lib/types";
import { WidgetBox } from "@/components/WidgetPreview";
import { Input } from "@/components/ui/Input";

const typeFilters: { value: WidgetType | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "SIGNUP", label: "Signup" },
  { value: "CTA", label: "CTA" },
  { value: "POPOVER", label: "Popover" },
];

const typeLabels: Record<WidgetType, string> = {
  SIGNUP: "Signup",
  CTA: "CTA",
  POPOVER: "Popover",
};

// Soft hex -> translucent rgba, so every card's backdrop is tinted toward
// that template's own brand color instead of one flat gray for all of them.
function tint(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function TemplateCard({ template, index }: { template: WidgetTemplate; index: number }) {
  const navigate = useNavigate();
  const Icon = template.icon;
  const color = template.draft.displayOptions.primaryColor;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
    >
      <div
        className="relative flex h-48 items-start justify-center overflow-hidden pt-5"
        style={{ background: `radial-gradient(circle at 30% 20%, ${tint(color, 0.16)}, transparent 60%), radial-gradient(circle at 80% 80%, ${tint(color, 0.12)}, transparent 55%)` }}
      >
        <div className="absolute inset-0 bg-[#f8f8f6] dark:bg-slate-950/40" style={{ zIndex: -1 }} />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-slate-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </span>
        <span
          className="absolute right-3 top-3 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm"
          style={{ background: color }}
        >
          {typeLabels[template.draft.type]}
        </span>
        <div className="w-[220px] origin-top scale-[.82] transition-transform duration-300 group-hover:scale-[.86]">
          <WidgetBox draft={template.draft} staticLayout />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
            style={{ background: color }}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{template.name}</p>
        </div>
        <p className="flex-1 text-xs leading-snug text-slate-500 dark:text-slate-400">{template.description}</p>
        <button
          type="button"
          onClick={() => navigate(`/widgets/new?template=${template.id}`)}
          className="group/btn mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
        >
          Use this template
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
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
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" strokeWidth={2} />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Template marketplace</h1>
      </div>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Start from a proven layout. Every card below is a live, interactive render, not a screenshot.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1.5">
          {typeFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setTypeFilter(f.value)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                typeFilter === f.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-400"
                  : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
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
        {filtered.map((template, i) => (
          <TemplateCard key={template.id} template={template} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-12 text-center text-sm text-slate-400">No templates match your search.</p>
      )}
    </div>
  );
}
