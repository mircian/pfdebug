/**
 * The two result gauges, unit-aware and delta-aware. Zones only ever use
 * --mark ("in range") and --flag ("worth working on") — never --stop.
 */
import RulerGauge, { type GaugePointer } from "~/components/RulerGauge";
import {
  heelRaiseFloor,
  KNEE_TO_WALL_THRESHOLD_CM,
  type Input,
} from "~/engine";
import type { RetestBaseline } from "~/lib/payload";
import { displayLength, displayThreshold, type Units } from "~/lib/units";

export function KneeToWallGauge({
  input,
  units,
  prev,
}: {
  input: Input;
  units: Units;
  prev?: RetestBaseline;
}) {
  const { left_cm, right_cm } = input.kneeToWall;
  const domainMax = Math.max(15, left_cm + 2, right_cm + 2);
  const t = KNEE_TO_WALL_THRESHOLD_CM;

  const pointers: GaugePointer[] = [
    {
      label: "L",
      value: left_cm,
      display: displayLength(left_cm, units).text,
      ...(prev
        ? {
            prevValue: prev.kneeToWall.left_cm,
            prevDisplay: displayLength(prev.kneeToWall.left_cm, units).text,
          }
        : {}),
    },
    {
      label: "R",
      value: right_cm,
      display: displayLength(right_cm, units).text,
      ...(prev
        ? {
            prevValue: prev.kneeToWall.right_cm,
            prevDisplay: displayLength(prev.kneeToWall.right_cm, units).text,
          }
        : {}),
    },
  ];

  const diff = Math.abs(left_cm - right_cm);
  const asymmetryText =
    diff >= 2 ? `Δ ${displayLength(diff, units).text}` : undefined;

  return (
    <RulerGauge
      title="Knee-to-wall — ankle range"
      domainMax={domainMax}
      zones={[
        { from: 0, to: t, kind: "flag", label: "worth working on" },
        { from: t, to: domainMax, kind: "mark", label: "in range" },
      ]}
      threshold={t}
      thresholdLabel={displayThreshold(t, units)}
      pointers={pointers}
      asymmetryText={asymmetryText}
      ariaSummary={`Knee-to-wall: left ${displayLength(left_cm, units).text}, right ${displayLength(right_cm, units).text}. Under ${displayThreshold(t, units)} counts as worth working on.`}
    />
  );
}

export function HeelRaiseGauge({
  input,
  prev,
}: {
  input: Input;
  prev?: RetestBaseline;
}) {
  const floor = heelRaiseFloor(input.ageBand);
  const hr = input.heelRaise;
  const skipped = "painfulSkipped" in hr;
  const good = hr.goodReps;
  const painful = skipped ? null : hr.painfulReps;

  // Map good/painful onto L/R for the gauge: for a left-affected foot the
  // painful pointer is L; for bilateral the wizard records left→good slot,
  // right→painful slot.
  const painfulSide = input.affectedFoot === "right" ? "R" : "L";
  const goodSide = painfulSide === "L" ? "R" : "L";

  const prevTested =
    prev && "painfulReps" in prev.heelRaise ? prev.heelRaise : undefined;

  const pointers: GaugePointer[] = [
    {
      label: input.affectedFoot === "both" ? "L" : `${goodSide}`,
      value: good,
      display: `${good} reps`,
      ...(prevTested
        ? { prevValue: prevTested.goodReps, prevDisplay: `${prevTested.goodReps}` }
        : {}),
    },
  ];
  if (painful !== null) {
    pointers.push({
      label: input.affectedFoot === "both" ? "R" : `${painfulSide}`,
      value: painful,
      display: `${painful} reps`,
      ...(prevTested
        ? {
            prevValue: prevTested.painfulReps,
            prevDisplay: `${prevTested.painfulReps}`,
          }
        : {}),
    });
  }

  const domainMax = Math.max(good + 6, painful ?? 0, floor + 6, 25);

  const asym =
    painful !== null && good > 0 && input.affectedFoot !== "both"
      ? Math.round(((good - painful) / good) * 100)
      : null;

  return (
    <RulerGauge
      title="Single-leg heel raise — calf capacity"
      domainMax={domainMax}
      zones={[
        { from: 0, to: floor, kind: "flag", label: "worth working on" },
        { from: floor, to: domainMax, kind: "mark", label: "in range" },
      ]}
      threshold={floor}
      thresholdLabel={`${floor} reps — your age benchmark`}
      pointers={pointers}
      asymmetryText={asym !== null && asym > 0 ? `${asym}% gap` : undefined}
      ariaSummary={
        skipped
          ? `Single-leg heel raise: ${good} reps on the good side; the painful side was skipped today. Your age benchmark is ${floor} reps.`
          : `Single-leg heel raise: ${good} reps on the good side, ${painful} on the painful side. Your age benchmark is ${floor} reps.`
      }
    />
  );
}
