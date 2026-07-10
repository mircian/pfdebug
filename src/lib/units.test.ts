import { describe, expect, it } from "vitest";
import {
  cmToIn,
  displayLength,
  displayThreshold,
  inToCm,
  kgToLb,
  lbToKg,
  parseLengthToCm,
  unitsFromLocale,
} from "./units";

describe("units — canonical metric, convert only at display", () => {
  it("no drift on repeated toggling: canonical value never changes", () => {
    // The architecture guarantee: display conversion is a pure function of
    // the canonical value, so N toggles = N independent conversions of the
    // same number. Simulate 1000 toggles.
    const canonical_cm = 9.3;
    let display = displayLength(canonical_cm, "metric").value;
    for (let i = 0; i < 1000; i++) {
      const units = i % 2 === 0 ? "imperial" : "metric";
      display = displayLength(canonical_cm, units).value;
    }
    expect(display).toBe(9.3); // ends on metric, exactly the canonical value
    expect(displayLength(canonical_cm, "imperial").value).toBe(3.7);
  });

  it("conversions are exact inverses within float epsilon", () => {
    for (const v of [0, 1, 8.56, 9.9, 10, 14.7, 42]) {
      expect(inToCm(cmToIn(v))).toBeCloseTo(v, 10);
      expect(lbToKg(kgToLb(v))).toBeCloseTo(v, 10);
    }
  });

  it("threshold displays correctly in both systems (10 cm shows as ~4 in)", () => {
    expect(displayThreshold(10, "metric")).toBe("10 cm");
    expect(displayThreshold(10, "imperial")).toBe("~4 in");
  });

  it("parses user entry in the active unit to canonical cm exactly once", () => {
    expect(parseLengthToCm(9, "metric")).toBe(9);
    expect(parseLengthToCm(4, "imperial")).toBeCloseTo(10.16, 10);
  });

  it("defaults units from locale", () => {
    expect(unitsFromLocale("en-US")).toBe("imperial");
    expect(unitsFromLocale("en-GB")).toBe("metric");
    expect(unitsFromLocale("ro-RO")).toBe("metric");
    expect(unitsFromLocale(undefined)).toBe("metric");
  });
});
