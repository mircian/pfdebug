/**
 * The assessment wizard — one screen per question/test, Steps 0–4.
 *
 * Gates run on intake, before the physical tests (engine spec §3): any red
 * flag ⇒ finish immediately (D0); back-of-heel pain or fitScore 0 ⇒ finish
 * (D0_soft). The engine itself re-derives the route from the payload on
 * /plan — the wizard never computes a result, it only collects input.
 *
 * `?mode=retest` pre-fills prior answers from pfdebug.lastResult and carries
 * the old test scores as a baseline so /plan can render deltas.
 */
import { useEffect, useMemo, useState } from "preact/hooks";
import { MdP } from "~/components/Md";
import ProgressRuler from "~/components/ProgressRuler";
import {
  MultiChoice,
  SingleChoice,
  WizardActions,
  type Option,
} from "~/components/QuestionScreens";
import { persistenceNotice, step0, step1, step4 } from "~/copy/copy";
import type {
  AgeBand,
  BmiBand,
  Duration,
  Foot,
  HeelRaise,
  Input,
  LoadChange,
  OnFeet,
  PainLocation,
  RedFlag,
  ThumbPress,
  WorstWhen,
} from "~/engine";
import {
  decodePayload,
  encodePayload,
  type RetestBaseline,
  type WizardAnswers,
} from "~/lib/payload";
import { getLastResult, setLastResult } from "~/lib/storage";
import { useUnits } from "~/lib/useUnits";
import HeelRaiseScreen from "./HeelRaiseScreen";
import KneeToWallScreen, { type KneeToWallDraft } from "./KneeToWallScreen";

type ScreenId =
  | "intro"
  | "q1"
  | "q2"
  | "q3"
  | "q4"
  | "q5"
  | "q6"
  | "q7"
  | "q9"
  | "q10"
  | "q11"
  | "ktw"
  | "hr"
  | "footprint"
  | "shoes"
  | "save";

const FLOW: ScreenId[] = [
  "intro",
  "q1",
  "q2",
  "q3",
  "q4",
  "q5",
  "q6",
  "q7",
  "q9",
  "q10",
  "q11",
  "ktw",
  "hr",
  "footprint",
  "shoes",
  "save",
];

/** Ruler labels — left reads the step, right names the surface (matching the
 *  hi-fi mocks: "STEP 2 OF 4" · "KNEE-TO-WALL"). */
const PROGRESS_LABELS: Record<ScreenId, { left: string; right: string }> = {
  intro: { left: "STEP 0 OF 4", right: "BEFORE WE START" },
  q1: { left: "STEP 0 OF 4", right: "QUESTION 1 / 4" },
  q2: { left: "STEP 0 OF 4", right: "QUESTION 2 / 4" },
  q3: { left: "STEP 0 OF 4", right: "QUESTION 3 / 4" },
  q4: { left: "STEP 0 OF 4", right: "QUESTION 4 / 4" },
  q5: { left: "STEP 1 OF 4", right: "YOUR STORY" },
  q6: { left: "STEP 1 OF 4", right: "YOUR STORY" },
  q7: { left: "STEP 1 OF 4", right: "YOUR STORY" },
  q9: { left: "STEP 1 OF 4", right: "YOUR STORY" },
  q10: { left: "STEP 1 OF 4", right: "YOUR STORY" },
  q11: { left: "STEP 1 OF 4", right: "YOUR STORY" },
  ktw: { left: "STEP 2 OF 4", right: "KNEE-TO-WALL" },
  hr: { left: "STEP 3 OF 4", right: "HEEL RAISE" },
  footprint: { left: "STEP 4 OF 4", right: "FOOTPRINT" },
  shoes: { left: "STEP 4 OF 4", right: "FOOTWEAR" },
  save: { left: "ALL STEPS DONE", right: "100%" },
};

/** Human step label for the progressbar's accessible name. */
const STEP_TITLES: Record<ScreenId, string> = {
  intro: "Before we start",
  q1: "Before we start",
  q2: "Before we start",
  q3: "Before we start",
  q4: "Before we start",
  q5: "Your story",
  q6: "Your story",
  q7: "Your story",
  q9: "Your story",
  q10: "Your story",
  q11: "Your story",
  ktw: "Knee-to-wall test",
  hr: "Single-leg heel raise",
  footprint: "Foot & footwear",
  shoes: "Foot & footwear",
  save: "Done",
};

interface Draft {
  painLocation: PainLocation | null;
  worstWhen: WorstWhen[];
  thumbPress: ThumbPress | null;
  redFlags: RedFlag[];
  redFlagsNone: boolean;
  duration: Duration | null;
  loadChanges: LoadChange[];
  loadNone: boolean;
  onFeet: OnFeet | null;
  bmiBand: BmiBand | null;
  ageBand: AgeBand | null;
  affectedFoot: Foot | null;
  kneeToWall: KneeToWallDraft;
  heelRaise: HeelRaise | null;
  footprint: Input["footprint"] | null;
  innerEdgeWear: "yes" | "no" | "even" | null;
  deadCushion: "yes" | "no" | null;
}

const EMPTY: Draft = {
  painLocation: null,
  worstWhen: [],
  thumbPress: null,
  redFlags: [],
  redFlagsNone: false,
  duration: null,
  loadChanges: [],
  loadNone: false,
  onFeet: null,
  bmiBand: null,
  ageBand: null,
  affectedFoot: null,
  kneeToWall: {
    left_cm: null,
    right_cm: null,
    sensationLeft: null,
    sensationRight: null,
  },
  heelRaise: null,
  footprint: null,
  innerEdgeWear: null,
  deadCushion: null,
};

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

/** C1 fit score, mirrored from the engine for the in-product short-circuit. */
function fitScore(d: Draft): number {
  let score = 0;
  if (d.painLocation === "inner_heel" || d.painLocation === "center_heel") score++;
  if (d.worstWhen.includes("morning_first_steps") || d.worstWhen.includes("after_sitting"))
    score++;
  if (d.worstWhen.includes("eases_moving")) score++;
  if (d.thumbPress === "sharp_that_is_it") score++;
  return score;
}

function draftToAnswers(d: Draft): WizardAnswers {
  const answers: WizardAnswers = {
    painLocation: d.painLocation ?? "other",
    worstWhen: d.worstWhen,
    thumbPress: d.thumbPress ?? "nothing",
    redFlags: d.redFlags,
  };
  if (d.duration) answers.duration = d.duration;
  answers.loadChanges = d.loadChanges;
  if (d.onFeet) answers.onFeet = d.onFeet;
  if (d.bmiBand) answers.bmiBand = d.bmiBand;
  if (d.ageBand) answers.ageBand = d.ageBand;
  if (d.affectedFoot) answers.affectedFoot = d.affectedFoot;
  if (
    d.kneeToWall.left_cm !== null &&
    d.kneeToWall.right_cm !== null &&
    d.kneeToWall.sensationLeft !== null &&
    d.kneeToWall.sensationRight !== null
  ) {
    answers.kneeToWall = {
      left_cm: d.kneeToWall.left_cm,
      right_cm: d.kneeToWall.right_cm,
      sensationLeft: d.kneeToWall.sensationLeft,
      sensationRight: d.kneeToWall.sensationRight,
    };
  }
  if (d.heelRaise) answers.heelRaise = d.heelRaise;
  if (d.footprint) answers.footprint = d.footprint;
  if (d.innerEdgeWear !== null && d.deadCushion !== null) {
    answers.shoes = {
      innerEdgeWear: d.innerEdgeWear === "yes",
      deadCushion: d.deadCushion === "yes",
    };
  }
  return answers;
}

export default function Wizard() {
  const units = useUnits();
  const [screen, setScreen] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [prev, setPrev] = useState<RetestBaseline | undefined>(undefined);
  const [payloadStr, setPayloadStr] = useState<string | null>(null);

  // Retest mode: pre-fill prior answers + carry old scores as the baseline.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("mode") !== "retest") return;
    const last = getLastResult();
    if (!last) return;
    const payload = decodePayload(last);
    if (!payload) return;
    const input = payload.input;
    setDraft((d) => ({
      ...d,
      painLocation: input.painLocation ?? null,
      worstWhen: input.worstWhen ?? [],
      thumbPress: input.thumbPress ?? null,
      redFlags: input.redFlags ?? [],
      redFlagsNone: (input.redFlags ?? []).length === 0,
      duration: input.duration ?? null,
      loadChanges: input.loadChanges ?? [],
      loadNone: (input.loadChanges ?? []).length === 0 && input.loadChanges !== undefined,
      onFeet: input.onFeet ?? null,
      bmiBand: input.bmiBand ?? null,
      ageBand: input.ageBand ?? null,
      affectedFoot: input.affectedFoot ?? null,
      footprint: input.footprint ?? null,
      innerEdgeWear:
        input.shoes === undefined ? null : input.shoes.innerEdgeWear ? "yes" : "no",
      deadCushion:
        input.shoes === undefined ? null : input.shoes.deadCushion ? "yes" : "no",
    }));
    if (input.kneeToWall && input.heelRaise) {
      setPrev({
        kneeToWall: {
          left_cm: input.kneeToWall.left_cm,
          right_cm: input.kneeToWall.right_cm,
        },
        heelRaise: input.heelRaise,
        date: payload.date,
      });
    }
  }, []);

  const current = FLOW[screen]!;

  function finish(d: Draft) {
    const payload = encodePayload({
      input: draftToAnswers(d),
      ...(prev ? { prev } : {}),
      date: todayIso(),
    });
    setPayloadStr(payload);
    setLastResult(payload);
    setScreen(FLOW.indexOf("save"));
    window.scrollTo(0, 0);
  }

  function next() {
    setScreen((s) => Math.min(s + 1, FLOW.length - 1));
    window.scrollTo(0, 0);
  }

  function back() {
    setScreen((s) => Math.max(s - 1, 0));
    window.scrollTo(0, 0);
  }

  /** After Step 0 (Q4) — the safety gate and fit routing short-circuit. */
  function continueFromQ4() {
    if (draft.redFlags.length > 0) {
      finish(draft); // D0 — referral; no physical tests
      return;
    }
    if (draft.painLocation === "back_of_heel" || fitScore(draft) === 0) {
      finish(draft); // D0_soft — doesn't match the pattern
      return;
    }
    next();
  }

  const progress = PROGRESS_LABELS[current];

  const body = useMemo(() => {
    switch (current) {
      case "intro":
        return (
          <div>
            <div class="intro-mark" aria-hidden="true" />
            <h2>{step0.title}</h2>
            <MdP text={step0.intro} class="wizard-lede" />
            <WizardActions onContinue={next} continueLabel="Begin" />
          </div>
        );

      case "q1":
        return (
          <SingleChoice
            question={step0.q1.question}
            options={step0.q1.options as readonly Option<PainLocation>[]}
            value={draft.painLocation}
            onChange={(v) => setDraft({ ...draft, painLocation: v })}
            onContinue={next}
            onBack={back}
          />
        );

      case "q2":
        return (
          <MultiChoice
            question={step0.q2.question}
            options={step0.q2.options as readonly Option<WorstWhen>[]}
            values={draft.worstWhen}
            noneSelected={false}
            onChange={(values) => setDraft({ ...draft, worstWhen: values })}
            onContinue={next}
            onBack={back}
          />
        );

      case "q3":
        return (
          <SingleChoice
            question={step0.q3.question}
            options={step0.q3.options as readonly Option<ThumbPress>[]}
            value={draft.thumbPress}
            onChange={(v) => setDraft({ ...draft, thumbPress: v })}
            onContinue={next}
            onBack={back}
          />
        );

      case "q4":
        return (
          <MultiChoice
            question={step0.q4.question}
            note={step0.q4.note}
            options={step0.q4.options as readonly Option<RedFlag>[]}
            noneLabel={step0.q4.none_label}
            values={draft.redFlags}
            noneSelected={draft.redFlagsNone}
            onChange={(values, none) =>
              setDraft({ ...draft, redFlags: values, redFlagsNone: none })
            }
            onContinue={continueFromQ4}
            onBack={back}
          />
        );

      case "q5":
        return (
          <div>
            <MdP text={step1.intro} class="wizard-lede" />
            <SingleChoice
              question={step1.q5.question}
              options={step1.q5.options as readonly Option<Duration>[]}
              value={draft.duration}
              onChange={(v) => setDraft({ ...draft, duration: v })}
              onContinue={next}
              onBack={back}
            />
          </div>
        );

      case "q6":
        return (
          <MultiChoice
            question={step1.q6.question}
            options={step1.q6.options as readonly Option<LoadChange>[]}
            noneLabel={step1.q6.none_label}
            values={draft.loadChanges}
            noneSelected={draft.loadNone}
            onChange={(values, none) =>
              setDraft({ ...draft, loadChanges: values, loadNone: none })
            }
            onContinue={next}
            onBack={back}
          />
        );

      case "q7":
        return (
          <SingleChoice
            question={step1.q7.question}
            options={step1.q7.options as readonly Option<OnFeet>[]}
            value={draft.onFeet}
            onChange={(v) => setDraft({ ...draft, onFeet: v })}
            onContinue={next}
            onBack={back}
          />
        );

      case "q9":
        return (
          <SingleChoice
            question={step1.q9.question}
            note={step1.q9.note}
            options={step1.q9.options as readonly Option<BmiBand>[]}
            value={draft.bmiBand}
            onChange={(v) => setDraft({ ...draft, bmiBand: v })}
            onContinue={next}
            onBack={back}
          />
        );

      case "q10":
        return (
          <SingleChoice
            question={step1.q10.question}
            options={step1.q10.options as readonly Option<AgeBand>[]}
            value={draft.ageBand}
            onChange={(v) => setDraft({ ...draft, ageBand: v })}
            onContinue={next}
            onBack={back}
          />
        );

      case "q11":
        return (
          <SingleChoice
            question={step1.q11.question}
            options={step1.q11.options as readonly Option<Foot>[]}
            value={draft.affectedFoot}
            onChange={(v) => setDraft({ ...draft, affectedFoot: v })}
            onContinue={next}
            onBack={back}
          />
        );

      case "ktw":
        return (
          <KneeToWallScreen
            units={units}
            draft={draft.kneeToWall}
            prev={prev?.kneeToWall}
            onChange={(kneeToWall) => setDraft({ ...draft, kneeToWall })}
            onContinue={next}
            onBack={back}
          />
        );

      case "hr":
        return (
          <HeelRaiseScreen
            affectedFoot={draft.affectedFoot ?? "left"}
            prev={prev?.heelRaise}
            onDone={(heelRaise) => {
              setDraft({ ...draft, heelRaise });
              next();
            }}
          />
        );

      case "footprint":
        return (
          <div>
            <p>
              <strong>{step4.footprint.label}</strong>
            </p>
            <SingleChoice
              question={step4.footprint.question}
              options={
                step4.footprint.options as readonly Option<Input["footprint"]>[]
              }
              value={draft.footprint}
              onChange={(v) => setDraft({ ...draft, footprint: v })}
              onContinue={next}
              onBack={back}
            />
          </div>
        );

      case "shoes": {
        const done = draft.innerEdgeWear !== null && draft.deadCushion !== null;
        const finished = { ...draft };
        return (
          <div>
            <p>
              <strong>{step4.shoes.label}</strong> {step4.shoes.lead}
            </p>
            <fieldset style="border:0;padding:0;margin:0 0 1rem">
              <legend style="font-weight:600">{step4.shoes.innerWear}</legend>
              {step4.shoes.innerWearOptions.map((o) => (
                <label
                  key={o.value}
                  class={`choice ${draft.innerEdgeWear === o.value ? "choice--selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="innerWear"
                    checked={draft.innerEdgeWear === o.value}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        innerEdgeWear: o.value as Draft["innerEdgeWear"],
                      })
                    }
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </fieldset>
            <fieldset style="border:0;padding:0;margin:0 0 1rem">
              <legend style="font-weight:600">{step4.shoes.deadCushion}</legend>
              {step4.shoes.deadCushionOptions.map((o) => (
                <label
                  key={o.value}
                  class={`choice ${draft.deadCushion === o.value ? "choice--selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="deadCushion"
                    checked={draft.deadCushion === o.value}
                    onChange={() =>
                      setDraft({
                        ...draft,
                        deadCushion: o.value as Draft["deadCushion"],
                      })
                    }
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </fieldset>
            <WizardActions
              onBack={back}
              onContinue={() => finish(finished)}
              continueLabel="Finish"
              disabled={!done}
            />
          </div>
        );
      }

      case "save":
        return (
          <div>
            <div class="done-mark" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24">
                <path
                  d="M5 12.5 L10 17.5 L19 6.5"
                  fill="none"
                  stroke="var(--mark)"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </div>
            <h2>That's everything. Building your plan.</h2>
            <p class="wizard-lede">
              We've run your answers through the engine. Next you'll see your
              movement profile, your gauges, and the exercises matched to your
              numbers.
            </p>
            <div class="note">
              <MdP text={persistenceNotice.body} />
            </div>
            <a
              class="btn btn--primary btn--full"
              href={payloadStr ? `/plan#${payloadStr}` : "/plan"}
            >
              {persistenceNotice.cta} →
            </a>
          </div>
        );
    }
  }, [current, draft, units, prev, payloadStr]);

  return (
    <div>
      <ProgressRuler
        current={screen}
        total={FLOW.length}
        leftLabel={progress.left}
        rightLabel={progress.right}
        ariaLabel={`${STEP_TITLES[current]} — step ${screen + 1} of ${FLOW.length}`}
      />
      {body}
    </div>
  );
}
