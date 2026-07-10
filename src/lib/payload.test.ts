import { describe, expect, it } from "vitest";
import { evaluate, type Input } from "~/engine";
import fixtures from "~/engine/fixtures/pfdebug-personas.fixtures.json";
import {
  completeInput,
  decodePayload,
  encodePayload,
  isRenderable,
  type PayloadV1,
} from "./payload";

describe("payload codec — round trip (acceptance: encode → open fresh → identical plan)", () => {
  it("round-trips every persona fixture input to an identical engine result", () => {
    for (const fixture of fixtures.cases) {
      const input = fixture.input as Input;
      const payload: PayloadV1 = { input, date: "2026-07-10" };
      const fragment = encodePayload(payload);

      expect(fragment.startsWith("v1.")).toBe(true);
      // Fragment must survive being pasted into a URL untouched: lz-string's
      // URI-safe alphabet (A–Z a–z 0–9 + - $) plus the version dot are all
      // legal RFC 3986 fragment characters, no percent-encoding needed.
      expect(fragment).toMatch(/^v1\.[A-Za-z0-9+\-$]*$/);

      const decoded = decodePayload(`#${fragment}`);
      expect(decoded).not.toBeNull();
      expect(decoded!.input).toEqual(input);
      expect(evaluate(completeInput(decoded!.input))).toEqual(evaluate(input));
    }
  });

  it("round-trips a gated partial payload (D0 short-circuit after Step 0)", () => {
    const payload: PayloadV1 = {
      input: {
        painLocation: "center_heel",
        worstWhen: ["constant"],
        thumbPress: "nothing",
        redFlags: ["after_impact", "pain_8plus"],
      },
    };
    const decoded = decodePayload(encodePayload(payload));
    expect(decoded).toEqual(payload);
    expect(evaluate(completeInput(decoded!.input))).toEqual({ route: "D0" });
  });

  it("carries a retest baseline through the round trip", () => {
    const input = fixtures.cases[0]!.input as Input;
    const payload: PayloadV1 = {
      input,
      prev: {
        kneeToWall: { left_cm: 6.5, right_cm: 11 },
        heelRaise: { goodReps: 18, painfulReps: 8 },
        date: "2026-05-01",
      },
      date: "2026-07-10",
    };
    expect(decodePayload(encodePayload(payload))).toEqual(payload);
  });

  it("rejects garbage, wrong versions, and non-payload JSON", () => {
    expect(decodePayload("")).toBeNull();
    expect(decodePayload("#")).toBeNull();
    expect(decodePayload("#v2.abcdef")).toBeNull();
    expect(decodePayload("#v1.not-actually-lz")).toBeNull();
    expect(decodePayload("v1.")).toBeNull();
  });

  it("drops a malformed prev baseline instead of crashing the gauges", () => {
    const input = fixtures.cases[0]!.input as Input;
    const bad = { input, prev: {} } as unknown as PayloadV1;
    const decoded = decodePayload(encodePayload(bad));
    expect(decoded).not.toBeNull();
    expect(decoded!.prev).toBeUndefined();
    expect(decoded!.input).toEqual(input);

    const badNums = {
      input,
      prev: { kneeToWall: { left_cm: "x", right_cm: 9 }, heelRaise: { goodReps: 18, painfulReps: 8 } },
    } as unknown as PayloadV1;
    expect(decodePayload(encodePayload(badNums))!.prev).toBeUndefined();
  });

  it("rejects crafted payloads with non-numeric test values", () => {
    const input = fixtures.cases[0]!.input as Input;
    const bad1 = {
      input: { ...input, kneeToWall: { ...input.kneeToWall, left_cm: "8" } },
    };
    const bad2 = { input: { ...input, heelRaise: { goodReps: NaN, painfulReps: 3 } } };
    expect(decodePayload(encodePayload(bad1 as unknown as PayloadV1))).toBeNull();
    expect(decodePayload(encodePayload(bad2 as unknown as PayloadV1))).toBeNull();
  });
});

describe("isRenderable — partial payloads only render when a gate fires", () => {
  const step0: import("./payload").WizardAnswers = {
    painLocation: "inner_heel",
    worstWhen: ["morning_first_steps"],
    thumbPress: "sharp_that_is_it",
    redFlags: [],
  };

  it("accepts complete inputs", () => {
    expect(isRenderable(fixtures.cases[0]!.input as Input)).toBe(true);
  });

  it("accepts partials that gate at C0 (red flags)", () => {
    expect(isRenderable({ ...step0, redFlags: ["pain_8plus"] })).toBe(true);
  });

  it("accepts partials that soft-decline at C1 (back of heel / fit 0)", () => {
    expect(isRenderable({ ...step0, painLocation: "back_of_heel" })).toBe(true);
    expect(
      isRenderable({
        painLocation: "other",
        worstWhen: ["worse_later"],
        thumbPress: "nothing",
        redFlags: [],
      }),
    ).toBe(true);
  });

  it("rejects a crafted partial that would compose a plan from defaults", () => {
    // fitScore 3, no red flags, no test data — must NOT render a plan built
    // on completeInput()'s inert zeros (0 cm / 0 reps).
    expect(isRenderable({ ...step0, worstWhen: ["morning_first_steps", "eases_moving"] })).toBe(
      false,
    );
  });
});
