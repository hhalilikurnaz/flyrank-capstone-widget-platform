import { useMemo, useState } from "react";

interface Point {
  date: string;
  count: number;
}

const WIDTH = 640;
const HEIGHT = 200;
const PAD_LEFT = 32;
const PAD_RIGHT = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;

const BLUE = "#2a78d6";
const BLUE_FILL = "rgba(42, 120, 214, 0.12)";

function formatShortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TimeSeriesChart({ data }: { data: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { points, maxCount, plotWidth, plotHeight } = useMemo(() => {
    const plotWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const plotHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
    const maxCount = Math.max(1, ...data.map((d) => d.count));
    const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

    const points = data.map((d, i) => ({
      ...d,
      x: PAD_LEFT + stepX * i,
      y: PAD_TOP + plotHeight - (d.count / maxCount) * plotHeight,
    }));

    return { points, maxCount, plotWidth, plotHeight };
  }, [data]);

  if (data.length === 0 || points.length === 0) return null;

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1]!.x.toFixed(2)} ${(PAD_TOP + plotHeight).toFixed(2)} L ${points[0]!.x.toFixed(2)} ${(PAD_TOP + plotHeight).toFixed(2)} Z`;

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;
  const gridLines = [0, 0.5, 1];

  function onMouseMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width) * WIDTH;
    const stepX = points.length > 1 ? plotWidth / (points.length - 1) : plotWidth;
    const index = Math.round((relX - PAD_LEFT) / stepX);
    setHoverIndex(Math.min(points.length - 1, Math.max(0, index)));
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label="Submissions over time">
        {gridLines.map((g) => {
          const y = PAD_TOP + plotHeight * g;
          return (
            <line key={g} x1={PAD_LEFT} y1={y} x2={WIDTH - PAD_RIGHT} y2={y} stroke="#e1e0d9" strokeWidth={1} />
          );
        })}
        <text x={4} y={PAD_TOP + 4} fontSize={10} fill="#898781">
          {maxCount}
        </text>
        <text x={4} y={PAD_TOP + plotHeight} fontSize={10} fill="#898781">
          0
        </text>

        <path d={areaPath} fill={BLUE_FILL} stroke="none" />
        <path d={linePath} fill="none" stroke={BLUE} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {points.length <= 31 &&
          [0, points.length - 1].map((i) => (
            <text
              key={i}
              x={points[i]!.x}
              y={HEIGHT - 6}
              fontSize={10}
              fill="#898781"
              textAnchor={i === 0 ? "start" : "end"}
            >
              {formatShortDate(points[i]!.date)}
            </text>
          ))}

        {hovered && (
          <>
            <line x1={hovered.x} y1={PAD_TOP} x2={hovered.x} y2={PAD_TOP + plotHeight} stroke="#c3c2b7" strokeWidth={1} />
            <circle cx={hovered.x} cy={hovered.y} r={4} fill={BLUE} stroke="#fcfcfb" strokeWidth={2} />
          </>
        )}

        <rect
          x={PAD_LEFT}
          y={0}
          width={plotWidth}
          height={HEIGHT}
          fill="transparent"
          onMouseMove={onMouseMove}
          onMouseLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs shadow-sm"
          style={{ left: `${(hovered.x / WIDTH) * 100}%` }}
        >
          <p className="font-medium text-slate-900">{hovered.count} submissions</p>
          <p className="text-slate-500">{formatShortDate(hovered.date)}</p>
        </div>
      )}
    </div>
  );
}
