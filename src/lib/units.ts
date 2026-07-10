/**
 * Units — one master switch, canonical metric (BUILD.md §5).
 *
 * Every value is stored canonically in metric (cm, kg); conversion happens
 * only at display. The displayed/converted number is never stored back, so
 * repeated toggling can never accumulate rounding drift.
 */

export type Units = "metric" | "imperial";

export const CM_PER_INCH = 2.54;
export const KG_PER_LB = 0.45359237;

export function cmToIn(cm: number): number {
  return cm / CM_PER_INCH;
}

export function inToCm(inches: number): number {
  return inches * CM_PER_INCH;
}

export function kgToLb(kg: number): number {
  return kg / KG_PER_LB;
}

export function lbToKg(lb: number): number {
  return lb * KG_PER_LB;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/** Display a canonical-cm length in the active unit, rounded for reading. */
export function displayLength(cm: number, units: Units): {
  value: number;
  unit: "cm" | "in";
  text: string;
} {
  if (units === "imperial") {
    const value = round1(cmToIn(cm));
    return { value, unit: "in", text: `${value} in` };
  }
  const value = round1(cm);
  return { value, unit: "cm", text: `${value} cm` };
}

/**
 * Thresholds convert for display too — 10 cm shows as ~4 in. Imperial
 * threshold display is approximate by design and marked as such.
 */
export function displayThreshold(cm: number, units: Units): string {
  if (units === "imperial") {
    return `~${Math.round(cmToIn(cm))} in`;
  }
  return `${round1(cm)} cm`;
}

/**
 * Parse a number the user typed in the active unit into canonical cm.
 * This is the single point where imperial becomes metric — entry, not
 * storage, so nothing ever converts twice.
 */
export function parseLengthToCm(value: number, units: Units): number {
  return units === "imperial" ? inToCm(value) : value;
}

/** Default from browser locale on first visit (BUILD.md §4). */
export function unitsFromLocale(locale: string | undefined): Units {
  if (!locale) return "metric";
  // The US, Liberia and Myanmar are the holdouts.
  return /-(US|LR|MM)\b/i.test(locale) ? "imperial" : "metric";
}
