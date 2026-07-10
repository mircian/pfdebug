/**
 * pfdebug decision engine — types.
 *
 * Mirrors §1 (Input) and §6 (Result) of docs/pfdebug-engine-spec.md exactly.
 * This module is framework-agnostic: no DOM, no framework imports.
 */

export type Sensation = "stretch" | "front_pinch" | "ran_out"; // knee-to-wall end-feel
export type Foot = "left" | "right" | "both";
export type Side = "left" | "right";

export type PainLocation =
  | "inner_heel"
  | "center_heel"
  | "arch"
  | "back_of_heel"
  | "other";

export type WorstWhen =
  | "morning_first_steps"
  | "after_sitting"
  | "eases_moving"
  | "worse_later"
  | "constant";

export type ThumbPress = "sharp_that_is_it" | "tender_not_the_pain" | "nothing";

export type RedFlag =
  | "numbness_tingling_burning"
  | "night_or_rest_pain"
  | "after_impact"
  | "worsens_during_activity_until_stop"
  | "bilateral_plus_inflammatory"
  | "systemic" // fever / weight loss / cancer history
  | "diabetes_reduced_sensation"
  | "swollen_or_bruised"
  | "pain_8plus";

export type Duration = "lt_6wk" | "6wk_3mo" | "3_12mo" | "gt_1yr";

export type LoadChange =
  | "new_or_flatter_shoes"
  | "training_volume_jump"
  | "walking_standing_event"
  | "new_on_feet_routine"
  | "weight_gain"
  | "more_barefoot_hard_floors";

export type OnFeet = "mostly_sitting" | "mix" | "mostly_on_feet";
export type BmiBand = "under_25" | "25_30" | "over_30" | "declined";
export type AgeBand = "under_40" | "40_54" | "55_69" | "70plus";

export interface KneeToWall {
  left_cm: number;
  right_cm: number;
  sensationLeft: Sensation;
  sensationRight: Sensation;
}

/** Both sides tested. For bilateral cases both counts are "painful" sides;
 *  the engine only ever takes min() of the two, so the assignment of the two
 *  feet to goodReps/painfulReps is immaterial (see spec §4.1 note). */
export interface HeelRaiseTested {
  goodReps: number;
  painfulReps: number;
}

/** Painful side skipped for pain (flare). */
export interface HeelRaiseSkipped {
  goodReps: number;
  painfulSkipped: true;
}

export type HeelRaise = HeelRaiseTested | HeelRaiseSkipped;

export interface Input {
  // Step 0 — symptom & triage
  painLocation: PainLocation;
  worstWhen: WorstWhen[];
  thumbPress: ThumbPress;
  redFlags: RedFlag[]; // any present ⇒ gate

  // Step 1 — story
  duration: Duration;
  loadChanges: LoadChange[]; // empty array = "nothing"
  onFeet: OnFeet;
  bmiBand: BmiBand;
  ageBand: AgeBand;
  affectedFoot: Foot;

  // Step 2 — knee-to-wall (cm, canonical metric)
  kneeToWall: KneeToWall;

  // Step 3 — single-leg heel raise (reps)
  heelRaise: HeelRaise;

  // Step 4 — foot & footwear
  footprint: "flat" | "neutral" | "high";
  shoes: { innerEdgeWear: boolean; deadCushion: boolean };
}

export type Route = "D0" | "D0_soft" | "D2_composed" | "D5" | "D4";

export type CapacityLabel =
  | "confirmed"
  | "unconfirmed_bilateral"
  | "suspected_skipped";

export type MobilitySubtype = "soft_tissue" | "joint";

export type ModuleId =
  | "exercise2"
  | "posture_insole"
  | "footwear_replace"
  | "load_management"
  | "weight";

export type Note = "skipped_capacity" | "mobility_end_feel_unclear";

export interface Flags {
  capacity: { set: boolean; label?: CapacityLabel };
  mobility: {
    set: boolean;
    subtype?: MobilitySubtype;
    /** Which side drove the flag — not asserted by fixtures; carried for
     *  the renderer's copy slots ("your [side] measured [X] cm"). */
    limitedSide?: Side;
  };
  posture: { set: boolean };
  footwear: { set: boolean };
  loadSpike: { set: boolean; occupational?: boolean };
  weightModule: boolean;
}

export type HeadlineFactor =
  | "capacity"
  | "mobility_soft_tissue"
  | "mobility_joint_referral"
  | null;

export interface Result {
  route: Route;
  hedged?: boolean; // D1-alt "less typical" note precedes results
  flags?: Flags;
  headlineFactor?: HeadlineFactor; // for D2_composed
  triggerLine?: boolean; // load spike named as trigger
  modulesInFull?: ModuleId[];
  alsoWorthAddressing?: ModuleId[];
  notes?: Note[]; // e.g. the "couldn't test painful side" note
}
