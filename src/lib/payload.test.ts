import { describe, expect, it } from "vitest";
import { evaluate, type Input } from "~/engine";
import fixtures from "~/engine/fixtures/pfdebug-personas.fixtures.json";
import { completeInput, decodePayload, encodePayload, type PayloadV1 } from "./payload";

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
});
