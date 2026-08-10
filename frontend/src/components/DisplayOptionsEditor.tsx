import {
  AlignCenter,
  CaseSensitive,
  Clock,
  CornerDownLeft,
  CornerDownRight,
  MoonStar,
  Palette,
  Rows3,
  Sparkles,
  Square,
  Sun,
  Type as TypeIcon,
} from "lucide-react";
import type { DisplayOptions } from "@/lib/types";
import { Input, Label } from "@/components/ui/Input";

type Required4 = Required<DisplayOptions>;

const positions: { value: Required4["position"]; label: string; icon: typeof AlignCenter }[] = [
  { value: "bottom-right", label: "Bottom right", icon: CornerDownRight },
  { value: "bottom-left", label: "Bottom left", icon: CornerDownLeft },
  { value: "center", label: "Center", icon: AlignCenter },
  { value: "inline", label: "Inline", icon: Rows3 },
];

const colorSwatches = ["#4f46e5", "#e34948", "#1baf7a", "#eda100", "#4a3aa7", "#0b0b0b"];

const fontOptions: { value: Required4["fontFamily"]; label: string; stack: string }[] = [
  { value: "system", label: "System", stack: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif" },
  { value: "serif", label: "Serif", stack: "Georgia,Cambria,'Times New Roman',serif" },
  { value: "rounded", label: "Rounded", stack: "'SF Pro Rounded',ui-rounded,'Segoe UI',sans-serif" },
  { value: "mono", label: "Mono", stack: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" },
];

const shadowOptions: { value: Required4["shadow"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "soft", label: "Soft" },
  { value: "medium", label: "Medium" },
  { value: "strong", label: "Strong" },
];

const animationOptions: { value: Required4["animation"]; label: string }[] = [
  { value: "none", label: "None" },
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide up" },
  { value: "bounce", label: "Bounce" },
];

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-slate-100 pt-5 first:border-t-0 first:pt-0 dark:border-slate-800">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        {title}
      </p>
      {children}
    </div>
  );
}

function SegmentedGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
            value === opt.value
              ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
              : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function DisplayOptionsEditor({
  value,
  onChange,
}: {
  value: Required4;
  onChange: (next: Required4) => void;
}) {
  function set<K extends keyof Required4>(key: K, v: Required4[K]) {
    onChange({ ...value, [key]: v });
  }

  return (
    <div className="space-y-5">
      <Section title="Position & timing" icon={Clock}>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {positions.map((pos) => {
              const Icon = pos.icon;
              const active = pos.value === value.position;
              return (
                <button
                  key={pos.value}
                  type="button"
                  onClick={() => set("position", pos.value)}
                  className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors ${
                    active
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {pos.label}
                </button>
              );
            })}
          </div>
          <div>
            <Label htmlFor="delaySeconds">Delay before showing (seconds)</Label>
            <Input
              id="delaySeconds"
              type="number"
              min={0}
              max={600}
              value={value.delaySeconds}
              onChange={(e) => set("delaySeconds", Number(e.target.value) || 0)}
              className="w-28"
            />
          </div>
        </div>
      </Section>

      <Section title="Theme & color" icon={Palette}>
        <div className="space-y-4">
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5 dark:border-slate-700">
            <button
              type="button"
              onClick={() => set("theme", "light")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                value.theme === "light" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-slate-100" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Sun className="h-3.5 w-3.5" /> Light
            </button>
            <button
              type="button"
              onClick={() => set("theme", "dark")}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                value.theme === "dark" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <MoonStar className="h-3.5 w-3.5" /> Dark
            </button>
          </div>

          <div>
            <Label htmlFor="primaryColor">Brand color</Label>
            <div className="flex items-center gap-2">
              <input
                aria-label="Brand color picker"
                type="color"
                value={value.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-slate-300 p-0.5 dark:border-slate-600"
              />
              <Input
                id="primaryColor"
                value={value.primaryColor}
                onChange={(e) => set("primaryColor", e.target.value)}
                className="w-28 font-mono text-xs"
              />
              <div className="flex gap-2">
                {colorSwatches.map((c) => {
                  const active = c.toLowerCase() === value.primaryColor.toLowerCase();
                  return (
                    <button
                      key={c}
                      type="button"
                      aria-label={`Use ${c}`}
                      onClick={() => set("primaryColor", c)}
                      className={`h-7 w-7 rounded-full ring-2 ring-offset-2 transition-transform ring-offset-white dark:ring-offset-slate-900 ${
                        active ? "scale-110 ring-slate-900 dark:ring-white" : "ring-transparent hover:scale-105"
                      }`}
                      style={{ background: c }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section title="Typography" icon={TypeIcon}>
        <div className="grid grid-cols-4 gap-2">
          {fontOptions.map((opt) => {
            const active = opt.value === value.fontFamily;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set("fontFamily", opt.value)}
                className={`flex flex-col items-center gap-1 rounded-lg border p-2.5 text-xs transition-colors ${
                  active
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600"
                }`}
              >
                <CaseSensitive className="h-4 w-4" style={{ fontFamily: opt.stack }} strokeWidth={2} />
                <span style={{ fontFamily: opt.stack }}>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="Shape & shadow" icon={Square}>
        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <Label htmlFor="borderRadius">Corner radius</Label>
              <span className="text-xs tabular-nums text-slate-400">{value.borderRadius}px</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="borderRadius"
                type="range"
                min={0}
                max={24}
                value={value.borderRadius}
                onChange={(e) => set("borderRadius", Number(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <span
                className="h-8 w-8 shrink-0 border-2 border-indigo-400 dark:border-indigo-500"
                style={{ borderRadius: value.borderRadius }}
                aria-hidden="true"
              />
            </div>
          </div>
          <div>
            <Label>Shadow</Label>
            <SegmentedGroup options={shadowOptions} value={value.shadow} onChange={(v) => set("shadow", v)} />
          </div>
        </div>
      </Section>

      <Section title="Animation" icon={Sparkles}>
        <Label>Entrance</Label>
        <SegmentedGroup options={animationOptions} value={value.animation} onChange={(v) => set("animation", v)} />
      </Section>
    </div>
  );
}
