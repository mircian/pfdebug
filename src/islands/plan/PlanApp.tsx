/**
 * /plan — the canonical result page. Decodes the `#v1.<payload>` fragment
 * (the source of truth for a result), runs the engine, and renders the
 * route's copy verbatim. Mirrors the payload to pfdebug.lastResult so the
 * landing page can welcome the user back.
 */
import { useEffect, useState } from "preact/hooks";
import { Md, MdP } from "~/components/Md";
import {
  basePlan,
  doesntMatch,
  lessTypical,
  noClearDriver,
  overload,
  printSheet,
  referral,
  retest as retestCopy,
} from "~/copy/copy";
import { evaluate, type Input, type Result } from "~/engine";
import { footwearReplace } from "~/copy/copy";
import {
  completeInput,
  decodePayload,
  isRenderable,
  type PayloadV1,
} from "~/lib/payload";
import { setLastResult } from "~/lib/storage";
import { displayLength, type Units } from "~/lib/units";
import { useUnits } from "~/lib/useUnits";
import {
  AlsoWorthBlock,
  CapacityHeadline,
  Exercise1Block,
  Exercise2Block,
  Exercise3Block,
  FootwearNoteBlock,
  FootwearReplaceBlock,
  JointReferralHeadline,
  LoadManagementBlock,
  PostureBlock,
  SkippedCapacityNote,
  WeightBlock,
} from "./blocks";
import { HeelRaiseGauge, KneeToWallGauge } from "./Gauges";
import PrintSheet from "./PrintSheet";
import ShareBlock from "./ShareBlock";

function NoResult() {
  return (
    <div>
      <h1>No result to show yet.</h1>
      <p>
        This page renders a result from its link. If someone sent you here,
        double-check the full link was copied. Or run the check yourself — it
        takes about 15 minutes.
      </p>
      <div class="stack-actions">
        <a class="btn btn--primary" href="/assessment">
          Start the check
        </a>
      </div>
    </div>
  );
}

function Referral({ input }: { input: Input }) {
  // The one page --stop appears on. No gauges, no plan, no share.
  return (
    <div class="referral">
      <h1>{referral.title}</h1>
      <p>{referral.body}</p>
      <div class="card">
        <MdP text={referral.whatToDo(input.redFlags)} />
      </div>
      <p>{referral.closing}</p>
    </div>
  );
}

function DoesntMatch({ input }: { input: Input }) {
  return (
    <div>
      <h1>{doesntMatch.title}</h1>
      <MdP text={doesntMatch.body(input.painLocation)} />
    </div>
  );
}

function ImprovementLine({
  input,
  payload,
}: {
  input: Input;
  payload: PayloadV1;
}) {
  const prev = payload.prev;
  if (!prev || !("painfulReps" in prev.heelRaise)) return null;
  if (!("painfulReps" in input.heelRaise)) return null;

  const oldReps = prev.heelRaise.painfulReps;
  const newReps = input.heelRaise.painfulReps;
  if (newReps <= oldReps) return null;

  let weeks = 1;
  if (prev.date && payload.date) {
    const ms = new Date(payload.date).getTime() - new Date(prev.date).getTime();
    weeks = Math.max(1, Math.round(ms / (7 * 24 * 3600 * 1000)));
  }
  const side =
    input.affectedFoot === "both"
      ? "Right"
      : input.affectedFoot === "right"
        ? "Right"
        : "Left";
  return (
    <p class="callout">
      <Md text={retestCopy.improvement(side, oldReps, newReps, weeks)} />
    </p>
  );
}

function OverloadIntro({
  input,
  result,
  units,
}: {
  input: Input;
  result: Result;
  units: Units;
}) {
  const hr = input.heelRaise;
  const skipped = "painfulSkipped" in hr;
  const calf = skipped
    ? overload.calfGoodSideOnly(hr.goodReps)
    : overload.calfHeldUp(hr.painfulReps, hr.goodReps);
  const minCm = Math.min(input.kneeToWall.left_cm, input.kneeToWall.right_cm);
  const ankle = overload.ankleBendsFine(displayLength(minCm, units).text);
  const hasSpike = (result.flags?.loadSpike.set ?? false) && input.loadChanges.length > 0;
  const footwearFlag = result.flags?.footwear.set ?? false;
  // Flagged footwear didn't pass the shoe check — the clean line must not
  // claim it did.
  const archShoes = footwearFlag ? overload.archOnlyClean : overload.archShoesClean;

  return (
    <>
      <h1>{overload.title}</h1>
      <p>{overload.reassurance}</p>
      <MdP text={overload.testsClean(calf, ankle, archShoes)} />
      <MdP
        text={
          hasSpike
            ? overload.whatTippedIt(input.loadChanges, input.duration)
            : overload.whatTippedItFootwear
        }
      />
      <p>{overload.bestVersion}</p>
      <MdP
        text={
          hasSpike ? overload.whatToDoNow(input.loadChanges) : overload.whatToDoNowFootwear
        }
      />
      {hasSpike && footwearFlag && (
        // Footwear also flagged: "replace your worn pair" is elevated into
        // "what to do now" (copy doc, Overload).
        <MdP text={footwearReplace.body} />
      )}
      <p>{overload.notAgain}</p>
    </>
  );
}

function NoDriverIntro({ input, units }: { input: Input; units: Units }) {
  const hr = input.heelRaise;
  const calfReps = "painfulReps" in hr ? hr.painfulReps : hr.goodReps;
  const minCm = Math.min(input.kneeToWall.left_cm, input.kneeToWall.right_cm);
  const ankle = displayLength(minCm, units).text;
  return (
    <>
      <h1>{noClearDriver.title}</h1>
      <MdP text={noClearDriver.body(calfReps, ankle)} />
      <MdP text={noClearDriver.honest} />
      <p>{noClearDriver.stillDo}</p>
    </>
  );
}

function PlanBody({
  payload,
  input,
  result,
  units,
  planUrl,
}: {
  payload: PayloadV1;
  input: Input;
  result: Result;
  units: Units;
  planUrl: string;
}) {
  const route = result.route;
  const headline = result.headlineFactor ?? null;
  const modules = (result.modulesInFull ?? []).filter(
    (m) => !(m === "exercise2" && headline === "mobility_soft_tissue"),
  );
  const skippedNote = result.notes?.includes("skipped_capacity") ?? false;

  return (
    <div>
      <div class="no-print">
        {result.hedged && (
          <p class="callout">
            <Md text={lessTypical.body} />
          </p>
        )}

        {route === "D2_composed" && (
          <>
            <h1>{basePlan.title}</h1>
            <p>{basePlan.intro}</p>
            <MdP text={basePlan.rule} />
          </>
        )}
        {route === "D5" && <OverloadIntro input={input} result={result} units={units} />}
        {route === "D4" && <NoDriverIntro input={input} units={units} />}

        <div class="ticks" role="presentation"></div>

        <KneeToWallGauge input={input} units={units} prev={payload.prev} />
        <HeelRaiseGauge input={input} prev={payload.prev} />
        <ImprovementLine input={input} payload={payload} />

        {skippedNote && <SkippedCapacityNote input={input} />}

        {route === "D2_composed" && headline === "capacity" && (
          <CapacityHeadline input={input} result={result} />
        )}
        {route === "D2_composed" && headline === "mobility_soft_tissue" && (
          <Exercise2Block input={input} result={result} units={units} asHeadline={true} />
        )}
        {route === "D2_composed" && headline === "mobility_joint_referral" && (
          <JointReferralHeadline input={input} result={result} units={units} />
        )}

        <Exercise1Block />
        <Exercise3Block />
        <FootwearNoteBlock />

        {modules.map((m) => {
          switch (m) {
            case "exercise2":
              return (
                <Exercise2Block
                  key={m}
                  input={input}
                  result={result}
                  units={units}
                  asHeadline={false}
                />
              );
            case "load_management":
              return <LoadManagementBlock key={m} input={input} result={result} />;
            case "posture_insole":
              return <PostureBlock key={m} input={input} />;
            case "footwear_replace":
              return <FootwearReplaceBlock key={m} />;
            case "weight":
              return <WeightBlock key={m} />;
          }
        })}

        {/* Weight attaches at whichever route is reached — on D5/D4 it isn't
            part of the composed module list, so render it directly. */}
        {route !== "D2_composed" && result.flags?.weightModule && <WeightBlock />}

        <AlsoWorthBlock items={result.alsoWorthAddressing ?? []} input={input} />

        <div class="stack-actions">
          <button type="button" class="btn" onClick={() => window.print()}>
            {printSheet.button}
          </button>
        </div>

        <ShareBlock planUrl={planUrl} input={input} units={units} prev={payload.prev} />
      </div>

      <PrintSheet
        input={input}
        result={result}
        planUrl={planUrl}
        units={units}
        prev={payload.prev}
      />
    </div>
  );
}

export default function PlanApp() {
  const units = useUnits();
  const [fragment, setFragment] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const read = () => {
      setFragment(window.location.hash.replace(/^#/, "") || null);
      setReady(true);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);

  const decoded = fragment ? decodePayload(fragment) : null;
  const payload = decoded && isRenderable(decoded.input) ? decoded : null;

  // Mirror the last-viewed result for the returning-visitor landing state.
  useEffect(() => {
    if (payload && fragment) setLastResult(fragment);
  }, [fragment]);

  if (!ready) return null;
  if (!payload) return <NoResult />;

  const input = completeInput(payload.input);
  const result = evaluate(input);
  const planUrl = window.location.href;

  if (result.route === "D0") return <Referral input={input} />;
  if (result.route === "D0_soft") return <DoesntMatch input={input} />;

  return (
    <PlanBody
      payload={payload}
      input={input}
      result={result}
      units={units}
      planUrl={planUrl}
    />
  );
}
