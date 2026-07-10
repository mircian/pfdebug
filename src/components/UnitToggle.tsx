/**
 * The metric/imperial master switch — pinned in the header on every screen,
 * including mid-wizard (BUILD.md §5). One setting governs everything.
 * Keyboard-operable (plain buttons) and announced (aria-live).
 */
import { useEffect, useState } from "preact/hooks";
import { getUnits, setUnits } from "~/lib/storage";
import type { Units } from "~/lib/units";

export default function UnitToggle() {
  // SSR renders metric; the effect syncs to the stored/locale value.
  const [units, setLocal] = useState<Units>("metric");

  useEffect(() => {
    setLocal(getUnits());
  }, []);

  function choose(next: Units) {
    setLocal(next);
    setUnits(next); // persists + dispatches pfdebug:units for live displays
  }

  return (
    <div class="unit-toggle" role="group" aria-label="Measurement units">
      <button
        type="button"
        aria-pressed={units === "metric"}
        onClick={() => choose("metric")}
      >
        cm·kg
      </button>
      <button
        type="button"
        aria-pressed={units === "imperial"}
        onClick={() => choose("imperial")}
      >
        in·lb
      </button>
      <span class="visually-hidden" aria-live="polite">
        {units === "metric" ? "Units set to metric" : "Units set to imperial"}
      </span>
    </div>
  );
}
