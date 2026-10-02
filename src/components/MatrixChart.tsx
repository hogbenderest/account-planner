"use client";

import { matrixGridLines, matrixPoint } from "@/src/lib/formulas";
import { QUALIFIER } from "@/src/lib/workbook-config";
import { fmtDate } from "@/src/lib/format";

interface Series {
  date: string | null;
  should: number;
  can: number;
}

const W = 480;
const H = 380;
const M = { top: 16, right: 18, bottom: 42, left: 46 };
const PW = W - M.left - M.right;
const PH = H - M.top - M.bottom;
const X_MAX = 39;
const Y_MAX = 29;

const SERIES_STYLE = [
  { color: "#f48120", label: "Current" },
  { color: "#0051c3", label: "Prior" },
  { color: "#889096", label: "Earlier" },
];

/** Qualification Matrix: Can We Sell (x) vs Should We Sell (y), last three evaluations. */
export function MatrixChart({ series }: { series: Series[] }) {
  const px = (x: number) => M.left + (x / X_MAX) * PW;
  // SVG y grows downward; the workbook plots higher "should" higher on screen.
  const py = (y: number) => M.top + PH - (y / Y_MAX) * PH;

  const { xLines, yLines } = matrixGridLines();
  const shouldBands = QUALIFIER.shouldWeSell.bands;
  const canBands = QUALIFIER.canWeSell.bands;

  const cells: { x: number; y: number; w: number; h: number; fill: string }[] = [];
  const xEdges = [0, ...xLines, X_MAX];
  const yEdges = [0, ...yLines, Y_MAX];
  for (let ci = 0; ci < canBands.length; ci++) {
    for (let si = 0; si < shouldBands.length; si++) {
      const strength = si + ci; // 0 worst corner .. 4 best corner
      const fill = strength <= 0 ? "#fbe3e1" : strength <= 2 ? "#fdf3e0" : "#e3f4e9";
      cells.push({
        x: px(xEdges[ci]),
        y: py(yEdges[si + 1]),
        w: px(xEdges[ci + 1]) - px(xEdges[ci]),
        h: py(yEdges[si]) - py(yEdges[si + 1]),
        fill,
      });
    }
  }

  return (
    <div className="rounded-xl border border-cf-border bg-white p-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Qualification matrix">
        {cells.map((c, i) => (
          <rect key={i} x={c.x} y={c.y} width={c.w} height={c.h} fill={c.fill} />
        ))}
        {xLines.map((xl, i) => (
          <line key={`x${i}`} x1={px(xl)} y1={M.top} x2={px(xl)} y2={M.top + PH} stroke="#c8ccd0" strokeWidth={1} />
        ))}
        {yLines.map((yl, i) => (
          <line key={`y${i}`} x1={M.left} y1={py(yl)} x2={M.left + PW} y2={py(yl)} stroke="#c8ccd0" strokeWidth={1} />
        ))}
        {/* axis frame */}
        <rect x={M.left} y={M.top} width={PW} height={PH} fill="none" stroke="#9aa2ab" strokeWidth={1.5} />

        {/* x ticks: can totals */}
        {[-18, -2, 14, 21].map((t) => (
          <text key={t} x={px(t + 18)} y={M.top + PH + 16} textAnchor="middle" fontSize={11} fill="#5f6b76">
            {t > 0 ? `+${t}` : t}
          </text>
        ))}
        <text x={M.left + PW / 2} y={H - 6} textAnchor="middle" fontSize={12} fill="#2b2f33" fontWeight={600}>
          Can We Sell (difficulty)
        </text>
        {/* y ticks: should totals */}
        {[-11, -1, 12, 18].map((t) => (
          <text key={t} x={M.left - 8} y={py(t + 11) + 4} textAnchor="end" fontSize={11} fill="#5f6b76">
            {t > 0 ? `+${t}` : t}
          </text>
        ))}
        <text x={14} y={M.top + PH / 2} textAnchor="middle" fontSize={12} fill="#2b2f33" fontWeight={600} transform={`rotate(-90 14 ${M.top + PH / 2})`}>
          Should We Sell
        </text>

        {series.map((s, i) => {
          if (!s.date) return null;
          const p = matrixPoint(s.should, s.can);
          const cx = px(p.x);
          const cy = py(p.y);
          const style = SERIES_STYLE[i] ?? SERIES_STYLE[2];
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={11} fill={style.color} fillOpacity={0.18} />
              <circle cx={cx} cy={cy} r={5} fill={style.color} stroke="white" strokeWidth={1.5}>
                <title>{`${style.label}: ${fmtDate(s.date)} — Should ${s.should}, Can ${s.can}`}</title>
              </circle>
              <text x={cx} y={cy - 14} textAnchor="middle" fontSize={10} fill="#2b2f33" fontWeight={600}>
                {fmtDate(s.date)}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-cf-border pt-3 text-xs text-cf-muted">
        {SERIES_STYLE.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
        <span className="ml-auto">Shading: red = undesirable + hard, amber = mixed, green = premium + easy</span>
      </div>
    </div>
  );
}
