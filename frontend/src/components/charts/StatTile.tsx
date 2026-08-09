import { AnimatedNumber } from "@/components/charts/AnimatedNumber";

export function StatTile({
  label,
  value,
  format,
}: {
  label: string;
  value: number | string;
  format?: (n: number) => string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {typeof value === "number" ? <AnimatedNumber value={value} format={format} /> : value}
      </p>
    </div>
  );
}
