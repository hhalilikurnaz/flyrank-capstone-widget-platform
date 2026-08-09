import { LayoutTemplate, MousePointerClick, UserPlus } from "lucide-react";
import type { WidgetType } from "@/lib/types";

const options: { value: WidgetType; label: string; description: string; icon: typeof UserPlus }[] = [
  { value: "SIGNUP", label: "Signup form", description: "Collect emails, always visible or inline", icon: UserPlus },
  { value: "CTA", label: "Call to action", description: "Promote an offer with one clear action", icon: MousePointerClick },
  { value: "POPOVER", label: "Popover", description: "Appears after a delay, dismissible", icon: LayoutTemplate },
];

export function WidgetTypePicker({ value, onChange }: { value: WidgetType; onChange: (type: WidgetType) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex flex-col items-start gap-1.5 rounded-lg border p-3 text-left transition-colors ${
              active ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <Icon className={`h-4 w-4 ${active ? "text-indigo-600" : "text-slate-500"}`} strokeWidth={2} />
            <span className={`text-sm font-medium ${active ? "text-indigo-700" : "text-slate-900"}`}>{opt.label}</span>
            <span className="text-xs leading-snug text-slate-500">{opt.description}</span>
          </button>
        );
      })}
    </div>
  );
}
