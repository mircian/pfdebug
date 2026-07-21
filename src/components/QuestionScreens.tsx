/**
 * Generic single-choice / multi-choice wizard screens. One screen per
 * question; explicit Continue (48px targets — people operate this
 * one-legged, holding a phone).
 */
import { Md } from "~/components/Md";

export interface Option<V extends string> {
  value: V;
  label: string;
}

/**
 * The bottom action bar every wizard screen closes on: an optional Back
 * (outline) beside the primary that takes the rest of the row. Screens with
 * no way back (the intro, the live heel-raise test) simply omit `onBack`.
 */
export function WizardActions({
  onBack,
  onContinue,
  continueLabel = "Continue",
  disabled = false,
  backLabel = "Back",
}: {
  onBack?: () => void;
  onContinue: () => void;
  continueLabel?: string;
  disabled?: boolean;
  backLabel?: string;
}) {
  return (
    <div class="wizard-actions">
      {onBack && (
        <button type="button" class="btn" onClick={onBack}>
          {backLabel}
        </button>
      )}
      <button
        type="button"
        class="btn btn--primary"
        disabled={disabled}
        onClick={onContinue}
      >
        {continueLabel}
      </button>
    </div>
  );
}

export function SingleChoice<V extends string>({
  question,
  note,
  options,
  value,
  onChange,
  onContinue,
  onBack,
  continueLabel = "Continue",
}: {
  question: string;
  note?: string;
  options: readonly Option<V>[];
  value: V | null;
  onChange: (v: V) => void;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
}) {
  return (
    <fieldset style="border:0;padding:0;margin:0">
      <legend>
        <h2>
          <Md text={question} />
        </h2>
      </legend>
      {note && (
        <p class="small">
          <Md text={note} />
        </p>
      )}
      {options.map((o) => (
        <label
          key={o.value}
          class={`choice ${value === o.value ? "choice--selected" : ""}`}
        >
          <input
            type="radio"
            name={question}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>
            <Md text={o.label} />
          </span>
        </label>
      ))}
      <WizardActions
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={continueLabel}
        disabled={value === null}
      />
    </fieldset>
  );
}

export function MultiChoice<V extends string>({
  question,
  note,
  options,
  noneLabel,
  values,
  noneSelected,
  onChange,
  onContinue,
  onBack,
  continueLabel = "Continue",
}: {
  question: string;
  note?: string;
  options: readonly Option<V>[];
  /** The exclusive "none" row, e.g. "None of these" / "Nothing I can think of". */
  noneLabel?: string;
  values: V[];
  /** Whether the none row is explicitly selected (empty array + confirmed). */
  noneSelected: boolean;
  onChange: (values: V[], noneSelected: boolean) => void;
  onContinue: () => void;
  onBack?: () => void;
  continueLabel?: string;
}) {
  // At least one answer always — the "none" row is the explicit empty answer
  // where the question offers one.
  const canContinue = values.length > 0 || (noneLabel !== undefined && noneSelected);

  function toggle(v: V) {
    const next = values.includes(v)
      ? values.filter((x) => x !== v)
      : [...values, v];
    onChange(next, false);
  }

  return (
    <fieldset style="border:0;padding:0;margin:0">
      <legend>
        <h2>
          <Md text={question} />
        </h2>
      </legend>
      {note && (
        <p class="small">
          <Md text={note} />
        </p>
      )}
      {options.map((o) => (
        <label
          key={o.value}
          class={`choice ${values.includes(o.value) ? "choice--selected" : ""}`}
        >
          <input
            type="checkbox"
            checked={values.includes(o.value)}
            onChange={() => toggle(o.value)}
          />
          <span>
            <Md text={o.label} />
          </span>
        </label>
      ))}
      {noneLabel && (
        <label class={`choice ${noneSelected ? "choice--selected" : ""}`}>
          <input
            type="checkbox"
            checked={noneSelected}
            onChange={() => onChange([], !noneSelected)}
          />
          <span>{noneLabel}</span>
        </label>
      )}
      <WizardActions
        onBack={onBack}
        onContinue={onContinue}
        continueLabel={continueLabel}
        disabled={!canContinue}
      />
    </fieldset>
  );
}
