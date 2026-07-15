/**
 * pfdebug — every user-facing string, from docs/pfdebug-copy.md, verbatim.
 *
 * Strings keep the doc's inline emphasis as markdown (**bold** / *italic*),
 * rendered by the <Md> component. `[bracketed slots]` become functions that
 * fill from the user's own values. Strings are centralized here so a later
 * localization pass touches one file (BUILD.md §10).
 *
 * Do not paraphrase or "improve" clinical/safety wording.
 */

import type {
  Duration,
  LoadChange,
  PainLocation,
  RedFlag,
  Side,
} from "~/engine";

// ---------------------------------------------------------------------------
// Landing (`/`)
// ---------------------------------------------------------------------------

export const landing = {
  hero_title: "Find out what's actually driving your heel pain.",
  hero_body:
    "A 15-minute self-check. It runs the same movement tests a physio starts with, works out which factors are most likely behind *your* plantar fasciitis, and gives you a short plan of exercises backed by published trials. Free. No signup.",
  cta: "Start the check",
  evidence_badges: ["Rathleff 2015", "JOSPT 2023 guideline", "Riddle 2003"],
  small_print:
    "This is a self-check, not a diagnosis, and it flags anything that means you should see a professional first.",
  returning_title: "Welcome back.",
  returning_body: "Your plan is saved on this device.",
  view_plan: "View my plan",
  retest: "Retest",
} as const;

// ---------------------------------------------------------------------------
// Wizard (`/assessment`)
// ---------------------------------------------------------------------------

export const step0 = {
  title: "Before we start",
  intro:
    "This is a self-check, not a diagnosis. It looks at how your foot and ankle move and points you toward what's most likely driving your heel pain — and it flags anything that means you should see a professional first. Nothing here is a substitute for a clinician. The exercises it may suggest are gentle and widely recommended, but if anything hurts sharply, stop.",

  q1: {
    question: "Where is your pain?",
    options: [
      { value: "inner_heel", label: "Bottom of the heel, toward the inner edge" },
      { value: "center_heel", label: "Bottom of the heel, dead center" },
      { value: "arch", label: "Along the arch, toward the middle of the foot" },
      { value: "back_of_heel", label: "Back of the heel / above the heel" },
      { value: "other", label: "Somewhere else / hard to pin down" },
    ],
  },

  q2: {
    question: "When is it worst?",
    options: [
      { value: "morning_first_steps", label: "First few steps in the morning" },
      { value: "after_sitting", label: "First steps after sitting a while" },
      { value: "eases_moving", label: "It eases once I get moving" },
      { value: "worse_later", label: "It gets worse later in the day or after being active" },
      { value: "constant", label: "It's constant, doesn't change much" },
    ],
  },

  q3: {
    question: "Press your thumb into the inner part of your heel bone. What happens?",
    options: [
      { value: "sharp_that_is_it", label: "Sharp, tender spot right there — that's my pain" },
      { value: "tender_not_the_pain", label: "Tender, but not exactly the pain I feel walking" },
      { value: "nothing", label: "Nothing much" },
    ],
  },

  q4: {
    question: "Safety checks. Do you have any of these?",
    note: "These rule out things that look like plantar fasciitis but need a professional. Answer honestly — if any apply, the best thing we can do is point you to the right person.",
    options: [
      { value: "numbness_tingling_burning", label: "Numbness, tingling, pins-and-needles, or burning in the foot" },
      { value: "night_or_rest_pain", label: "Pain at night, or pain at rest that isn't related to activity" },
      { value: "after_impact", label: "The pain started after a fall, twist, or impact" },
      { value: "worsens_during_activity_until_stop", label: "Pain that gets steadily worse *during* activity until you have to stop" },
      { value: "bilateral_plus_inflammatory", label: "Both heels hurt, **and** I have morning stiffness in other joints too, or a diagnosed inflammatory condition" },
      { value: "systemic", label: "Fever, or unexplained recent weight loss, or a history of cancer" },
      { value: "diabetes_reduced_sensation", label: "Diabetes with reduced feeling in my feet" },
      { value: "swollen_or_bruised", label: "The heel is visibly swollen or bruised" },
      { value: "pain_8plus", label: "My pain is a steady 8/10 or higher" },
    ],
    none_label: "None of these",
  },
} as const;

export const step1 = {
  title: "Your story",
  intro:
    "Plantar fasciitis usually has a trigger — something that changed a few weeks before it started. This helps us find yours.",

  q5: {
    question: "How long have you had this?",
    options: [
      { value: "lt_6wk", label: "Less than 6 weeks" },
      { value: "6wk_3mo", label: "6 weeks to 3 months" },
      { value: "3_12mo", label: "3 to 12 months" },
      { value: "gt_1yr", label: "Over a year" },
    ],
  },

  q6: {
    question: "In the 2–6 weeks *before* the pain started, did any of these change?",
    options: [
      { value: "new_or_flatter_shoes", label: "New shoes, or switched to flatter / less supportive shoes" },
      { value: "training_volume_jump", label: "A jump in running, walking, or training volume" },
      { value: "walking_standing_event", label: "A trip or event with a lot of walking / standing" },
      { value: "new_on_feet_routine", label: "Started a new job or routine that keeps me on my feet" },
      { value: "weight_gain", label: "Notable weight gain" },
      { value: "more_barefoot_hard_floors", label: "A lot more barefoot time on hard floors" },
    ],
    none_label: "Nothing I can think of",
  },

  q7: {
    question: "On a normal day, how much are you on your feet?",
    options: [
      { value: "mostly_sitting", label: "Mostly sitting" },
      { value: "mix", label: "A mix" },
      { value: "mostly_on_feet", label: "Mostly standing or walking" },
    ],
  },

  q9: {
    question: "(Optional) Which band is your BMI in?",
    note: "We ask because higher body weight is one of the most consistent contributors in the research — it changes what we'd emphasize. Skip if you'd rather not.",
    options: [
      { value: "under_25", label: "Under 25" },
      { value: "25_30", label: "25–30" },
      { value: "over_30", label: "Over 30" },
      { value: "declined", label: "Prefer not to say" },
    ],
  },

  q10: {
    question: "Age band",
    options: [
      { value: "under_40", label: "Under 40" },
      { value: "40_54", label: "40–54" },
      { value: "55_69", label: "55–69" },
      { value: "70plus", label: "70+" },
    ],
  },

  q11: {
    question: "Which foot?",
    options: [
      { value: "left", label: "Left" },
      { value: "right", label: "Right" },
      { value: "both", label: "Both" },
    ],
  },
} as const;

export const step2 = {
  title: "Knee-to-wall test",
  instructions: [
    "Stand facing a wall. Put the toes of one foot pointing straight at the wall, a few centimeters back from it. Keeping your heel flat on the floor — it must not lift — bend your knee forward and try to touch the wall with your knee.",
    "If your knee touches easily, slide that foot back and try again. If your heel lifts or your knee can't reach, slide in closer. Find the farthest-back spot where your knee still touches and your heel stays down. Measure from the tip of your big toe to the wall. Do both feet.",
  ],
  helper:
    "Enter the distance for each foot. **No tape measure?** Pick your phone — [model dropdown] — and tell us how many phone-lengths, or use a bank card (8.56 cm each).",
  helper_lead: "Enter the distance for each foot.",
  helper_no_tape: "No tape measure?",
  helper_tail: "and tell us how many phone-lengths, or use a bank card (8.56 cm each).",
  helper_pick_phone: "Pick your phone —",
  endfeel: {
    question: "At that farthest position, what did you feel most?",
    options: [
      { value: "stretch", label: "A stretch or pull in your calf or the back of your ankle" },
      { value: "front_pinch", label: "A pinch or block at the *front* of your ankle, where it folds" },
      { value: "ran_out", label: "Nothing really — you just ran out of room / balance" },
    ],
  },
} as const;

export const step3 = {
  title: "Single-leg heel raise",
  instructions: [
    "Stand on one foot. Rest a couple of fingertips on a wall for balance only — don't push down on it. Rise up as high as you can onto the ball of your foot, then lower all the way down, slowly — about two seconds up, two seconds down. Count each one. Stop when you can't get as high as you did at the start, you can't keep the pace, your knee starts bending to cheat, or the pain goes past about 5 out of 10.",
    "We'll do your *good* side first, rest two minutes, then the painful side.",
  ],
  skip_question: "Too sore to do this side today?",
  skip_button: "Skip — I'll retest later",
  skip_note: "(records the flare; the plan still works)",
} as const;

export const step4 = {
  title: "Foot & footwear",
  footprint: {
    question:
      "Wet the sole of your foot, step firmly onto a dry tile or paper, step off, and look. Which is it?",
    label: "Wet footprint:",
    options: [
      { value: "flat", label: "Full print — little or no gap on the inner side" },
      { value: "neutral", label: "A clear curve missing on the inner side (a normal arch)" },
      { value: "high", label: "Only a thin strip connects the ball and heel" },
    ],
  },
  shoes: {
    label: "Shoe check:",
    lead: "Grab the pair you wear most.",
    innerWear: "From behind: is the wear heavier on the inner edge?",
    innerWearOptions: [
      { value: "yes", label: "yes" },
      { value: "no", label: "no" },
      { value: "even", label: "even" },
    ],
    deadCushion:
      "Is the heel cushioning worn flat, or does the back collapse inward when you press it?",
    deadCushionOptions: [
      { value: "yes", label: "yes" },
      { value: "no", label: "no" },
    ],
  },
} as const;

export const persistenceNotice = {
  body: "**Your results are saved on this device.** Next time you open pfdebug.com, your plan will be right here. To open it from another device, bookmark this link.",
  cta: "See my plan",
} as const;

// ---------------------------------------------------------------------------
// Result pages (`/plan`)
// ---------------------------------------------------------------------------

/** D0 — the flag they checked, phrased for "Tell them … and [slot]". */
export function redFlagPhrase(flags: readonly RedFlag[]): string {
  const phrases: Record<RedFlag, string> = {
    numbness_tingling_burning: "the numbness, tingling, or burning in your foot",
    night_or_rest_pain: "the pain at night or at rest",
    after_impact: "that the pain started after a fall, twist, or impact",
    worsens_during_activity_until_stop:
      "that the pain gets steadily worse during activity until you have to stop",
    bilateral_plus_inflammatory:
      "that both heels hurt alongside morning stiffness in other joints or a diagnosed inflammatory condition",
    systemic: "the fever, unexplained weight loss, or history of cancer",
    diabetes_reduced_sensation: "your diabetes with reduced feeling in your feet",
    swollen_or_bruised: "that the heel is visibly swollen or bruised",
    pain_8plus: "that the pain is a steady 8/10 or higher",
  };
  const list = flags.map((f) => phrases[f]);
  if (list.length <= 1) return list[0] ?? "";
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

export const referral = {
  title: "Let's get you to the right person first.",
  body: "Your answers include something worth having a professional look at before you start any self-treatment — not necessarily because it's serious, but because it's outside what a self-check should handle. A few things can mimic plantar fasciitis: a nerve issue, a stress fracture, or an inflammatory condition, and each needs a different approach.",
  whatToDo: (flags: readonly RedFlag[]) =>
    `**What to do:** see a GP, physiotherapist, or podiatrist. Tell them where your pain is, when it's worst, and ${redFlagPhrase(flags)}.`,
  closing:
    "This isn't a dead end — once that's ruled out, everything else here is still waiting for you.",
} as const;

export const doesntMatch = {
  title: "This might not be plantar fasciitis.",
  body: (painLocation: PainLocation) => {
    const reason =
      painLocation === "back_of_heel"
        ? "pain at the back of the heel points more toward the Achilles"
        : "your pain doesn't seem to spike on those first morning steps, which is the classic tell";
    return `From what you've described, your pain doesn't quite fit the usual pattern — ${reason}. This tool is built specifically for plantar fasciitis, so rather than send you down the wrong path, the honest move is to get it looked at. A physiotherapist or podiatrist can tell in one visit. If it turns out it *is* plantar fasciitis, come back — the check will be here.`;
  },
} as const;

export const lessTypical = {
  body: "One note before your results: your pain fits *some* of the plantar fasciitis pattern but not all of it. The plan below is still reasonable and completely safe to try, but if a few weeks of it doesn't move the needle, that's your cue to see someone in person rather than keep guessing.",
} as const;

export const basePlan = {
  title: "Here's what we found — and what to do about it.",
  intro:
    "Plantar fasciitis isn't random. It shows up when the tissue on the bottom of your foot gets loaded harder than it can handle — and that's fixable, because the thing that protects it, your calf and the foot's own capacity, responds to training. The plan below is built on that. It's small on purpose: three movements, each backed by published trials, not a scattergun of twenty stretches.",
  rule: "**The one rule that makes it work:** load beats rest. Resting calms an angry fascia for a morning, then it flares again on the next big day, because nothing got stronger. These exercises make the tissue tougher so ordinary days stop hurting. Expect the turnaround in weeks, not days — in the main study the strength group pulled clearly ahead by three months. Some ups and downs along the way are normal, not a sign it's failing.",
} as const;

export const exercise1 = {
  title: "Exercise 1 — Heel raise with a towel under your toes",
  audience: "everyone",
  why: "The exercise with the best evidence for plantar fasciitis. Rolling a towel under your toes bends them up, which loads the fascia itself along with your calf — so you strengthen the exact tissue that hurts.",
  how: "**How:** Roll a towel under your toes so they bend upward. Put the ball of that foot on the towel (progress to a step edge once comfortable). Rise up slowly onto your toes, pause at the top, lower slowly — **3 seconds up, 2-second hold, 3 seconds down.**",
  dose: "**Dose:** Every second day — not daily; the tissue needs the day off to adapt. Start **3 sets of 12** both feet. When 12 is easy, add weight (a loaded backpack) and drop reps: **4 × 10, then 5 × 8.**",
  feel: "**You should feel** your calf working hard; some heel awareness up to about 5/10 that settles within a day is fine. **Stop or ease off if** the pain is sharp, past 5/10, or worse the next morning.",
} as const;

export const exercise3 = {
  title: "Exercise 3 — Plantar-fascia stretch",
  audience: "everyone — the morning tool",
  why: "This buys you comfortable first steps. Done before you stand up in the morning, it takes the edge off the worst moment of the day.",
  how: "**How:** Sit down. Cross the painful foot over your other knee. Grab your toes and pull them back toward your shin until you feel a stretch along the arch — you can feel the tight band with your thumb. Hold **10 seconds, 10 times.**",
  dose: "**Dose:** 3 times a day — and above all, **one round before your first steps out of bed.**",
} as const;

export const footwearNote = {
  title: "Universal footwear note",
  audience: "everyone, after the exercises",
  body: "Two small things both trial groups did: wear supportive shoes from your very first step in the morning — barefoot on hard floors first thing is when the fascia is most irritable — and a cheap gel heel cup or cushioned insole gives it a rest while it gets stronger.",
} as const;

// ---- Capacity emphasis — variant from flags.capacity.label -----------------

export interface CapacityConfirmedSlots {
  /** Painful-side reps. */
  painful: number;
  /** Good-side reps. */
  good: number;
  /** Age floor for their band. */
  floor: number;
  /** Which condition(s) fired. */
  asymFired: boolean;
  floorFired: boolean;
}

export const capacityConfirmed = {
  render: (s: CapacityConfirmedSlots) => {
    let shown: string;
    if (s.asymFired && s.floorFired) {
      shown = `painful side ${s.painful} reps vs ${s.good} on the other side, and below the ${s.floor}-rep benchmark for your age`;
    } else if (s.asymFired) {
      shown = `painful side ${s.painful} reps vs ${s.good} on the other side`;
    } else {
      shown = `${s.painful} reps, below the ${s.floor}-rep benchmark for your age`;
    }
    return `**Why this is your priority:** your strength test showed ${shown}. That gap is very likely the main thing keeping this going, and Exercise 1 is the direct fix. Track the number — watching it climb is how you'll know it's working before the pain even changes.`;
  },
} as const;

export const capacityUnconfirmedBilateral = {
  render: (worseReps: number, bmiLimited: boolean) => {
    const bmiClause = bmiLimited
      ? ", and at your body weight the simple rep benchmark isn't a reliable yardstick either"
      : "";
    return `**About your calf strength:** both heels are affected, so we couldn't do the side-to-side comparison we normally rely on — there was no strong side to measure the weak one against${bmiClause}. What we can say is both sides came in on the low side (around ${worseReps} reps). We can't *confirm* a deficit cleanly, but Exercise 1 builds exactly the capacity that shields the fascia, so make it your anchor either way. Once one side settles enough to test properly, a side-to-side retest will give a clearer read.`;
  },
} as const;

/** suspected_skipped / capacity skipped — renders as a note, never the headline. */
export const capacitySkippedNote = {
  render: (goodReps: number, goodInRange: boolean) => {
    const middle = goodInRange
      ? `Your other side came in within range (${goodReps} reps), so there's no sign of a deficit; a proper comparison just waits until you can test the sore side.`
      : `Even your unaffected side came in a bit under the benchmark (${goodReps}), so some calf weakness is likely — worth confirming once things calm down.`;
    return `**One thing we couldn't test today:** the calf strength on your painful side — the pain stopped you early, which is completely normal in a flare. ${middle} Either way, Exercise 1 is strengthening both sides now. Retest the painful side when the flare settles.`;
  },
} as const;

// ---- Exercise 2 — knee-to-wall mobilization (soft-tissue mobility only) ----

export const exercise2 = {
  title: "Exercise 2 — Knee-to-wall ankle mobilization",
  why: (side: Side | "both", measured: string, threshold: string) =>
    `Your ankle doesn't bend forward as far as it should (your ${side === "both" ? "tighter side" : side} measured ${measured}; under about ${threshold} is tight). When the ankle is stiff, the foot flattens to make up the difference — and that overstretches the fascia every step. This loosens it, and it's the same movement you did as a test, so you already know it.`,
  how: "**How:** Foot pointing at the wall, heel down, drive the knee forward over your toes toward the wall, then back. Slow, work the last comfortable bit of range, don't bounce. Do a version with the knee soft (targets the deeper calf muscle, usually the real limiter).",
  dose: "**Dose:** 2 sets of 10–12 slow reps per side, daily.",
  stop: "**Stop if** what you feel is a pinch at the *front* of the ankle rather than a stretch behind it.",
} as const;

// ---- Mobility, joint sub-type — promoted headline (Ex2 NOT shown) ----------

export const mobilityJointHeadline = {
  title: "Your ankle needs hands, not reps.",
  body: (side: Side | "both", measured: string) =>
    `Your ankle doesn't bend forward as far as it should (your ${side === "both" ? "tighter side" : side} measured ${measured}), but the **pinch at the front of the ankle** you felt — rather than a stretch behind it — points to the restriction being in the joint itself, not a tight muscle. That difference matters: joint restrictions respond to hands-on mobilization far better than to stretching, and this is the one thing on the whole site genuinely worth a professional's hands.`,
  action:
    "**Your highest-value move is a single visit to a physiotherapist or podiatrist** to mobilize that ankle — often a quick fix in person and awkward to do well alone. You can try a few gentle knee-to-wall reps meanwhile, but if that front-of-ankle pinch keeps showing up, stop: that's your signal this needs hands, not reps.",
} as const;

// ---- Load-management module -------------------------------------------------

/** Their Q6 answer, phrased to follow "you mentioned …". */
export function loadChangesPhrase(changes: readonly LoadChange[]): string {
  const phrases: Record<LoadChange, string> = {
    new_or_flatter_shoes: "new shoes, or a switch to flatter / less supportive shoes",
    training_volume_jump: "a jump in running, walking, or training volume",
    walking_standing_event: "a trip or event with a lot of walking / standing",
    new_on_feet_routine: "a new job or routine that keeps you on your feet",
    weight_gain: "notable weight gain",
    more_barefoot_hard_floors: "a lot more barefoot time on hard floors",
  };
  const list = changes.map((c) => phrases[c]);
  if (list.length <= 1) return list[0] ?? "";
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

export function isShortDuration(duration: Duration): boolean {
  return duration === "lt_6wk" || duration === "6wk_3mo";
}

export const loadManagement = {
  whatSetThisOff: (changes: readonly LoadChange[], duration: Duration) => {
    const lag = isShortDuration(duration)
      ? ", and the pain started a few weeks later, the textbook lag — tissue injuries show up weeks after the thing that caused them"
      : "";
    return `**What set this off:** you mentioned ${loadChangesPhrase(changes)}${lag}. Naming the trigger tells you what to pull back on now.`;
  },
  whatToDo: (changes: readonly LoadChange[]) => {
    const pullBack = changes.includes("new_or_flatter_shoes")
      ? "back to supportive shoes"
      : "less of that";
    return `**What to do:** don't stop moving — just take the spike back out. Cut the specific thing that jumped (${pullBack}), keep everything else. Build back up slowly, a little each week rather than all at once.`;
  },
  occupational:
    "Since you're on your feet most of the day, the footwear and insole part isn't optional for you — it does a lot of the work of protecting the tissue between sessions.",
} as const;

// ---- Posture module ----------------------------------------------------------

export function postureObservation(
  footprint: "flat" | "neutral" | "high",
  innerEdgeWear: boolean,
): string {
  const parts: string[] = [];
  if (footprint === "flat") parts.push("a foot that flattens under load");
  if (footprint === "high") parts.push("a high arch that doesn't absorb much");
  if (innerEdgeWear) parts.push("heavier wear on the inner edge");
  return parts.join(" and ");
}

export const postureModule = {
  render: (footprint: "flat" | "neutral" | "high", innerEdgeWear: boolean) =>
    `**Your arch:** your footprint / shoe wear points to ${postureObservation(footprint, innerEdgeWear)}. That changes how force lands on the fascia. You can't change your foot's shape, but you can support it. A supportive shoe with a firm heel and some arch support does most of this; an off-the-shelf arch-support insole is a reasonable next step — no need for custom orthotics to start. If the simple version doesn't help in a few weeks, a podiatrist can say whether custom is worth it.`,
} as const;

// ---- Footwear-replace module --------------------------------------------------

export const footwearReplace = {
  body: "**Your shoes:** the pair you checked is worn flat / the heel is collapsing. Dead shoes stop protecting the foot no matter how good your arch is — this alone can start heel pain. Replacing that pair may be the single easiest thing on this list.",
} as const;

// ---- Weight module -------------------------------------------------------------

export const weightModule = {
  body: "**One more factor, plainly:** carrying extra weight is one of the most consistent contributors to plantar fasciitis in the research — every step lands harder on the fascia. This isn't about appearance and it's not a lecture; it's just that if weight comes down over time, the load on your foot comes down with it, and everything above works better. Keep it in the picture alongside the exercises, not instead of them.",
} as const;

// ---- "Also worth addressing" — collapse block ----------------------------------

export const alsoWorthAddressing = {
  title: "Also worth addressing",
  lead: "smaller factors; the moves above matter most:",
  items: {
    footwear_replace:
      "The pair of shoes you checked is worn out — replacing it is an easy, one-time win.",
    posture_insole: (footprint: "flat" | "neutral" | "high") =>
      `Your arch ${footprint === "high" ? "is high" : "flattens under load"}; an off-the-shelf arch-support insole is a reasonable add.`,
    weight:
      "Extra body weight loads the fascia every step; as it comes down over time, everything here works better.",
    load_management:
      "A recent jump in load likely set this off — take the spike back out and build back up a little each week.",
    exercise2:
      "Your ankle is on the tight side; slow knee-to-wall mobilizations (2 sets of 10–12 daily) will loosen it.",
  },
} as const;

// ---- Overload (D5) ---------------------------------------------------------------

export const overload = {
  title: "Good news: nothing's broken. You did too much, too soon.",
  reassurance:
    "This isn't us waving your pain away — it's real, and it's worth fixing. It's us telling you the fix is simpler than you might have feared.",
  testsClean: (calf: string, ankle: string, archShoes: string) =>
    `Your tests came back clean across the board — ${calf} · ${ankle} · ${archShoes}. That matters, because it means the tissue on the bottom of your foot is healthy.`,
  archShoesClean: "your arch and shoes are doing their job",
  /** When footwear is flagged the shoes did NOT pass — name only the arch. */
  archOnlyClean: "your arch is doing its job",
  calfHeldUp: (painful: number, good: number) =>
    `your calf held up: painful side ${painful} reps vs ${good}, both strong`,
  calfGoodSideOnly: (good: number) =>
    `your good side held up: ${good} reps, strong`,
  ankleBendsFine: (measured: string) => `your ankle bends fine: ${measured}`,
  whatTippedIt: (changes: readonly LoadChange[], duration: Duration) => {
    const lag = isShortDuration(duration)
      ? ", and the pain showing up a few weeks later is the textbook lag"
      : "";
    return `What tipped it over was **load**: ${loadChangesPhrase(changes)}${lag}.`;
  },
  /** Footwear-only D5 — the contributor named from the footwear module's own wording. */
  whatTippedItFootwear:
    "What tipped it over was **load**: the pair you checked is worn flat / the heel is collapsing — dead shoes stop protecting the foot no matter how good your arch is.",
  bestVersion:
    "Plantar fasciitis from a load spike is the best version to get: the fix isn't months of rehab for a weakness you don't have — it's managing the dose while the tissue settles, then building a bigger buffer so the next jump doesn't do this again.",
  whatToDoNow: (changes: readonly LoadChange[]) => {
    const pullBack = changes.includes("new_or_flatter_shoes")
      ? "back to your supportive shoes"
      : "less of the specific thing that jumped";
    return `**What to do now:** take the spike back out — ${pullBack} — but keep moving; don't rest it into stiffness. When you build back up, add a little each week.`;
  },
  whatToDoNowFootwear:
    "**What to do now:** replace your worn pair — dead shoes stop protecting the foot — but keep moving; don't rest it into stiffness. When you build back up, add a little each week.",
  notAgain:
    "**And to make it not happen again:** the two exercises below aren't fixing a fault — they're widening your margin. A stronger calf and a loaded fascia absorb a bigger jump before complaining.",
} as const;

// ---- No-clear-driver (D4) -----------------------------------------------------------

export const noClearDriver = {
  title: "Good news, and an honest answer.",
  body: (calfReps: number, ankle: string) =>
    `Your tests came back clean: your calf strength is solid (${calfReps} reps), your ankle moves well (${ankle}), your arch and shoes look fine — **and** nothing in your history points to a specific trigger. That's genuinely good; the usual suspects aren't your problem.`,
  honest:
    "It also means a self-check has taken you as far as it usefully can. When every obvious driver is clear *and* there's no load spike to explain it, the answer is usually something that needs eyes on you moving — how you walk or run, or something further up the chain at the hip. That's a gait assessment, and it's exactly what a physiotherapist or podiatrist does.",
  stillDo:
    "The plan below is still safe and still worth doing. But if it doesn't shift things in a few weeks, book the assessment rather than keep self-testing — you've already done the triage they'd start with. Bring these numbers.",
} as const;

// ---------------------------------------------------------------------------
// Retest mode & result deltas
// ---------------------------------------------------------------------------

export const retest = {
  improvement: (side: string, oldReps: number, newReps: number, weeks: number) =>
    `**${side} calf: ${oldReps} → ${newReps} reps in ${weeks} weeks.**`,
} as const;

// ---------------------------------------------------------------------------
// Share strings
// ---------------------------------------------------------------------------

export const share = {
  pfdebug: {
    message:
      "This is a 15-minute self-check for heel pain — it works out what's actually driving it and gives you three exercises. Free, no signup. pfdebug.com",
    prompt:
      "Someone you know is quietly limping through their mornings right now. Send them the check.",
    prevalence:
      "Roughly 1 in 10 people get plantar heel pain at some point in their life.",
    button: "Share pfdebug",
    copied: "Copied",
    copy_link: "Copy message",
  },
  myPlan: {
    button: "Share my plan",
    label: "This link contains your results.",
    copied: "Link copied",
  },
} as const;

// ---------------------------------------------------------------------------
// Print sheet
// ---------------------------------------------------------------------------

export const printSheet = {
  button: "Print my exercises",
  retestOn: "Retest on: ____",
  footer: "Know someone with morning heel pain? pfdebug.com",
} as const;

// ---------------------------------------------------------------------------
// Legal / disclaimer (footer + /legal)
// ---------------------------------------------------------------------------

export const legal = {
  disclaimer:
    "pfdebug is an educational self-check, not a medical diagnosis or treatment. It doesn't replace a qualified clinician. The exercises are widely recommended and gentle, but if anything causes sharp or worsening pain, stop and see a professional. If you have any of the warning signs we ask about, see a clinician before starting.",
} as const;

// ---------------------------------------------------------------------------
// Standalone test explainers (`/tests/*`) — SEO / education (BUILD.md §3, §9)
// ---------------------------------------------------------------------------

/**
 * Prose for the three standalone test-explainer pages. `common` is the shared
 * chrome the reusable TestPage layout renders (kicker, safety note, funnel CTA,
 * sibling cross-links); each test key holds that page's authored educational
 * copy. New voice-matched prose (this page's copy is not in pfdebug-copy.md),
 * kept here so a later localization pass touches one file (BUILD.md §10).
 *
 * The step-by-step test technique is NOT duplicated here — the explainers
 * reuse `step2.instructions` verbatim.
 */
export const testPages = {
  common: {
    /** Eyebrow above every test-page H1. */
    kicker: "Self-check",
    /** Safety framing — calm, never the referral-only --stop red. */
    selfCheck:
      "This is a self-check, not a diagnosis. It shows how one part of your foot and ankle moves — it doesn't replace a clinician. If a movement is sharply painful, stop.",
    /** Lead-in to the funnel CTA that sends the reader into the full flow. */
    ctaLead:
      "One test on its own only tells you so much. The full check runs this alongside the others, works out which factors are most likely driving your heel pain, and turns them into a short plan.",
    cta: "Run the full check",
    ctaHref: "/assessment",
    relatedTitle: "The other self-checks",
    /** Registry of the sibling pages, for cross-linking. */
    pages: {
      "knee-to-wall": {
        href: "/tests/knee-to-wall",
        label: "Knee-to-wall test",
        blurb: "How far your ankle bends forward.",
      },
      "heel-raise": {
        href: "/tests/heel-raise",
        label: "Single-leg heel-raise test",
        blurb: "How much your calf and foot can lift.",
      },
      "wet-footprint": {
        href: "/tests/wet-footprint",
        label: "Wet-footprint test",
        blurb: "The shape of your arch under load.",
      },
    },
  },

  kneeToWall: {
    slug: "knee-to-wall",
    title: "Knee-to-wall test: the ankle mobility test for plantar fasciitis",
    description:
      "How to do the knee-to-wall test at home and read the result — the wall test for ankle dorsiflexion, why a stiff ankle feeds plantar fasciitis, and what under 10 cm means.",
    heading: "The knee-to-wall test",
    lede: "The knee-to-wall test measures how far your ankle bends forward — its dorsiflexion range. It needs a wall and about two minutes, and it's one of the movement tests behind your plantar fasciitis self-check.",
    illustration: {
      caption: "Knee-to-wall: heel down, knee driving forward to touch the wall.",
      alt: "A figure facing a wall, one foot forward, bending the knee to touch the wall while the heel stays flat on the floor.",
    },
    measures: {
      title: "What it measures",
      body: [
        "With every step, your shin travels forward over your planted foot. That movement is ankle dorsiflexion, and the knee-to-wall test puts a number on how much of it you have.",
        "It matters for heel pain because of what a stiff ankle makes the rest of the foot do. When the ankle can't bend far enough, the foot flattens to make up the difference — and that flattening overstretches the fascia along the bottom of your foot, a little more on every step. Restricted ankle dorsiflexion is one of the factors linked to plantar heel pain in the research.",
      ],
    },
    how: {
      title: "How to do it",
      helper:
        "Measure from the tip of your big toe to the wall in a straight line, and test both feet. A gap between the two sides tells you as much as the number itself.",
    },
    result: {
      title: "What your number means",
      threshold:
        "Under about **10 cm** — roughly 4 inches — counts as tight. So does a gap of **2 cm or more** between your two feet, even when both clear 10 cm. Past that, with the sides even, your ankle range isn't the thing holding you back.",
      endfeelLead:
        "The number is only half of it. What you *feel* at the farthest position tells you why the ankle stops — and the two reasons need different fixes.",
      stretch: {
        label: "A stretch behind the ankle",
        body: "A pull in your calf or the back of your ankle points to soft-tissue tightness. That's the trainable kind — the same knee-to-wall movement, done slowly as an exercise, loosens it over a few weeks.",
      },
      pinch: {
        label: "A pinch at the front",
        body: "A pinch or block at the *front* of the ankle, where it folds, points to a restriction in the joint itself rather than a tight muscle. That kind responds to hands-on care far better than to stretching, so it's worth a single visit to a physiotherapist or podiatrist.",
      },
      endfeelTail:
        "This is the one thing the number alone can miss, so notice it while you test.",
    },
  },

  heelRaise: {
    slug: "heel-raise",
    title: "Single-leg heel raise test: the calf strength test for plantar fasciitis",
    description:
      "How to do the single-leg heel raise test at home and read the result — the calf strength test for plantar fasciitis, the reps-by-age benchmark, and what a side-to-side gap means.",
    heading: "The single-leg heel-raise test",
    lede: "The single-leg heel-raise test counts how many times you can rise onto the ball of one foot — a measure of your calf and foot's plantarflexion endurance. It needs a wall for balance and a few minutes, and it's one of the movement tests behind your plantar fasciitis self-check.",
    illustration: {
      caption: "Single-leg heel raise: rise onto the ball of the foot, lower slowly.",
      alt: "A figure standing on one foot, fingertips on a wall for balance, rising onto the ball of the foot.",
    },
    measures: {
      title: "What it measures",
      body: [
        "Each time you push off a step, your calf and the small muscles of your foot lift your whole body weight up through the ball of the foot. The single-leg heel raise counts how many times you can do that on one leg before the muscle fatigues — your plantarflexion endurance, strength and stamina together.",
        "It matters for heel pain because that same system is what shields the fascia along the bottom of your foot. A strong calf and a foot that can carry load absorb the forces of walking and running, so less of it reaches the fascia. When the calf tires early, the fascia takes more than its share on every step — and an overloaded fascia is what plantar fasciitis is. A calf that fatigues quickly is one of the factors linked to plantar heel pain in the research.",
      ],
    },
    how: {
      title: "How to do it",
      sequence:
        "You test your good side first, rest two minutes, then the painful side — the rest keeps the two counts comparable. If the painful side is too sore to test today, skip it and retest once the flare settles. A bad day doesn't spoil the result; it just moves that one number to later.",
    },
    result: {
      title: "What your number means",
      benchmarkLead:
        "Two things make your number meaningful: how it stacks up against a rough benchmark for your age, and how your two sides compare to each other. Muscle endurance falls with age, so the benchmark falls too. As a floor to clear on one leg:",
      benchmarkCaption: "Single-leg heel raises to clear, by age",
      benchmark: [
        { age: "Under 40", reps: 20 },
        { age: "40–54", reps: 16 },
        { age: "55–69", reps: 12 },
        { age: "70+", reps: 8 },
      ],
      asymmetry:
        "The comparison between your two sides is often the clearer signal. If your painful side comes in **20% or more** below your good side — say 12 reps against 15 — that gap points to a real strength deficit on the sore foot, even when the raw count looks respectable. It's the single most useful thing this test tells you.",
      limitsLead: "Two honest limits come with the test:",
      bilateral: {
        label: "Both heels affected",
        body: "With both sides painful there's no healthy side to measure against, so the side-to-side comparison doesn't apply. Lean on the age benchmark instead, and read it gently — a self-test can't confirm a deficit cleanly when both sides are affected. Once one side settles enough to test properly, a side-to-side retest gives a clearer read.",
      },
      flare: {
        label: "Pain stopped you early",
        body: "If pain cut you off before the muscle actually tired, the count reflects the flare, not your strength. That's not a failure — it's information. Skip that side for now and retest once the pain settles, when the number will mean what it should.",
      },
      track:
        "The real value of this test is watching it move. Note your reps and retest every few weeks. Watching the number climb is how you'll know the work is paying off — often before the pain itself changes.",
    },
  },

  wetFootprint: {
    slug: "wet-footprint",
    title: "Wet footprint test: the arch type test for flat feet and high arches",
    description:
      "How to do the wet-footprint test at home and read the result — the arch type test for flat feet, a normal arch, and high arches, and why your arch shape changes how load reaches the plantar fascia.",
    heading: "The wet-footprint test",
    lede: "The wet-footprint test reads the shape of your arch under load — flat, normal, or high — from the mark your wet sole leaves on a dry floor. It takes a splash of water and about a minute, and it's one of the checks behind your plantar fasciitis self-check.",
    illustration: {
      caption:
        "Wet footprint: the mark a wet sole leaves on a tile — a full print, a normal curve, or a thin strip.",
      alt: "Three wet footprints on a tile side by side: a full flat print, a print with a clear curve missing on the inner side, and a thin strip linking the ball and heel.",
    },
    measures: {
      title: "What it measures",
      body: [
        "The arch is the curve on the inner side of your foot, and it changes shape the moment you put weight through it. The wet-footprint test catches that: the more of your sole that presses down and prints, the more your arch flattens under load. A full print, a clear curve, or a thin strip each point to a different arch type.",
        "It matters for heel pain because arch shape changes how force lands on the fascia along the bottom of your foot. A foot that flattens under load stretches that tissue a little further on every step; a high, stiff arch absorbs less shock, so more of each impact reaches it. This is a contributing factor, not a verdict — plenty of people with either shape never get heel pain. You can't change your foot's shape, but you can support it, and that's most of what the result is for.",
      ],
    },
    how: {
      title: "How to do it",
      helper:
        "Put your full weight through the foot as you step — a light touch won't press the arch down the way walking does. Test both feet; they can differ.",
    },
    result: {
      title: "What your footprint shows",
      lead: "Your print matches one of three shapes. A normal arch is common and needs nothing — only the flatter and higher shapes point to support worth adding.",
      types: {
        flat: {
          body: "The arch flattens under load, which stretches the fascia a little further on each step. A supportive shoe with a firm heel and some arch support does most of the work.",
        },
        neutral: {
          body: "A normal arch, doing its job — nothing to fix here. Well-fitting, supportive shoes are all it asks for; your footprint isn't what's driving your heel pain.",
        },
        high: {
          body: "A high, stiff arch absorbs less shock, so more of each step's impact reaches the fascia. A cushioned, supportive shoe helps it share the load.",
        },
      },
      insole:
        "For a flatter or higher arch, an off-the-shelf arch-support insole is a reasonable next step — no need for custom orthotics to start. If the simple version doesn't help in a few weeks, a podiatrist can say whether custom is worth it.",
      shoeWear:
        "Your shoes give a second read for free: from behind, heavier wear on the inner edge points the same way as a flattening arch. The self-check collects both — footprint and shoe wear — because together they give a steadier picture than either alone.",
    },
  },
} as const;
