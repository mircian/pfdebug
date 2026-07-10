/**
 * localStorage — convenience mirror + settings only (BUILD.md §4).
 *
 * `pfdebug.units`       "metric" | "imperial", defaulted from locale.
 * `pfdebug.lastResult`  the last-viewed raw result payload string (same
 *                       string as the /plan fragment) powering the
 *                       returning-visitor landing state. Raw payload only;
 *                       no analytics, no PII beyond the user's own answers.
 */

import { unitsFromLocale, type Units } from "./units";

export const UNITS_KEY = "pfdebug.units";
export const LAST_RESULT_KEY = "pfdebug.lastResult";

/** Custom event fired on the unit toggle so islands re-render in place. */
export const UNITS_EVENT = "pfdebug:units";

function safeGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // private mode / storage disabled — degrade gracefully
  }
}

function safeSet(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable — the URL fragment still carries the result */
  }
}

export function getUnits(): Units {
  const stored = safeGet(UNITS_KEY);
  if (stored === "metric" || stored === "imperial") return stored;
  const fallback = unitsFromLocale(navigator.language);
  safeSet(UNITS_KEY, fallback);
  return fallback;
}

export function setUnits(units: Units): void {
  safeSet(UNITS_KEY, units);
  window.dispatchEvent(new CustomEvent(UNITS_EVENT, { detail: units }));
}

export function getLastResult(): string | null {
  return safeGet(LAST_RESULT_KEY);
}

export function setLastResult(payload: string): void {
  safeSet(LAST_RESULT_KEY, payload);
}
