import { describe, expect, it } from "vitest";
import { evaluate, heelRaiseFloor } from "./engine";
import type { Input, Result } from "./types";
import fixtures from "./fixtures/pfdebug-personas.fixtures.json";

/**
 * Subset assertion: every field present in `expected` must deep-equal the
 * corresponding field in `actual`. Keys starting with "_" are fixture
 * annotations, not assertions. Arrays compare exactly (order + length);
 * objects recurse so extra renderer-facing fields (e.g. mobility.limitedSide)
 * don't fail the core assertions.
 */
function expectSubset(actual: unknown, expected: unknown, path = "result"): void {
  if (Array.isArray(expected)) {
    expect(actual, path).toEqual(expected);
    return;
  }
  if (expected !== null && typeof expected === "object") {
    expect(actual, path).toBeTypeOf("object");
    for (const [key, value] of Object.entries(expected)) {
      if (key.startsWith("_")) continue;
      expectSubset(
        (actual as Record<string, unknown>)[key],
        value,
        `${path}.${key}`,
      );
    }
    return;
  }
  expect(actual, path).toBe(expected);
}

describe("pfdebug engine — persona fixtures (all 8 must pass)", () => {
  for (const fixture of fixtures.cases) {
    it(`${fixture.id} — ${fixture.name}`, () => {
      const result = evaluate(fixture.input as Input);
      expectSubset(result, fixture.expected as Partial<Result>);
    });
  }
});

/** A clean baseline that composes nothing — routes D4. */
function baseInput(): Input {
  return {
    painLocation: "inner_heel",
    worstWhen: ["morning_first_steps", "eases_moving"],
    thumbPress: "sharp_that_is_it",
    redFlags: [],
    duration: "3_12mo",
    loadChanges: [],
    onFeet: "mix",
    bmiBand: "under_25",
    ageBand: "40_54",
    affectedFoot: "left",
    kneeToWall: {
      left_cm: 11,
      right_cm: 11,
      sensationLeft: "stretch",
      sensationRight: "stretch",
    },
    heelRaise: { goodReps: 24, painfulReps: 23 },
    footprint: "neutral",
    shoes: { innerEdgeWear: false, deadCushion: false },
  };
}

describe("boundaries — decided, inclusive (spec §7)", () => {
  it("capacity asymmetry fires at exactly 20%", () => {
    const input = baseInput();
    input.heelRaise = { goodReps: 20, painfulReps: 16 }; // (20-16)/20 = 0.20
    const result = evaluate(input);
    expect(result.flags?.capacity).toMatchObject({ set: true, label: "confirmed" });
  });

  it("capacity asymmetry does not fire just under 20%", () => {
    const input = baseInput();
    input.heelRaise = { goodReps: 21, painfulReps: 17 }; // ≈19.05%, painful ≥ floor(16)
    const result = evaluate(input);
    expect(result.flags?.capacity.set).toBe(false);
  });

  it("capacity fires when painful side is below the age floor without asymmetry", () => {
    const input = baseInput();
    input.ageBand = "under_40"; // floor 20
    input.heelRaise = { goodReps: 21, painfulReps: 19 }; // asym < 20%, painful < 20
    const result = evaluate(input);
    expect(result.flags?.capacity).toMatchObject({ set: true, label: "confirmed" });
  });

  it("mobility asymmetry fires at exactly 2 cm", () => {
    const input = baseInput();
    input.kneeToWall = {
      left_cm: 10,
      right_cm: 12,
      sensationLeft: "stretch",
      sensationRight: "stretch",
    };
    const result = evaluate(input);
    expect(result.flags?.mobility).toMatchObject({
      set: true,
      subtype: "soft_tissue",
      limitedSide: "left",
    });
  });

  it("mobility does not fire at exactly 10 cm with no asymmetry", () => {
    const input = baseInput();
    input.kneeToWall = {
      left_cm: 10,
      right_cm: 10,
      sensationLeft: "stretch",
      sensationRight: "stretch",
    };
    const result = evaluate(input);
    expect(result.flags?.mobility.set).toBe(false);
  });

  it("mobility fires just under 10 cm", () => {
    const input = baseInput();
    input.kneeToWall = {
      left_cm: 9.9,
      right_cm: 10.5,
      sensationLeft: "stretch",
      sensationRight: "stretch",
    };
    const result = evaluate(input);
    expect(result.flags?.mobility.set).toBe(true);
  });
});

describe("gates & edge branches", () => {
  it("any red flag routes D0 immediately — no profile computed", () => {
    const input = baseInput();
    input.redFlags = ["pain_8plus"];
    expect(evaluate(input)).toEqual({ route: "D0" });
  });

  it("fitScore 0 routes D0_soft", () => {
    const input = baseInput();
    input.painLocation = "other";
    input.worstWhen = ["worse_later"];
    input.thumbPress = "nothing";
    expect(evaluate(input)).toEqual({ route: "D0_soft" });
  });

  it("fitScore 1–2 sets hedged, continues to a composed result", () => {
    const input = baseInput();
    input.painLocation = "arch"; // 0
    input.worstWhen = ["morning_first_steps"]; // +1
    input.thumbPress = "tender_not_the_pain"; // 0
    const result = evaluate(input);
    expect(result.route).toBe("D4");
    expect(result.hedged).toBe(true);
  });

  it("painful side skipped with good side below floor ⇒ suspected_skipped, never the headline", () => {
    const input = baseInput();
    input.ageBand = "under_40"; // floor 20
    input.heelRaise = { goodReps: 15, painfulSkipped: true };
    const result = evaluate(input);
    expect(result.flags?.capacity).toMatchObject({
      set: true,
      label: "suspected_skipped",
    });
    expect(result.notes).toContain("skipped_capacity");
    expect(result.route).toBe("D2_composed");
    // suspected_skipped is ineligible to headline; nothing else set ⇒ null.
    expect(result.headlineFactor).toBeNull();
  });

  it("ran_out end-feel maps to soft_tissue and is noted as unclear", () => {
    const input = baseInput();
    input.kneeToWall = {
      left_cm: 8,
      right_cm: 11,
      sensationLeft: "ran_out",
      sensationRight: "stretch",
    };
    const result = evaluate(input);
    expect(result.flags?.mobility).toMatchObject({ set: true, subtype: "soft_tissue" });
    expect(result.notes).toContain("mobility_end_feel_unclear");
  });

  it("joint mobility not primary (capacity headlines) still never attaches Ex2", () => {
    const input = baseInput();
    input.heelRaise = { goodReps: 20, painfulReps: 10 }; // capacity confirmed
    input.kneeToWall = {
      left_cm: 7,
      right_cm: 11,
      sensationLeft: "front_pinch",
      sensationRight: "stretch",
    };
    const result = evaluate(input);
    expect(result.headlineFactor).toBe("capacity");
    expect(result.modulesInFull).not.toContain("exercise2");
  });

  it("posture-only composed plan has no promoted headline; module renders in full", () => {
    const input = baseInput();
    input.footprint = "flat";
    const result = evaluate(input);
    expect(result.route).toBe("D2_composed");
    expect(result.headlineFactor).toBeNull();
    expect(result.modulesInFull).toEqual(["posture_insole"]);
  });

  it("footwear-only (no maintaining factor, no load spike) routes D5", () => {
    const input = baseInput();
    input.shoes = { innerEdgeWear: false, deadCushion: true };
    const result = evaluate(input);
    expect(result.route).toBe("D5");
    expect(result.triggerLine).toBe(false);
  });

  it("weight never routes alone — over_30 with nothing else is D4 with the module attached", () => {
    const input = baseInput();
    input.bmiBand = "over_30";
    const result = evaluate(input);
    expect(result.route).toBe("D4");
    expect(result.flags?.weightModule).toBe(true);
  });

  it("age floors match the spec table", () => {
    expect(heelRaiseFloor("under_40")).toBe(20);
    expect(heelRaiseFloor("40_54")).toBe(16);
    expect(heelRaiseFloor("55_69")).toBe(12);
    expect(heelRaiseFloor("70plus")).toBe(8);
  });
});
