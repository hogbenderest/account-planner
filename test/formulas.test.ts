import { describe, expect, it } from "vitest";
import {
  bandFor,
  canBand,
  compTrafficLight,
  hasScores,
  matrixGridLines,
  matrixPoint,
  profilerSectionTotals,
  profilerTotal,
  pursuitScore,
  qualTotal,
  qualTrafficLight,
  radarAxisNames,
  radarValues,
  shouldBand,
  shouldRotate,
} from "../src/lib/formulas";
import seed from "../src/seed/acme-corp.json";

const q = seed.qualSnapshots[0];
const p = seed.profilerSnapshots[0];

describe("fixture sanity (source workbook values)", () => {
  it("has the ACME seed with 7+7 qualifier scores and 24 profiler scores", () => {
    expect(seed.pursuit.accountName).toBe("ACME Corp");
    expect(q.shouldScores).toHaveLength(7);
    expect(q.canScores).toHaveLength(7);
    expect(p.scores).toHaveLength(24);
  });

  it("carries no brand or personal names", () => {
    const blob = JSON.stringify(seed);
    expect(blob).not.toMatch(/telstra|bhp|hogben|accenture|infosys|vocus|stormcast|stormtracker|revenue storm/i);
    expect(blob).not.toMatch(/Webb|Bradbury|Ashworth/);
  });
});

describe("recorded evaluations and rotation guard", () => {
  it("hasScores: null/empty/all-null are unrecorded; any answer counts, including all-zero answers", () => {
    expect(hasScores(null)).toBe(false);
    expect(hasScores(undefined)).toBe(false);
    expect(hasScores([])).toBe(false);
    expect(hasScores([null, null, null])).toBe(false);
    expect(hasScores([null, 2])).toBe(true);
    expect(hasScores([0, 0, 0, 0])).toBe(true);
  });

  it("shouldRotate shifts only for dated, answered analyses", () => {
    expect(shouldRotate(null, [1, 2])).toBe(false);
    expect(shouldRotate("2026-10-02", [])).toBe(false);
    expect(shouldRotate("2026-10-02", null, null)).toBe(false);
    expect(shouldRotate("2026-10-02", [null, null])).toBe(false);
    expect(shouldRotate("2026-10-02", [null], [1])).toBe(true);
    expect(shouldRotate("2026-10-02", [0, 0])).toBe(true);
  });

  it("the seeded snapshots are recognized as recorded / unrecorded", () => {
    expect(hasScores(seed.qualSnapshots[0].shouldScores as number[])).toBe(true);
    expect(hasScores(seed.qualSnapshots[1].shouldScores)).toBe(false);
    expect(hasScores(seed.profilerSnapshots[0].scores as number[])).toBe(true);
  });
});

describe("qualifier totals and bands", () => {
  it("should total is 1 (Acceptable Business)", () => {
    const t = qualTotal(q.shouldScores as number[]);
    expect(t).toBe(1);
    expect(shouldBand(t)).toBe("Acceptable Business");
  });

  it("can total is 7 (Medium Difficulty)", () => {
    const t = qualTotal(q.canScores as number[]);
    expect(t).toBe(7);
    expect(canBand(t)).toBe("Medium Difficulty");
  });

  it("nulls count as zero", () => {
    expect(qualTotal([null, null, null, null, null, null, null])).toBe(0);
  });

  it("band edges are inclusive", () => {
    expect(bandFor(-11, [{ min: -11, max: -2, label: "x" }])).toBe("x");
    expect(bandFor(-12, [{ min: -11, max: -2, label: "x" }])).toBeNull();
  });
});

describe("profiler totals", () => {
  it("section totals are 13,13,12,4,12,0", () => {
    expect(profilerSectionTotals(p.scores as number[])).toEqual([13, 13, 12, 4, 12, 0]);
  });

  it("grand total is 54", () => {
    expect(profilerTotal(p.scores as number[])).toBe(54);
  });
});

describe("pursuit score", () => {
  it("is 40% for the fixture (54/120 - 0.05)", () => {
    expect(pursuitScore(54)).toBeCloseTo(0.4);
  });

  it("is null when there is no data", () => {
    expect(pursuitScore(0)).toBeNull();
  });

  it("floors at 15%", () => {
    expect(pursuitScore(18)).toBe(0.15); // exactly 0.15
    expect(pursuitScore(12)).toBe(0.15);
    expect(pursuitScore(6)).toBe(0.15);
  });

  it("reproduces the just-above-floor dip faithfully", () => {
    expect(pursuitScore(20)).toBeCloseTo(20 / 120 - 0.05); // ~0.117, lower than the floor
  });

  it("caps at 95% at a perfect score", () => {
    expect(pursuitScore(120)).toBeCloseTo(0.95);
  });
});

describe("traffic lights", () => {
  it("qualifier: amber for the fixture (1, 7)", () => {
    expect(qualTrafficLight(1, 7)).toBe("amber");
  });

  it("qualifier: red when there is no analysis (0, 0)", () => {
    expect(qualTrafficLight(0, 0)).toBe("red");
  });

  it("qualifier: red at the worst scores, green at the best", () => {
    expect(qualTrafficLight(-11, -18)).toBe("red");
    expect(qualTrafficLight(18, 21)).toBe("green");
  });

  it("profiler: red for the fixture (54 -> 45% - 5% = 40%)", () => {
    expect(compTrafficLight(54)).toBe("red");
  });

  it("profiler: red at 60, amber at 72 and 90, green at 108 and 120", () => {
    expect(compTrafficLight(60)).toBe("red"); // 0.50 -> 0.45
    expect(compTrafficLight(72)).toBe("amber"); // 0.60 -> 0.55
    expect(compTrafficLight(90)).toBe("amber"); // 0.75 -> 0.70
    expect(compTrafficLight(108)).toBe("green"); // 0.90 -> 0.85
    expect(compTrafficLight(120)).toBe("green"); // 1.00 -> 0.95
  });
});

describe("matrix and radar geometry", () => {
  it("matrix point for the fixture: x=25, y=12", () => {
    const m = matrixPoint(1, 7);
    expect(m).toEqual({ x: 25, y: 12, xMax: 39, yMax: 29 });
  });

  it("matrix spans match the workbook (0..39 x, 0..29 y)", () => {
    expect(matrixPoint(-11, -18)).toMatchObject({ x: 0, y: 0 });
    expect(matrixPoint(18, 21)).toMatchObject({ x: 39, y: 29 });
  });

  it("grid lines sit at the band boundaries", () => {
    const g = matrixGridLines();
    expect(g.xLines).toEqual([-2 + 18, 14 + 18]);
    expect(g.yLines).toEqual([-1 + 11, 12 + 11]);
  });

  it("radar values follow the macro vertex order and clamp 0..20", () => {
    expect(radarValues([13, 13, 12, 4, 12, 0])).toEqual([13, 12, 4, 12, 0, 13]);
    expect(radarValues([25, -3, 12, 12, 12, 4])).toEqual([0, 12, 12, 12, 4, 20]);
    expect(radarAxisNames()).toEqual([
      "Decision Making Process",
      "Relational Superiority",
      "Political Alignment",
      "Our Value Proposition",
      "Pursuit Momentum",
      "Competitive Strategy",
    ]);
  });
});
