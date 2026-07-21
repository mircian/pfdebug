/**
 * Step 2 — knee-to-wall test. Primary input is a direct number in the active
 * unit; the "no tape measure?" calibrator (phone-lengths / bank card) is the
 * fallback. Values are stored canonically in cm the moment they're parsed —
 * display-only conversion everywhere else (BUILD.md §5).
 */
import { useEffect, useRef, useState } from "preact/hooks";
import Illustration from "~/components/Illustration";
import { Md } from "~/components/Md";
import { WizardActions, type Option } from "~/components/QuestionScreens";
import { step2 } from "~/copy/copy";
import type { Sensation, Side } from "~/engine";
import { lengthsToCm, REFERENCE_OBJECTS } from "~/lib/calibrator";
import { displayLength, parseLengthToCm, type Units } from "~/lib/units";

export interface KneeToWallDraft {
  left_cm: number | null;
  right_cm: number | null;
  sensationLeft: Sensation | null;
  sensationRight: Sensation | null;
}

function FootMeasure({
  side,
  units,
  cm,
  prevCm,
  onCm,
}: {
  side: Side;
  units: Units;
  cm: number | null;
  prevCm?: number;
  onCm: (cm: number | null) => void;
}) {
  const unitLabel = units === "imperial" ? "in" : "cm";
  // Local text state so typing isn't fought; re-derived when the units flip
  // or the canonical value changes externally (calibrator) — but never while
  // the user is mid-keystroke in this field.
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevUnits = useRef(units);
  useEffect(() => {
    // A unit flip always re-derives the display (in some browsers a button
    // click leaves focus on the input — the number must still convert).
    // External cm changes (calibrator) never clobber mid-keystroke text.
    const unitsChanged = prevUnits.current !== units;
    prevUnits.current = units;
    if (!unitsChanged && document.activeElement === inputRef.current) return;
    setText(cm === null ? "" : String(displayLength(cm, units).value));
  }, [units, cm]);

  function handleInput(e: Event) {
    const raw = (e.target as HTMLInputElement).value;
    setText(raw);
    const v = Number.parseFloat(raw);
    if (Number.isFinite(v) && v >= 0) {
      onCm(parseLengthToCm(v, units)); // canonical cm, converted exactly once
    } else {
      onCm(null);
    }
  }

  const id = `ktw-${side}`;
  return (
    <div style="margin-bottom:1rem">
      <label for={id} style="text-transform:capitalize">
        {side} foot — toe to wall
      </label>
      <div style="display:flex;align-items:center;gap:0.6rem;max-width:14rem">
        <input
          id={id}
          ref={inputRef}
          type="number"
          inputMode="decimal"
          min="0"
          step="0.5"
          value={text}
          onInput={handleInput}
          aria-describedby={prevCm !== undefined ? `${id}-prev` : undefined}
        />
        <span class="data unit-anim" aria-hidden="true">
          {unitLabel}
        </span>
      </div>
      {prevCm !== undefined && (
        <p class="small data" id={`${id}-prev`}>
          Last time: {displayLength(prevCm, units).text}
        </p>
      )}
    </div>
  );
}

// Module scope, not inside the screen's render: an inline component type is
// recreated per render, which remounts the fieldset DOM on every keystroke
// and drops keyboard focus mid-radio-group.
function EndFeel({
  side,
  value,
  onSelect,
}: {
  side: Side;
  value: Sensation | null;
  onSelect: (v: Sensation) => void;
}) {
  const options = step2.endfeel.options as readonly Option<Sensation>[];
  return (
    <fieldset style="border:0;padding:0;margin:0 0 1rem">
      <legend style="font-weight:600;text-transform:capitalize">
        {side} foot: {step2.endfeel.question}
      </legend>
      {options.map((o) => (
        <label
          key={o.value}
          class={`choice ${value === o.value ? "choice--selected" : ""}`}
        >
          <input
            type="radio"
            name={`endfeel-${side}`}
            checked={value === o.value}
            onChange={() => onSelect(o.value)}
          />
          <span>
            <Md text={o.label} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}

export default function KneeToWallScreen({
  units,
  draft,
  prev,
  onChange,
  onContinue,
  onBack,
}: {
  units: Units;
  draft: KneeToWallDraft;
  prev?: { left_cm: number; right_cm: number };
  onChange: (d: KneeToWallDraft) => void;
  onContinue: () => void;
  onBack?: () => void;
}) {
  const [refId, setRefId] = useState(REFERENCE_OBJECTS[0]!.id);
  const [countText, setCountText] = useState("");

  const complete =
    draft.left_cm !== null &&
    draft.right_cm !== null &&
    draft.sensationLeft !== null &&
    draft.sensationRight !== null;

  function applyCalibrator(side: Side) {
    const count = Number.parseFloat(countText);
    const cm = lengthsToCm(refId, count);
    if (cm === null) return;
    onChange(side === "left" ? { ...draft, left_cm: cm } : { ...draft, right_cm: cm });
  }

  return (
    <div>
      <h2>{step2.title}</h2>
      {step2.instructions.map((p) => (
        <p key={p}>
          <Md text={p} />
        </p>
      ))}
      <Illustration
        name="knee-to-wall"
        caption="Knee-to-wall: heel down, knee driving forward to touch the wall."
        alt="A figure facing a wall, one foot forward, bending the knee to touch the wall while the heel stays flat on the floor."
      />

      <p>
        {step2.helper_lead} <strong>{step2.helper_no_tape}</strong>
      </p>

      <FootMeasure
        side="left"
        units={units}
        cm={draft.left_cm}
        prevCm={prev?.left_cm}
        onCm={(cm) => onChange({ ...draft, left_cm: cm })}
      />
      <FootMeasure
        side="right"
        units={units}
        cm={draft.right_cm}
        prevCm={prev?.right_cm}
        onCm={(cm) => onChange({ ...draft, right_cm: cm })}
      />

      <details style="margin-bottom:1.5rem">
        <summary class="btn btn--quiet" style="display:inline-flex">
          {step2.helper_no_tape}
        </summary>
        <div class="card" style="margin-top:0.75rem">
          {/* Verbatim helper sentence with the [model dropdown] slot filled
              in place (pfdebug-copy.md, Step 2). */}
          <p>
            {step2.helper_pick_phone}{" "}
            <select
              id="calib-ref"
              aria-label="Phone model or reference object"
              value={refId}
              onChange={(e) => setRefId((e.target as HTMLSelectElement).value)}
              style="display:inline-block;width:auto;max-width:100%;font-size:1rem"
            >
              {REFERENCE_OBJECTS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>{" "}
            — {step2.helper_tail}
          </p>
          <label for="calib-count" style="margin-top:0.75rem;display:block">
            How many lengths?
          </label>
          <input
            id="calib-count"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.25"
            value={countText}
            onInput={(e) => setCountText((e.target as HTMLInputElement).value)}
            style="max-width:8rem"
          />
          <div class="stack-actions">
            <button type="button" class="btn" onClick={() => applyCalibrator("left")}>
              Use for left
            </button>
            <button type="button" class="btn" onClick={() => applyCalibrator("right")}>
              Use for right
            </button>
          </div>
        </div>
      </details>

      <EndFeel
        side="left"
        value={draft.sensationLeft}
        onSelect={(v) => onChange({ ...draft, sensationLeft: v })}
      />
      <EndFeel
        side="right"
        value={draft.sensationRight}
        onSelect={(v) => onChange({ ...draft, sensationRight: v })}
      />

      <WizardActions onBack={onBack} onContinue={onContinue} disabled={!complete} />
    </div>
  );
}
