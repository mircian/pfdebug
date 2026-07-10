/**
 * The printed exercise sheet — a dedicated layout, not a screen dump
 * (BUILD.md §7). ≤2 pages (1 is the goal): exercises with keyframes +
 * doses + tempo, the user's own numbers, a blank "retest on" line, and a
 * client-generated QR back to the plan URL. Header carries the wordmark;
 * footer carries the one-line prompt.
 */
import QRCode from "qrcode";
import { useEffect, useRef } from "preact/hooks";
import { Md } from "~/components/Md";
import { exercise1, exercise2, exercise3, footwearNote, printSheet } from "~/copy/copy";
import type { Input, Result } from "~/engine";
import type { RetestBaseline } from "~/lib/payload";
import { displayLength, type Units } from "~/lib/units";

function Keyframes({ frames }: { frames: string[] }) {
  return (
    <div class="print-keyframes" aria-hidden="true">
      {frames.map((f) => (
        <span key={f} class="print-keyframe">
          {f}
        </span>
      ))}
    </div>
  );
}

export default function PrintSheet({
  input,
  result,
  planUrl,
  units,
  prev,
}: {
  input: Input;
  result: Result;
  planUrl: string;
  units: Units;
  prev?: RetestBaseline;
}) {
  const qrRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!qrRef.current) return;
    QRCode.toCanvas(qrRef.current, planUrl, {
      width: 110,
      margin: 1,
      errorCorrectionLevel: "L",
      color: { dark: "#1F2E35", light: "#FFFFFF" },
    }).catch(() => {
      /* QR is a nicety; the printed URL below it still works */
    });
  }, [planUrl]);

  const hr = input.heelRaise;
  const skipped = "painfulSkipped" in hr;
  const showEx2 =
    result.modulesInFull?.includes("exercise2") ||
    result.headlineFactor === "mobility_soft_tissue";

  return (
    <div class="print-sheet">
      <header class="print-header">
        <span class="print-wordmark">pfdebug</span>
        <span class="print-date">{new Date().toISOString().slice(0, 10)}</span>
      </header>

      <section class="print-numbers">
        <strong>Your numbers:</strong>{" "}
        knee-to-wall L {displayLength(input.kneeToWall.left_cm, units).text} · R{" "}
        {displayLength(input.kneeToWall.right_cm, units).text} — heel raise{" "}
        {skipped
          ? `${hr.goodReps} reps (good side; painful side skipped)`
          : `${hr.goodReps} / ${hr.painfulReps} reps`}
        {prev && "painfulReps" in prev.heelRaise
          ? ` (last time ${prev.heelRaise.goodReps} / ${prev.heelRaise.painfulReps})`
          : ""}
      </section>

      <section class="print-ex">
        <h3>{exercise1.title}</h3>
        <Keyframes frames={["towel under toes", "rise 3 s", "hold 2 s · lower 3 s"]} />
        <p>
          <Md text={exercise1.how} />
        </p>
        <p>
          <Md text={exercise1.dose} />
        </p>
      </section>

      {showEx2 && (
        <section class="print-ex">
          <h3>{exercise2.title}</h3>
          <Keyframes frames={["foot at wall", "knee drives forward", "slow return"]} />
          <p>
            <Md text={exercise2.how} />
          </p>
          <p>
            <Md text={exercise2.dose} />
          </p>
        </section>
      )}

      <section class="print-ex">
        <h3>{exercise3.title}</h3>
        <Keyframes frames={["foot over knee", "pull toes back", "hold 10 s × 10"]} />
        <p>
          <Md text={exercise3.how} />
        </p>
        <p>
          <Md text={exercise3.dose} />
        </p>
      </section>

      <p class="print-footwear">
        <Md text={footwearNote.body} />
      </p>

      <div class="print-bottom">
        <p class="print-retest data">{printSheet.retestOn}</p>
        <div class="print-qr">
          <canvas ref={qrRef} width="110" height="110"></canvas>
          <span>your plan</span>
        </div>
      </div>

      <footer class="print-footer">{printSheet.footer}</footer>
    </div>
  );
}
