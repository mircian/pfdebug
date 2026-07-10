/**
 * Result-page building blocks: base-plan exercises, headline emphasis
 * variants, and the per-flag modules. All wording comes from ~/copy/copy —
 * verbatim, slots filled from the user's own values.
 */
import { Md, MdP } from "~/components/Md";
import {
  alsoWorthAddressing,
  capacityConfirmed,
  capacitySkippedNote,
  capacityUnconfirmedBilateral,
  exercise1,
  exercise2,
  exercise3,
  footwearNote,
  footwearReplace,
  loadManagement,
  mobilityJointHeadline,
  postureModule,
  weightModule as weightCopy,
} from "~/copy/copy";
import {
  heelRaiseFloor,
  KNEE_TO_WALL_THRESHOLD_CM,
  type Input,
  type ModuleId,
  type Result,
  type Side,
} from "~/engine";
import { displayLength, displayThreshold, type Units } from "~/lib/units";

// ---- slot derivations -------------------------------------------------------

function limitedSideOf(input: Input, result: Result): Side {
  return (
    result.flags?.mobility.limitedSide ??
    (input.kneeToWall.right_cm < input.kneeToWall.left_cm ? "right" : "left")
  );
}

function limitedCm(input: Input, result: Result): number {
  const side = limitedSideOf(input, result);
  return side === "left" ? input.kneeToWall.left_cm : input.kneeToWall.right_cm;
}

// ---- base plan ----------------------------------------------------------------

export function Exercise1Block() {
  return (
    <section class="card print-exercise" aria-label={exercise1.title}>
      <h3>
        {exercise1.title} <small class="small">({exercise1.audience})</small>
      </h3>
      <MdP text={exercise1.why} />
      <MdP text={exercise1.how} />
      <MdP text={exercise1.dose} />
      <MdP text={exercise1.feel} />
    </section>
  );
}

export function Exercise3Block() {
  return (
    <section class="card print-exercise" aria-label={exercise3.title}>
      <h3>
        {exercise3.title} <small class="small">({exercise3.audience})</small>
      </h3>
      <MdP text={exercise3.why} />
      <MdP text={exercise3.how} />
      <MdP text={exercise3.dose} />
    </section>
  );
}

export function FootwearNoteBlock() {
  return (
    <section class="callout" aria-label={footwearNote.title}>
      <p>
        <strong>{footwearNote.title}</strong>{" "}
        <small class="small">({footwearNote.audience})</small>
      </p>
      <MdP text={footwearNote.body} />
    </section>
  );
}

// ---- capacity emphasis ------------------------------------------------------------

export function CapacityHeadline({ input, result }: { input: Input; result: Result }) {
  const label = result.flags?.capacity.label;
  const floor = heelRaiseFloor(input.ageBand);
  const hr = input.heelRaise;
  if ("painfulSkipped" in hr) return null; // skipped never headlines

  if (label === "unconfirmed_bilateral") {
    const worse = Math.min(hr.goodReps, hr.painfulReps);
    return (
      <section class="card card--headline">
        <MdP
          text={capacityUnconfirmedBilateral.render(
            worse,
            input.bmiBand === "over_30",
          )}
        />
      </section>
    );
  }

  const asymFired =
    hr.goodReps > 0 && (hr.goodReps - hr.painfulReps) / hr.goodReps >= 0.2;
  const floorFired = hr.painfulReps < floor;
  return (
    <section class="card card--headline">
      <MdP
        text={capacityConfirmed.render({
          painful: hr.painfulReps,
          good: hr.goodReps,
          floor,
          asymFired,
          floorFired,
        })}
      />
    </section>
  );
}

export function SkippedCapacityNote({ input }: { input: Input }) {
  const hr = input.heelRaise;
  if (!("painfulSkipped" in hr)) return null;
  const floor = heelRaiseFloor(input.ageBand);
  return (
    <section class="callout" aria-label="One thing we couldn't test today">
      <MdP text={capacitySkippedNote.render(hr.goodReps, hr.goodReps >= floor)} />
    </section>
  );
}

// ---- mobility ---------------------------------------------------------------------

export function Exercise2Block({
  input,
  result,
  units,
  asHeadline,
}: {
  input: Input;
  result: Result;
  units: Units;
  asHeadline: boolean;
}) {
  const side = limitedSideOf(input, result);
  const measured = displayLength(limitedCm(input, result), units).text;
  const threshold = displayThreshold(KNEE_TO_WALL_THRESHOLD_CM, units);
  return (
    <section
      class={`card print-exercise ${asHeadline ? "card--headline" : ""}`}
      aria-label={exercise2.title}
    >
      <h3>{exercise2.title}</h3>
      <MdP text={exercise2.why(side, measured, threshold)} />
      <MdP text={exercise2.how} />
      <MdP text={exercise2.dose} />
      <MdP text={exercise2.stop} />
    </section>
  );
}

export function JointReferralHeadline({
  input,
  result,
  units,
}: {
  input: Input;
  result: Result;
  units: Units;
}) {
  const side = limitedSideOf(input, result);
  const measured = displayLength(limitedCm(input, result), units).text;
  return (
    <section class="card card--headline" aria-label={mobilityJointHeadline.title}>
      <h3>{mobilityJointHeadline.title}</h3>
      <MdP text={mobilityJointHeadline.body(side, measured)} />
      <MdP text={mobilityJointHeadline.action} />
    </section>
  );
}

// ---- contributors -------------------------------------------------------------------

export function LoadManagementBlock({ input, result }: { input: Input; result: Result }) {
  return (
    <section class="card" aria-label="Load management">
      <MdP text={loadManagement.whatSetThisOff(input.loadChanges, input.duration)} />
      <MdP text={loadManagement.whatToDo(input.loadChanges)} />
      {result.flags?.loadSpike.occupational && <MdP text={loadManagement.occupational} />}
    </section>
  );
}

export function PostureBlock({ input }: { input: Input }) {
  return (
    <section class="card" aria-label="Your arch">
      <MdP text={postureModule.render(input.footprint, input.shoes.innerEdgeWear)} />
    </section>
  );
}

export function FootwearReplaceBlock() {
  return (
    <section class="card" aria-label="Your shoes">
      <MdP text={footwearReplace.body} />
    </section>
  );
}

export function WeightBlock() {
  return (
    <section class="card" aria-label="One more factor">
      <MdP text={weightCopy.body} />
    </section>
  );
}

// ---- collapse block -------------------------------------------------------------------

export function AlsoWorthBlock({
  items,
  input,
}: {
  items: ModuleId[];
  input: Input;
}) {
  if (items.length === 0) return null;
  return (
    <section class="card" aria-label={alsoWorthAddressing.title}>
      <p>
        <strong>{alsoWorthAddressing.title}</strong> — {alsoWorthAddressing.lead}
      </p>
      <ul>
        {items.map((id) => (
          <li key={id}>
            <Md
              text={
                id === "posture_insole"
                  ? alsoWorthAddressing.items.posture_insole(input.footprint)
                  : alsoWorthAddressing.items[id]
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
