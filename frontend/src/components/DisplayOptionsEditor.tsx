import { AlignCenter, CornerDownLeft, CornerDownRight, MoonStar, Rows3, Sun } from "lucide-react";
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
      <div>
        <Label>Position</Label>
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
                  active ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
                {pos.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <Label>Theme</Label>
        <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
          <button
            type="button"
            onClick={() => set("theme", "light")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              value.theme === "light" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            <Sun className="h-3.5 w-3.5" /> Light
          </button>
          <button
            type="button"
            onClick={() => set("theme", "dark")}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              value.theme === "dark" ? "bg-slate-900 text-white shadow-sm" : "text-slate-500"
            }`}
          >
            <MoonStar className="h-3.5 w-3.5" /> Dark
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="primaryColor">Brand color</Label>
        <div className="flex items-center gap-2">
          <input
            id="primaryColor"
            type="color"
            value={value.primaryColor}
            onChange={(e) => set("primaryColor", e.target.value)}
            className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-slate-300 p-0.5"
          />
          <Input
            value={value.primaryColor}
            onChange={(e) => set("primaryColor", e.target.value)}
            className="w-28 font-mono text-xs"
          />
          <div className="flex gap-1.5">
            {colorSwatches.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Use ${c}`}
                onClick={() => set("primaryColor", c)}
                className="h-6 w-6 rounded-full border border-black/10"
                style={{ background: c }}
              />
            ))}
          </div>
        </div>
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
  );
}
