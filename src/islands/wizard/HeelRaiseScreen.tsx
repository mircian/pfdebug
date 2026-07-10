/**
 * Step 3 — single-leg heel raise. Good side first, enforced 2-minute rest,
 * then the painful side with a skip control (records the flare; the plan
 * still works). Metronome is opt-in and off by default — visual and audio
 * separately (accessibility floor, BUILD.md §7).
 */
import { useEffect, useRef, useState } from "preact/hooks";
import Illustration from "~/components/Illustration";
import { Md } from "~/components/Md";
import { step3 } from "~/copy/copy";
import type { Foot, HeelRaise, Side } from "~/engine";

type Phase = "first" | "rest" | "second";

function sidesFor(affected: Foot): { first: Side; second: Side } {
  // Good side first; for bilateral cases both hurt — left then right.
  if (affected === "left") return { first: "right", second: "left" };
  if (affected === "right") return { first: "left", second: "right" };
  return { first: "left", second: "right" };
}

function sideHeading(side: Side, affected: Foot, which: Phase): string {
  const foot = side === "left" ? "Left" : "Right";
  if (affected === "both") return `${foot} foot`;
  return which === "first" ? `${foot} foot — your good side` : `${foot} foot — the painful side`;
}

function useMetronome(
  enabled: boolean,
  sound: boolean,
  audioRef: { current: AudioContext | null },
) {
  const [beat, setBeat] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    // "about two seconds up, two seconds down" — tick every 2 s.
    const id = window.setInterval(() => {
      setBeat((b) => b + 1);
      if (sound && audioRef.current) {
        try {
          const ctx = audioRef.current;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.frequency.value = 880;
          gain.gain.setValueAtTime(0.08, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
          osc.connect(gain).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.13);
        } catch {
          /* audio unavailable — visual cue still works */
        }
      }
    }, 2000);
    return () => window.clearInterval(id);
  }, [enabled, sound]);

  useEffect(
    () => () => {
      audioRef.current?.close().catch(() => {});
    },
    [],
  );

  return beat;
}

function RepCounter({
  heading,
  showSkip,
  onDone,
  onSkip,
}: {
  heading: string;
  showSkip: boolean;
  onDone: (reps: number) => void;
  onSkip?: () => void;
}) {
  const [count, setCount] = useState(0);
  const [metronome, setMetronome] = useState(false);
  const [sound, setSound] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);
  const beat = useMetronome(metronome, sound, audioRef);

  function toggleSound() {
    const next = !sound;
    setSound(next);
    if (next) {
      // Create/resume inside the user gesture — WebKit keeps a context made
      // from a timer callback permanently suspended (silent metronome).
      try {
        audioRef.current ??= new AudioContext();
        audioRef.current.resume().catch(() => {});
      } catch {
        /* audio unavailable — visual cue still works */
      }
    }
  }

  return (
    <div>
      <h3>{heading}</h3>
      <p
        class="measure"
        aria-live="polite"
        aria-label={`${count} repetitions`}
        style="margin:0.5rem 0"
      >
        {count}
        {metronome && (
          <span aria-hidden="true" style="font-size:1.5rem;margin-left:0.75rem;color:var(--mark)">
            {beat % 2 === 0 ? "▲ up" : "▼ down"}
          </span>
        )}
      </p>
      <div class="stack-actions">
        <button
          type="button"
          class="btn btn--primary"
          style="min-width:8rem;font-size:1.3rem"
          onClick={() => setCount((c) => c + 1)}
        >
          +1 rep
        </button>
        <button
          type="button"
          class="btn"
          onClick={() => setCount((c) => Math.max(0, c - 1))}
          aria-label="Remove one repetition"
        >
          −1
        </button>
        <button type="button" class="btn" onClick={() => onDone(count)}>
          Done with this side
        </button>
      </div>
      <div style="margin:0.5rem 0 1rem">
        <label class="choice" style="margin-bottom:0.4rem">
          <input
            type="checkbox"
            checked={metronome}
            onChange={() => setMetronome(!metronome)}
          />
          <span>Pace cue (visual metronome, 2 s up / 2 s down)</span>
        </label>
        <label class="choice">
          <input
            type="checkbox"
            checked={sound}
            disabled={!metronome}
            onChange={toggleSound}
          />
          <span>Add sound</span>
        </label>
      </div>
      {showSkip && onSkip && (
        <div class="callout">
          <p style="margin-bottom:0.5rem">{step3.skip_question}</p>
          <button type="button" class="btn" onClick={onSkip}>
            {step3.skip_button}
          </button>
          <p class="small" style="margin:0.5rem 0 0.25rem">
            {step3.skip_note}
          </p>
        </div>
      )}
    </div>
  );
}

function RestTimer({ onDone }: { onDone: () => void }) {
  const [remaining, setRemaining] = useState(120);
  const doneRef = useRef(false);

  useEffect(() => {
    const id = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(id);
          if (!doneRef.current) {
            doneRef.current = true;
            // Let the 0 render first, then advance.
            window.setTimeout(onDone, 400);
          }
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mm = Math.floor(remaining / 60);
  const ss = String(remaining % 60).padStart(2, "0");
  return (
    <div>
      <h3>Rest</h3>
      <p>Two minutes between sides — it keeps the comparison fair.</p>
      <p class="measure" aria-hidden="true">
        {mm}:{ss}
      </p>
      <p class="visually-hidden" aria-live="polite">
        {remaining === 0 ? "Rest complete. Next side." : remaining === 120 ? "Rest timer started, two minutes." : ""}
      </p>
    </div>
  );
}

export default function HeelRaiseScreen({
  affectedFoot,
  prev,
  onDone,
}: {
  affectedFoot: Foot;
  prev?: HeelRaise;
  onDone: (hr: HeelRaise) => void;
}) {
  const [phase, setPhase] = useState<Phase>("first");
  const [firstReps, setFirstReps] = useState<number | null>(null);
  const { first, second } = sidesFor(affectedFoot);

  return (
    <div>
      <h2>{step3.title}</h2>
      {step3.instructions.map((p) => (
        <p key={p}>
          <Md text={p} />
        </p>
      ))}
      <Illustration
        name="single-leg heel raise"
        caption="Single-leg heel raise: rise onto the ball of the foot, lower slowly."
        alt="A figure standing on one foot, fingertips on a wall for balance, rising onto the ball of the foot."
      />
      {prev && "goodReps" in prev && (
        <p class="small data">
          Last time: {prev.goodReps} reps
          {"painfulReps" in prev ? ` / ${prev.painfulReps} reps` : " (one side skipped)"}
        </p>
      )}

      {phase === "first" && (
        <RepCounter
          heading={sideHeading(first, affectedFoot, "first")}
          showSkip={false}
          onDone={(reps) => {
            setFirstReps(reps);
            setPhase("rest");
          }}
        />
      )}

      {phase === "rest" && <RestTimer onDone={() => setPhase("second")} />}

      {phase === "second" && (
        <RepCounter
          heading={sideHeading(second, affectedFoot, "second")}
          // The skipped shape means "good side tested, painful side skipped";
          // a bilateral case has no good side, and the engine spec models
          // bilateral input as both-tested — so no skip control there.
          showSkip={affectedFoot !== "both"}
          onDone={(reps) =>
            onDone({ goodReps: firstReps ?? 0, painfulReps: reps })
          }
          onSkip={() => onDone({ goodReps: firstReps ?? 0, painfulSkipped: true })}
        />
      )}
    </div>
  );
}
