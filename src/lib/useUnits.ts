/**
 * Live units subscription for islands: initial value from storage, updates
 * from the header toggle via the pfdebug:units event.
 */
import { useEffect, useState } from "preact/hooks";
import { getUnits, UNITS_EVENT } from "./storage";
import type { Units } from "./units";

export function useUnits(): Units {
  const [units, setUnitsState] = useState<Units>("metric");
  useEffect(() => {
    setUnitsState(getUnits());
    const handler = (e: Event) =>
      setUnitsState((e as CustomEvent<Units>).detail);
    window.addEventListener(UNITS_EVENT, handler);
    return () => window.removeEventListener(UNITS_EVENT, handler);
  }, []);
  return units;
}
