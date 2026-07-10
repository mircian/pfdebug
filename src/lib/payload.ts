/**
 * Result payload codec — the URL fragment is the source of truth for a result.
 *
 * `/plan#v1.<payload>` carries the complete engine input (canonical metric),
 * compressed with lz-string. Fragments are never sent to the server, never
 * hit logs, never leak via Referer — that keeps a health result URL private
 * by architecture (BUILD.md §4).
 *
 * The leading `v1.` schema tag lets the format evolve.
 */

// lz-string is CommonJS; Node ESM (Astro's SSR page generation) can't use
// its named exports, so destructure from the default export.
import lz from "lz-string";
const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = lz;
import type { HeelRaise, Input } from "~/engine";

const VERSION_TAG = "v1.";

/** Prior test scores carried into a retest result so /plan can render deltas. */
export interface RetestBaseline {
  kneeToWall: { left_cm: number; right_cm: number };
  heelRaise: HeelRaise;
  /** ISO date (yyyy-mm-dd) the baseline result was produced, for the
   *  "[old] → [new] reps in [weeks] weeks" line. */
  date?: string;
}

/**
 * Answers may be partial: the wizard short-circuits to /plan after Step 0
 * when the red-flag gate (D0) or fit routing (D0_soft) fires, before the
 * story/physical-test fields exist.
 */
export type WizardAnswers = Partial<Input> &
  Pick<Input, "painLocation" | "worstWhen" | "thumbPress" | "redFlags">;

export interface PayloadV1 {
  input: WizardAnswers;
  /** Present when this result came from `?mode=retest`. */
  prev?: RetestBaseline;
  /** ISO date (yyyy-mm-dd) this result was produced. */
  date?: string;
}

export function encodePayload(payload: PayloadV1): string {
  return VERSION_TAG + compressToEncodedURIComponent(JSON.stringify(payload));
}

/** Returns null for anything that doesn't decode to a v1 payload. */
export function decodePayload(fragment: string): PayloadV1 | null {
  const raw = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  if (!raw.startsWith(VERSION_TAG)) return null;
  try {
    const json = decompressFromEncodedURIComponent(raw.slice(VERSION_TAG.length));
    if (!json) return null;
    const parsed: unknown = JSON.parse(json);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as PayloadV1).input !== "object" ||
      (parsed as PayloadV1).input === null ||
      !Array.isArray((parsed as PayloadV1).input.redFlags)
    ) {
      return null;
    }
    const input = (parsed as PayloadV1).input;
    // Numbers must be real numbers — a hand-crafted fragment must not push
    // NaN/strings into gauges or the engine.
    if (input.kneeToWall !== undefined) {
      if (
        !Number.isFinite(input.kneeToWall.left_cm) ||
        !Number.isFinite(input.kneeToWall.right_cm)
      ) {
        return null;
      }
    }
    if (input.heelRaise !== undefined) {
      const hr = input.heelRaise;
      if (!Number.isFinite(hr.goodReps)) return null;
      if (!("painfulSkipped" in hr) && !Number.isFinite(hr.painfulReps)) return null;
    }
    return parsed as PayloadV1;
  } catch {
    return null;
  }
}

/**
 * A payload is renderable if the intake gates fire (D0/D0_soft need only
 * Step 0) or every field the engine reads is actually present. Without this,
 * a crafted partial payload that doesn't gate would render a plan computed
 * from completeInput()'s inert defaults (0 cm / 0 reps).
 */
export function isRenderable(answers: WizardAnswers): boolean {
  if (answers.redFlags.length > 0) return true; // gates at C0
  const complete =
    answers.duration !== undefined &&
    answers.loadChanges !== undefined &&
    answers.onFeet !== undefined &&
    answers.bmiBand !== undefined &&
    answers.ageBand !== undefined &&
    answers.affectedFoot !== undefined &&
    answers.kneeToWall !== undefined &&
    answers.heelRaise !== undefined &&
    answers.footprint !== undefined &&
    answers.shoes !== undefined;
  if (complete) return true;
  // Partial and unflagged: only renderable if C1 soft-declines it.
  if (answers.painLocation === "back_of_heel") return true;
  let fit = 0;
  if (answers.painLocation === "inner_heel" || answers.painLocation === "center_heel") fit++;
  if (
    answers.worstWhen.includes("morning_first_steps") ||
    answers.worstWhen.includes("after_sitting")
  ) {
    fit++;
  }
  if (answers.worstWhen.includes("eases_moving")) fit++;
  if (answers.thumbPress === "sharp_that_is_it") fit++;
  return fit === 0;
}

/**
 * Fill unanswered fields with inert defaults so a gated partial payload can
 * be passed to `evaluate()`. Only ever reached for D0/D0_soft payloads —
 * the engine's C0/C1 gates return before any of these fields are read, so
 * the defaults never influence a route and are never rendered (referral
 * pages show no gauges).
 */
export function completeInput(answers: WizardAnswers): Input {
  return {
    duration: "lt_6wk",
    loadChanges: [],
    onFeet: "mix",
    bmiBand: "declined",
    ageBand: "under_40",
    affectedFoot: "left",
    kneeToWall: {
      left_cm: 0,
      right_cm: 0,
      sensationLeft: "stretch",
      sensationRight: "stretch",
    },
    heelRaise: { goodReps: 0, painfulReps: 0 },
    footprint: "neutral",
    shoes: { innerEdgeWear: false, deadCushion: false },
    ...answers,
  };
}
