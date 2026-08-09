interface BarListItem {
  label: string;
  value: number;
}

export function BarList({ items, emptyLabel }: { items: BarListItem[]; emptyLabel: string }) {
  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">{emptyLabel}</p>;
  }

  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-3">
          <span className="w-36 shrink-0 truncate text-sm text-slate-600" title={item.label}>
            {item.label}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-[#2a78d6]"
              style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums text-slate-900">{item.value}</span>
        </li>
      ))}
    </ul>
  );
}
