import { Monitor, Smartphone, Tablet } from "lucide-react";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

const devices: { value: PreviewDevice; label: string; icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", icon: Monitor },
  { value: "tablet", label: "Tablet", icon: Tablet },
  { value: "mobile", label: "Mobile", icon: Smartphone },
];

export function DevicePreviewToggle({ value, onChange }: { value: PreviewDevice; onChange: (d: PreviewDevice) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 dark:border-slate-700 dark:bg-slate-800">
      {devices.map((d) => {
        const Icon = d.icon;
        const active = d.value === value;
        return (
          <button
            key={d.value}
            type="button"
            onClick={() => onChange(d.value)}
            aria-label={d.label}
            title={d.label}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
              active
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300"
                : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={2} />
          </button>
        );
      })}
    </div>
  );
}
