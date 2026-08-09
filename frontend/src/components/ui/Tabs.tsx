import { motion } from "framer-motion";

interface TabItem {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export function Tabs({
  items,
  value,
  onChange,
}: {
  items: TabItem[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange(item.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              active ? "text-slate-900 dark:text-slate-100" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            {active && (
              <motion.span
                layoutId="tab-pill"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-slate-800"
              />
            )}
            {Icon && <Icon className="relative h-3.5 w-3.5" strokeWidth={2} />}
            <span className="relative">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
