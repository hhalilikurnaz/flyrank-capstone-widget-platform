export function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
