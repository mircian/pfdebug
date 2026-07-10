# pfdebug — Engine Spec (v2, consolidated & implementation-ready)

Deterministic. Same input → same output, always. Implement as pure functions in `src/engine/`. Validate against `pfdebug-personas.fixtures.json` — **all 8 must pass.** This spec already incorporates all v2 bug fixes; there is nothing here to reconcile against older docs.

Pipeline: `evaluate(input) → result`, internally `C0 gate → C1 fit → C2 flags → C3 route & compose`.

---

## 1. Input schema

```ts
type Sensation = "stretch" | "front_pinch" | "ran_out";      // knee-to-wall end-feel
type Foot = "left" | "right" | "both";

interface Input {
  // Step 0 — symptom & triage
  painLocation: "inner_heel" | "center_heel" | "arch" | "back_of_heel" | "other";
  worstWhen: Array<"morning_first_steps" | "after_sitting" | "eases_moving" | "worse_later" | "constant">;
  thumbPress: "sharp_that_is_it" | "tender_not_the_pain" | "nothing";
  redFlags: Array<                                            // Q4 — any present ⇒ gate
    | "numbness_tingling_burning"
    | "night_or_rest_pain"
    | "after_impact"
    | "worsens_during_activity_until_stop"
    | "bilateral_plus_inflammatory"
    | "systemic"                // fever / weight loss / cancer history
    | "diabetes_reduced_sensation"
    | "swollen_or_bruised"
    | "pain_8plus"
  >;

  // Step 1 — story
  duration: "lt_6wk" | "6wk_3mo" | "3_12mo" | "gt_1yr";
  loadChanges: Array<           // Q6 — any (non-empty) ⇒ load spike
    | "new_or_flatter_shoes"
    | "training_volume_jump"
    | "walking_standing_event"
    | "new_on_feet_routine"
    | "weight_gain"
    | "more_barefoot_hard_floors"
  >;                            // empty array = "nothing"
  onFeet: "mostly_sitting" | "mix" | "mostly_on_feet";       // Q7
  bmiBand: "under_25" | "25_30" | "over_30" | "declined";    // Q9
  ageBand: "under_40" | "40_54" | "55_69" | "70plus";        // Q10
  affectedFoot: Foot;                                        // Q11

  // Step 2 — knee-to-wall (cm, canonical metric)
  kneeToWall: {
    left_cm: number;
    right_cm: number;
    sensationLeft: Sensation;
    sensationRight: Sensation;
  };

  // Step 3 — single-leg heel raise (reps)
  heelRaise:
    | { goodReps: number; painfulReps: number }              // both sides tested
    | { goodReps: number; painfulSkipped: true };            // painful side skipped for pain (flare)

  // Step 4 — foot & footwear
  footprint: "flat" | "neutral" | "high";
  shoes: { innerEdgeWear: boolean; deadCushion: boolean };
}
```

---

## 2. C0 — Red-flag gate

```
if (input.redFlags.length > 0)  ⇒  return { route: "D0" }   // referral; no profile, stop
```

## 3. C1 — Fit routing (evaluate on intake, before physical tests in-product)

- If `painLocation === "back_of_heel"` ⇒ `return { route: "D0_soft" }`.
- Compute `fitScore` = count of:
  - `painLocation ∈ {inner_heel, center_heel}` → +1
  - `worstWhen` includes `morning_first_steps` OR `after_sitting` → +1
  - `worstWhen` includes `eases_moving` → +1
  - `thumbPress === "sharp_that_is_it"` → +1
- `fitScore === 0` ⇒ `return { route: "D0_soft" }`.
- `fitScore ∈ {1,2}` ⇒ set `hedged = true` (results open with the D1-alt note), continue.
- `fitScore ∈ {3,4}` ⇒ `hedged = false`, continue.

## 4. C2 — Flags

Helper — age floor for the single-leg heel raise:

```
floor(ageBand) = { under_40: 20, 40_54: 16, 55_69: 12, 70plus: 8 }[ageBand]
```

### 4.1 Capacity — branches on laterality

Let `capacity = { set: false, label: null }`. `label ∈ { "confirmed", "unconfirmed_bilateral", "suspected_skipped" }`.

**Unilateral** (`affectedFoot ∈ {left, right}`, both sides tested):
```
good = goodReps; painful = painfulReps
asym = (good - painful) / good          // fraction
if (asym >= 0.20) OR (painful < floor(ageBand)):
    capacity = { set: true, label: "confirmed" }
```

**Bilateral** (`affectedFoot === "both"`): asymmetry does **not** apply. Use the worse (lower) side vs floor.
```
worse = min(left_reps, right_reps)      // both are "painful"; from heelRaise both-tested shape
if (worse < floor(ageBand)):
    capacity.set = true
    capacity.label = (bmiBand === "over_30") ? "unconfirmed_bilateral" /*BMI-limited*/
                                             : "unconfirmed_bilateral"
// if worse >= floor ⇒ not set (a self-test can't detect a bilateral deficit without norms;
//                     Ex1 is universal and covers it anyway — see copy)
```
*(Note: for a bilateral case, heelRaise carries both side counts. Model bilateral input as both-tested with the affected-side semantics; the fixtures show the shape.)*

**Painful side skipped** (`heelRaise.painfulSkipped === true`): capacity is *unmeasured*.
```
if (goodReps >= floor(ageBand)):
    capacity = { set: false }                 // good side in range — no deficit assumed
else:
    capacity = { set: true, label: "suspected_skipped" }
// In BOTH cases capacity is INELIGIBLE to be the headline (see C3). It renders the skipped copy variant.
```

### 4.2 Mobility

```
limitedSide = side with the lower knee_to_wall cm (tie ⇒ affected side)
mobility.set = (min(left_cm, right_cm) < 10) OR (abs(left_cm - right_cm) >= 2)   // inclusive 2cm
subtype = {
  stretch:     "soft_tissue",
  front_pinch: "joint",
  ran_out:     "soft_tissue"    // note as unclear
}[ sensation on limitedSide ]
```

### 4.3 Others

```
posture.set   = (footprint === "flat" || footprint === "high") || shoes.innerEdgeWear
footwear.set  = shoes.deadCushion || <collapsing heel counter>   // deadCushion captures this
loadSpike.set = loadChanges.length > 0
loadSpike.occupational = (onFeet === "mostly_on_feet")
weightModule  = (bmiBand === "over_30")
```

## 5. C3 — Route & compose

Taxonomy:
- **Maintaining factors:** Capacity, Mobility, Foot posture.
- **Contributors:** Load spike, Footwear, Weight (modifier).

### 5.1 Router — first match wins

```
1. if any maintaining factor is set (capacity.set || mobility.set || posture.set)
        ⇒ COMPOSE a plan (5.2)
2. else if (loadSpike.set || footwear.set)
        ⇒ route "D5"   (Overload; base plan applies; contributor named as trigger+driver)
3. else
        ⇒ route "D4"   (No-clear-driver; base plan + gait-assessment prompt)

weightModule attaches at whichever of 1/2/3 is reached (never routes alone).
```

### 5.2 Compose (router branch 1)

**Trigger line:** if `loadSpike.set`, name what set it off (quote the `loadChanges`; if `duration ∈ {lt_6wk, 6wk_3mo}`, add the lag note).

**Primary maintaining factor** = top *set* maintaining factor by priority `Capacity > Mobility > Foot posture`, with overrides:
- Capacity is **ineligible to headline** if `label === "suspected_skipped"` or capacity unmeasured-skipped ⇒ fall through to next set maintaining factor.
- Capacity with `label === "unconfirmed_bilateral"` **may** headline, but only via the hedged copy variant (no comparison quote).
- If the primary is **Mobility with `subtype === "joint"`**, the headline action is the **physio referral**, and **Exercise 2 is suppressed** (not prescribed).

**Base plan** (always, exempt from the cap): Exercise 1 + Exercise 3 + universal footwear note.

**Modules** attach per set factor:
- Mobility `soft_tissue` → Exercise 2.  Mobility `joint` → the promoted referral headline, **no Ex2**.
- Foot posture → posture/insole module.
- Footwear → footwear-replace module.
- Load spike → load-management module (+ occupational note if flagged).
- Weight → weight module.

**Flag-cap:** count **prescription items** = headline emphasis (1) + each attached module `{Ex2 (soft-tissue only), posture-insole, footwear-replace, load-management, weight}`. Base plan is **not** counted. If item count **> 3**, rank by:

```
Capacity  >  Mobility(Ex2)  >  Load-management  >  Footwear-replace  >  Posture-insole  >  Weight
```

Show the **top 3** in full; collapse item 4+ into a single **"Also worth addressing"** block (one sentence each, from copy). ≤3 items ⇒ all shown in full.

---

## 6. Output schema

```ts
interface Result {
  route: "D0" | "D0_soft" | "D2_composed" | "D5" | "D4";
  hedged?: boolean;                      // D1-alt note precedes results
  flags?: {
    capacity: { set: boolean; label?: "confirmed" | "unconfirmed_bilateral" | "suspected_skipped" };
    mobility: { set: boolean; subtype?: "soft_tissue" | "joint" };
    posture:  { set: boolean };
    footwear: { set: boolean };
    loadSpike:{ set: boolean; occupational?: boolean };
    weightModule: boolean;
  };
  headlineFactor?:                        // for D2_composed
    | "capacity" | "mobility_soft_tissue" | "mobility_joint_referral" | null;
  triggerLine?: boolean;                  // load spike named as trigger
  modulesInFull?: Array<"exercise2" | "posture_insole" | "footwear_replace"
                       | "load_management" | "weight">;
  alsoWorthAddressing?: Array<"posture_insole" | "footwear_replace" | "weight" | ...>;
  notes?: Array<"skipped_capacity" | ...>;// e.g. the "couldn't test painful side" note
}
```

The base plan (Ex1, Ex3, footwear note) is implicit for every route except `D0` and `D0_soft` — the renderer always includes it; it is not listed in `modulesInFull`.

---

## 7. Boundaries — decided, inclusive

- Capacity asymmetry fires at **`>= 20%`** (inclusive).
- Mobility asymmetry fires at **`>= 2 cm`** (inclusive).
- Verified against all 8 fixtures: making these inclusive changes **no** persona outcome; it removes the off-by-one where a user lands exactly on the boundary. Keep them inclusive and comment the choice in code.

## 8. Future upgrade hook (not v1)

The age-floor table is a Phase-0 proxy. v1.1 replaces `floor(ageBand)` with published normative equations (Hébert-Losier 2017; Calf Raise App 2025) keyed on age/sex/BMI, which also enables a norm-based single-leg read *without* a contralateral comparison — at which point the bilateral branch can soften from "unconfirmed" toward a real estimate. Keep `floor()` isolated behind one function so this swap is localized.
