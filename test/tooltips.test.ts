import { describe, expect, it } from "vitest";
import { PHASE_OPTIONS, PRIORITY_OPTIONS, STATUS_OPTIONS, TIPS } from "../src/lib/tooltips";

describe("field guidance copy", () => {
  it("contains no em dashes anywhere (style rule)", () => {
    expect(JSON.stringify(TIPS)).not.toContain("—");
  });

  it("status options match the workbook's four values", () => {
    expect(STATUS_OPTIONS).toEqual(["Not Yet Started", "In Progress", "Completed", "Pending"]);
  });

  it("priority options are High, Medium, Low (workbook-confirmed)", () => {
    expect(PRIORITY_OPTIONS).toEqual(["High", "Medium", "Low"]);
  });

  it("phase datalist offers the approved three-phase draft", () => {
    expect(PHASE_OPTIONS).toEqual(["Creating", "Shaping", "Closing"]);
  });

  it("phase tooltip defines every datalist option", () => {
    for (const phase of PHASE_OPTIONS) {
      expect(TIPS.phase).toContain(phase);
    }
  });

  it("covers the required field set", () => {
    const required = [
      "parentAccount",
      "teamMembers",
      "phase",
      "proposedOffering",
      "dealSize",
      "closeDate",
      "analysisHistory",
      "evidence",
      "qualifierTiming",
      "profilerScale",
      "currentState",
      "desiredState",
      "agreedActions",
      "trackerOwner",
      "targetDate",
      "trackerStatus",
      "action",
      "clientContact",
      "dueDate",
      "plannerOwner",
      "priority",
      "plannerStatus",
    ];
    for (const key of required) {
      expect(TIPS[key as keyof typeof TIPS], `missing tooltip: ${key}`).toBeTruthy();
    }
  });
});
