/**
 * pfdebug decision engine — evaluate(input) → result.
 *
 * Implements docs/pfdebug-engine-spec.md exactly. Deterministic: same input →
 * same output, always. Pure functions only; no DOM, no framework imports.
 *
 * Pipeline: C0 gate → C1 fit → C2 flags → C3 route & compose.
 */

import type {
  AgeBand,
  CapacityLabel,
  Flags,
  HeadlineFactor,
  HeelRaiseSkipped,
  HeelRaiseTested,
  Input,
  ModuleId,
  Note,
  Result,
  Side,
} from "./types";

/**
 * Age floor for the single-leg heel raise (spec §4 helper).
 *
 * Phase-0 proxy: v1.1 replaces this with published normative equations
 * (Hébert-Losier 2017; Calf Raise App 2025) keyed on age/sex/BMI — keep the
 * swap localized behind this one function (spec §8).
 */
export function heelRaiseFloor(ageBand: AgeBand): number {
  return { under_40: 20, "40_54": 16, "55_69": 12, "70plus": 8 }[ageBand];
}

/** Mobility threshold, cm: less than this is "tight" (spec §4.2). */
export const KNEE_TO_WALL_THRESHOLD_CM = 10;

function isSkipped(hr: Input["heelRaise"]): hr is HeelRaiseSkipped {
  return "painfulSkipped" in hr && hr.painfulSkipped === true;
}

/** C2 §4.1 — capacity flag; branches on laterality. */
function computeCapacity(
  input: Input,
  notes: Note[],
): { set: boolean; label?: CapacityLabel } {
  const floor = heelRaiseFloor(input.ageBand);
  const hr = input.heelRaise;

  if (isSkipped(hr)) {
    // Painful side skipped ⇒ capacity is unmeasured. Either way it is
    // INELIGIBLE to headline (C3); the renderer shows the skipped variant.
    notes.push("skipped_capacity");
    if (hr.goodReps >= floor) {
      return { set: false }; // good side in range — no deficit assumed
    }
    return { set: true, label: "suspected_skipped" };
  }

  const tested = hr as HeelRaiseTested;

  if (input.affectedFoot === "both") {
    // Bilateral: asymmetry does not apply — no strong side to compare
    // against. Use the worse (lower) side vs the age floor.
    const worse = Math.min(tested.goodReps, tested.painfulReps);
    if (worse < floor) {
      // BMI over_30 additionally makes the rep benchmark unreliable; same
      // label either way — the copy layer adds the BMI-limited clause.
      return { set: true, label: "unconfirmed_bilateral" };
    }
    // worse >= floor ⇒ not set: a self-test can't detect a bilateral deficit
    // without norms; Ex1 is universal and covers it anyway.
    return { set: false };
  }

  // Unilateral, both sides tested.
  const good = tested.goodReps;
  const painful = tested.painfulReps;
  // Asymmetry fires at >= 20%, inclusive (spec §7: boundary users fire the
  // flag rather than falling through an off-by-one).
  const asym = good > 0 ? (good - painful) / good : 0;
  if (asym >= 0.2 || painful < floor) {
    return { set: true, label: "confirmed" };
  }
  return { set: false };
}

/** C2 §4.2 — mobility flag. */
function computeMobility(
  input: Input,
  notes: Note[],
): Flags["mobility"] {
  const { left_cm, right_cm, sensationLeft, sensationRight } = input.kneeToWall;

  // limitedSide = side with the lower knee-to-wall cm; tie ⇒ affected side
  // (for bilateral ties either side is equivalent — default left).
  let limitedSide: Side;
  if (left_cm < right_cm) limitedSide = "left";
  else if (right_cm < left_cm) limitedSide = "right";
  else limitedSide = input.affectedFoot === "right" ? "right" : "left";

  // Asymmetry fires at >= 2 cm, inclusive (spec §7).
  const set =
    Math.min(left_cm, right_cm) < KNEE_TO_WALL_THRESHOLD_CM ||
    Math.abs(left_cm - right_cm) >= 2;

  if (!set) return { set: false };

  const sensation = limitedSide === "left" ? sensationLeft : sensationRight;
  // stretch → soft_tissue; front_pinch → joint; ran_out → soft_tissue,
  // noted as unclear.
  const subtype = sensation === "front_pinch" ? "joint" : "soft_tissue";
  if (sensation === "ran_out") notes.push("mobility_end_feel_unclear");

  return { set: true, subtype, limitedSide };
}

/**
 * C3 §5.2 flag-cap ranking for prescription modules:
 * Capacity > Mobility(Ex2) > Load-management > Footwear-replace >
 * Posture-insole > Weight. (Capacity has no separate module — its emphasis
 * IS the headline, counted separately.)
 */
const MODULE_RANK: ModuleId[] = [
  "exercise2",
  "load_management",
  "footwear_replace",
  "posture_insole",
  "weight",
];

export function evaluate(input: Input): Result {
  // ---- C0 — red-flag gate: referral; no profile, stop. -------------------
  if (input.redFlags.length > 0) {
    return { route: "D0" };
  }

  // ---- C1 — fit routing (intake only; evaluated before physical tests). --
  if (input.painLocation === "back_of_heel") {
    return { route: "D0_soft" };
  }

  let fitScore = 0;
  if (input.painLocation === "inner_heel" || input.painLocation === "center_heel") {
    fitScore += 1;
  }
  if (
    input.worstWhen.includes("morning_first_steps") ||
    input.worstWhen.includes("after_sitting")
  ) {
    fitScore += 1;
  }
  if (input.worstWhen.includes("eases_moving")) fitScore += 1;
  if (input.thumbPress === "sharp_that_is_it") fitScore += 1;

  if (fitScore === 0) {
    return { route: "D0_soft" };
  }
  const hedged = fitScore <= 2; // 1–2 ⇒ hedged; 3–4 ⇒ not

  // ---- C2 — flags. --------------------------------------------------------
  const notes: Note[] = [];
  const capacity = computeCapacity(input, notes);
  const mobility = computeMobility(input, notes);
  const posture = {
    set:
      input.footprint === "flat" ||
      input.footprint === "high" ||
      input.shoes.innerEdgeWear,
  };
  const footwear = { set: input.shoes.deadCushion };
  const loadSpike = {
    set: input.loadChanges.length > 0,
    occupational: input.onFeet === "mostly_on_feet",
  };
  const weightModule = input.bmiBand === "over_30";

  const flags: Flags = {
    capacity,
    mobility,
    posture,
    footwear,
    loadSpike,
    weightModule,
  };

  // ---- C3 — route & compose. ----------------------------------------------
  // Maintaining factors: capacity, mobility, posture.
  // Contributors: load spike, footwear. Weight is a modifier — attaches at
  // whichever branch is reached, never routes alone.
  const anyMaintaining = capacity.set || mobility.set || posture.set;

  let route: Result["route"];
  if (anyMaintaining) route = "D2_composed";
  else if (loadSpike.set || footwear.set) route = "D5";
  else route = "D4";

  const triggerLine = loadSpike.set;

  let headlineFactor: HeadlineFactor = null;
  let modulesInFull: ModuleId[] = [];
  let alsoWorthAddressing: ModuleId[] = [];

  if (route === "D2_composed") {
    // Primary maintaining factor by priority Capacity > Mobility > Posture,
    // with overrides:
    //  - capacity labelled suspected_skipped is ineligible to headline (it
    //    renders as a note, never the headline) ⇒ fall through;
    //  - unconfirmed_bilateral may headline (hedged copy variant);
    //  - mobility subtype joint promotes the physio referral and suppresses
    //    Exercise 2.
    if (capacity.set && capacity.label !== "suspected_skipped") {
      headlineFactor = "capacity";
    } else if (mobility.set) {
      headlineFactor =
        mobility.subtype === "joint"
          ? "mobility_joint_referral"
          : "mobility_soft_tissue";
    } else {
      // Posture-only composed plan: the posture module renders in full;
      // there is no promoted headline variant for posture.
      headlineFactor = null;
    }

    // Modules attach per set factor, in flag-cap rank order.
    const modules: ModuleId[] = [];
    for (const id of MODULE_RANK) {
      switch (id) {
        case "exercise2":
          // Ex2 only ever attaches for soft-tissue mobility; joint subtype
          // gets the referral headline instead, never Ex2.
          if (mobility.set && mobility.subtype === "soft_tissue") {
            modules.push("exercise2");
          }
          break;
        case "load_management":
          if (loadSpike.set) modules.push("load_management");
          break;
        case "footwear_replace":
          if (footwear.set) modules.push("footwear_replace");
          break;
        case "posture_insole":
          if (posture.set) modules.push("posture_insole");
          break;
        case "weight":
          if (weightModule) modules.push("weight");
          break;
      }
    }

    // Flag-cap: prescription items = headline emphasis (1, when present) +
    // each attached module. Base plan (Ex1 + Ex3 + footwear note) is exempt
    // and never counted. > 3 items ⇒ top 3 in full, rest collapsed into
    // "Also worth addressing".
    const headlineCount = headlineFactor ? 1 : 0;
    if (headlineCount + modules.length > 3) {
      const fullSlots = 3 - headlineCount;
      modulesInFull = modules.slice(0, fullSlots);
      alsoWorthAddressing = modules.slice(fullSlots);
    } else {
      modulesInFull = modules;
    }
  }

  return {
    route,
    hedged,
    flags,
    headlineFactor,
    triggerLine,
    modulesInFull,
    alsoWorthAddressing,
    notes,
  };
}
