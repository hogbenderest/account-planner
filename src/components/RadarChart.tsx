"use client";

import { radarAxisNames, radarValues } from "@/src/lib/formulas";
import { fmtDate, fmtPct } from "@/src/lib/format";

interface Series {
  date: string | null;
  sectionTotals: number[];
}

const SIZE = 440;
const C = SIZE / 2;
const R = 150;
const RING_STEP = R / 4; // 5, 10, 15, 20

const SERIES_STYLE = [
  { color: "#f48120", label: "Current" },
  { color: "#0051c3", label: "Prior" },
  { color: "#889096", label: "Earlier" },
];

/**
 * Advantage Blueprint: six-axis radar of the profile's section totals.
 * Vertex order and 0..20 clamping reproduce the original shape macro.
 */
export function RadarChart({ series, pursuitScorePct }: { series: Series[]; pursuitScorePct: number | null }) {
  const axes = radarAxisNames();
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / axes.length;
  const point = (i: number, value: number) => {
    const r = (Math.min(20, Math.max(0, value)) / 20) * R;
    return [C + r * Math.cos(angle(i)), C + r * Math.sin(angle(i))] as const;
  };

  return (
    <div className="rounded-xl border border-cf-border bg-white p-4">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" role="img" aria-label="Advantage blueprint radar">
        {/* rings */}
        {[1, 2, 3, 4].map((k) => (
          <polygon
            key={k}
            points={axes.map((_, i) => point(i, k * 5).join(",")).join(" ")}
            fill="none"
            stroke="#e3e6e8"
            strokeWidth={1}
          />
        ))}
        {/* spokes + labels */}
        {axes.map((name, i) => {
          const [ex, ey] = point(i, 20);
          const [lx, ly] = point(i, 26.5);
          const anchor = Math.abs(lx - C) < 12 ? "middle" : lx > C ? "start" : "end";
          return (
            <g key={name}>
              <line x1={C} y1={C} x2={ex} y2={ey} stroke="#e3e6e8" strokeWidth={1} />
              <text x={lx} y={ly + 3} textAnchor={anchor} fontSize={11} fill="#5f6b76">
                {name}
              </text>
            </g>
          );
        })}
        {/* ring value labels */}
        {[5, 10, 15, 20].map((v) => {
          const [tx, ty] = point(0, v);
          return (
            <text key={v} x={tx + 4} y={ty + 3} fontSize={9} fill="#9aa2ab">
              {v}
            </text>
          );
        })}

        {/* series, prior-to-current so current draws on top */}
        {series.map((_, revIdx) => {
          const idx = series.length - 1 - revIdx;
          const s = series[idx];
          const style = SERIES_STYLE[idx] ?? SERIES_STYLE[2];
          const values = radarValues(s.sectionTotals);
          const pts = values.map((v, i) => point(i, v).join(",")).join(" ");
          return (
            <g key={idx}>
              <polygon points={pts} fill={style.color} fillOpacity={idx === 0 ? 0.14 : 0.05} stroke={style.color} strokeWidth={2} strokeOpacity={idx === 0 ? 1 : 0.55}>
                <title>{`${style.label}: ${fmtDate(s.date)} — ${values.join(", ")}`}</title>
              </polygon>
              {idx === 0 &&
                values.map((v, i) => {
                  const [cx, cy] = point(i, v);
                  return <circle key={i} cx={cx} cy={cy} r={3.5} fill={style.color} stroke="white" strokeWidth={1.25} />;
                })}
            </g>
          );
        })}

        {/* Pursuit Score at centre */}
        <text x={C} y={C - 6} textAnchor="middle" fontSize={26} fontWeight={700} fill="#f48120">
          {fmtPct(pursuitScorePct)}
        </text>
        <text x={C} y={C + 12} textAnchor="middle" fontSize={11} fill="#5f6b76">
          Pursuit Score
        </text>
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-cf-border pt-3 text-xs text-cf-muted">
        {series.map((s, i) =>
          s.date ? (
            <span key={i} className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: SERIES_STYLE[i].color }} />
              {SERIES_STYLE[i].label}: {fmtDate(s.date)}
            </span>
          ) : null,
        )}
      </div>
    </div>
  );
}
