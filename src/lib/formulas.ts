import { QUALIFIER, PROFILER, WORKBOOK_CONSTANTS as C } from "./workbook-config";

// Pure reimplementation of every computed behaviour in the source workbook.
// Faithful to the original formulas and VBA, including quirks:
//  - Pursuit Score dips just above the 15% floor (total/120 slightly > 0.15
//    scores LOWER than the floor) because the original formula subtracts 0.05
//    with no lower clamp. Reproduced as-is.
//  - The qualifier traffic light is forced red when both totals are 0
//    (no data), mirroring the dashboard macro, even though the raw weighted
//    sum would be amber.

export type Light = "red" | "amber" | "green";
export interface Band { min: number; max: number; label: string }

/**
 * True when an evaluation has at least one answered (non-null) score.
 * Deliberately counts all-zero answers (e.g. every "Don't Know") as recorded:
 * the user consciously answered. A date alone, or empty/null arrays, is not
 * an evaluation.
 */
export function hasScores(scores: readonly (number | null)[] | null | undefined): boolean {
  if (!scores) return false;
  return scores.some((s) => s !== null);
}

/**
 * New-analysis rotation decision: history only shifts when the current
 * snapshot carries a date AND at least one answered score. Anything less is
 * not a recorded evaluation, so rotation just (re)stamps today's date.
 */
export function shouldRotate(
  analysisDate: string | null | undefined,
  ...scoreArrays: (readonly (number | null)[] | null | undefined)[]
): boolean {
  return analysisDate !== null && analysisDate !== undefined && analysisDate !== "" && scoreArrays.some(hasScores);
}

/** Sum of a score vector; null (unanswered/empty) counts as 0, like SUM over empty cells. */
export function qualTotal(scores: readonly (number | null)[]): number {
  return scores.reduce<number>((acc, s) => acc + (s ?? 0), 0);
}

export function bandFor(total: number, bands: readonly Band[]): string | null {
  const b = bands.find((x) => total >= x.min && total <= x.max);
  return b ? b.label : null;
}

export function shouldBand(total: number): string | null {
  return bandFor(total, QUALIFIER.shouldWeSell.bands);
}

export function canBand(total: number): string | null {
  return bandFor(total, QUALIFIER.canWeSell.bands);
}

/** Six section totals from a 24-item profiler score vector (4 criteria per section). */
export function profilerSectionTotals(scores: readonly (number | null)[]): number[] {
  const out: number[] = [];
  for (let s = 0; s < C.sectionCount; s++) {
    let t = 0;
    for (let i = 0; i < 4; i++) t += scores[s * 4 + i] ?? 0;
    out.push(t);
  }
  return out;
}

export function profilerTotal(scores: readonly (number | null)[]): number {
  return profilerSectionTotals(scores).reduce((a, b) => a + b, 0);
}

export function profilerTotalMax(): number {
  return C.totalMax; // 120
}

/**
 * Pursuit Score % (the workbook's win-probability percentage).
 * null when there is no data (total 0); floored at 15%; otherwise total/120 - 0.05.
 */
export function pursuitScore(total: number): number | null {
  if (total === 0) return null;
  const t = total / C.totalMax;
  return t <= 0.15 ? 0.15 : t - 0.05;
}

/** Qualifier traffic light. Red when there is no analysis at all. */
export function qualTrafficLight(should: number, can: number): Light {
  if (should === 0 && can === 0) return "red";
  const x = ((12 + should) / 30) * 0.4;
  const y = ((18 + can) / 40) * 0.6;
  const sum = x + y;
  if (sum <= 0.24) return "red";
  if (sum <= 0.64) return "amber";
  return "green";
}

/** Profiler traffic light: total/120 (minus 0.05 above the floor); <50% red, <80% amber, else green. */
export function compTrafficLight(total: number): Light {
  let t = total / C.totalMax;
  if (t > 0.15) t -= 0.05;
  if (t < 0.5) return "red";
  if (t < 0.8) return "amber";
  return "green";
}

/** Matrix coordinates: x = can+18 over 0..39, y = should+11 over 0..29 (y grows upward). */
export function matrixPoint(should: number, can: number): { x: number; y: number; xMax: number; yMax: number } {
  return { x: can + 18, y: should + 11, xMax: C.matrixXMax, yMax: C.matrixYMax };
}

/**
 * Radar values in polygon-vertex order, per the original macro's line drawing:
 * Decision Making -> Relational -> Political -> Value Proposition -> Momentum -> Competitive.
 * Each axis clamped to 0..20.
 */
export function radarValues(sectionTotals: readonly number[]): number[] {
  const clamped = sectionTotals.map((v) => Math.min(C.sectionMax, Math.max(0, v)));
  return C.radarVertexSectionOrder.map((i) => clamped[i]);
}

export function radarAxisNames(): string[] {
  return C.radarVertexSectionOrder.map((i) => PROFILER.sections[i].name);
}

/** Matrix quadrant shading boundaries derived from the scoring bands. */
export function matrixGridLines(): { xLines: number[]; yLines: number[] } {
  const canBands = QUALIFIER.canWeSell.bands;
  const shouldBands = QUALIFIER.shouldWeSell.bands;
  return {
    xLines: canBands.slice(1).map((b) => b.min + 18),
    yLines: shouldBands.slice(1).map((b) => b.min + 11),
  };
}
