import { useMemo } from "react";
import { motion } from "framer-motion";
import { Monitor, Smartphone, Tablet } from "lucide-react";
import type { DeviceBreakdownEntry, DeviceType } from "@/lib/types";

// Categorical palette, fixed order (not cycled) — first three slots of the
// validated reference palette, which clear the CVD/normal-vision floors on
// all pairs (not just adjacent), appropriate for a 3-category chart.
const COLORS: Record<DeviceType, string> = {
  DESKTOP: "#2a78d6",
  MOBILE: "#eb6834",
  TABLET: "#1baf7a",
};

const ICONS: Record<DeviceType, typeof Monitor> = {
  DESKTOP: Monitor,
  MOBILE: Smartphone,
  TABLET: Tablet,
};

const LABELS: Record<DeviceType, string> = {
  DESKTOP: "Desktop",
  MOBILE: "Mobile",
  TABLET: "Tablet",
};

const ORDER: DeviceType[] = ["DESKTOP", "MOBILE", "TABLET"];

const SIZE = 140;
const STROKE = 18;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DeviceDonut({ data, emptyLabel }: { data: DeviceBreakdownEntry[]; emptyLabel: string }) {
  const byDevice = useMemo(() => new Map(data.map((d) => [d.device, d.count])), [data]);
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>;
  }

  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="shrink-0" role="img" aria-label="Device breakdown">
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#e1e0d9" strokeWidth={STROKE} />
        {ORDER.map((device) => {
          const count = byDevice.get(device) ?? 0;
          if (count === 0) return null;
          const fraction = count / total;
          const dash = fraction * CIRCUMFERENCE;
          const circle = (
            <motion.circle
              key={device}
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={COLORS[device]}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
              strokeDashoffset={-offset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
              strokeLinecap="butt"
            />
          );
          offset += dash;
          return circle;
        })}
        <text x={SIZE / 2} y={SIZE / 2 - 4} textAnchor="middle" fontSize={20} fontWeight={600} fill="#0b0b0b">
          {total}
        </text>
        <text x={SIZE / 2} y={SIZE / 2 + 14} textAnchor="middle" fontSize={10} fill="#898781">
          views
        </text>
      </svg>

      <ul className="space-y-2">
        {ORDER.filter((d) => (byDevice.get(d) ?? 0) > 0).map((device) => {
          const Icon = ICONS[device];
          const count = byDevice.get(device) ?? 0;
          const pct = Math.round((count / total) * 100);
          return (
            <li key={device} className="flex items-center gap-2 text-sm">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORS[device] }} />
              <Icon className="h-3.5 w-3.5 text-slate-400" strokeWidth={2} />
              <span className="text-slate-600">{LABELS[device]}</span>
              <span className="ml-auto tabular-nums text-slate-900">{pct}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
