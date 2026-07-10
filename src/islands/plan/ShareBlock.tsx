/**
 * Share — two distinct objects, kept separate (BUILD.md §7):
 *  1. Share pfdebug — the promote loop; zero personal data; shares the site.
 *  2. Share my plan — utility; shares the personal #payload URL and says so.
 */
import { useState } from "preact/hooks";
import { share } from "~/copy/copy";
import type { Input } from "~/engine";
import type { RetestBaseline } from "~/lib/payload";
import { generateShareCard } from "~/lib/sharecard";
import type { Units } from "~/lib/units";

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function ShareBlock({
  planUrl,
  input,
  units,
  prev,
}: {
  planUrl: string;
  input: Input;
  units: Units;
  prev?: RetestBaseline;
}) {
  const [pfCopied, setPfCopied] = useState(false);
  const [planCopied, setPlanCopied] = useState(false);

  async function sharePfdebug() {
    // Zero personal data: text + site URL only — never the payload.
    if (navigator.share) {
      try {
        await navigator.share({ text: share.pfdebug.message });
        return;
      } catch {
        /* cancelled or unsupported — fall through to copy */
      }
    }
    if (await copyText(share.pfdebug.message)) {
      setPfCopied(true);
      setTimeout(() => setPfCopied(false), 2500);
    }
  }

  async function shareMyPlan() {
    if (navigator.share) {
      try {
        await navigator.share({ url: planUrl });
        return;
      } catch {
        /* cancelled or unsupported — fall through to copy */
      }
    }
    if (await copyText(planUrl)) {
      setPlanCopied(true);
      setTimeout(() => setPlanCopied(false), 2500);
    }
  }

  function downloadCard() {
    const url = generateShareCard(input, units, prev);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "pfdebug-results.png";
    a.click();
  }

  return (
    <section class="no-print" aria-label="Share">
      <div class="ticks" role="presentation"></div>

      <p>{share.pfdebug.prompt}</p>
      <div class="stack-actions">
        <button type="button" class="btn btn--primary" onClick={sharePfdebug}>
          {pfCopied ? share.pfdebug.copied : share.pfdebug.button}
        </button>
      </div>
      <p class="small">{share.pfdebug.prevalence}</p>

      <div class="ticks" role="presentation"></div>

      <div class="stack-actions" style="margin-bottom:0.25rem">
        <button type="button" class="btn" onClick={shareMyPlan}>
          {planCopied ? share.myPlan.copied : share.myPlan.button}
        </button>
        <button type="button" class="btn btn--quiet" onClick={downloadCard}>
          Download share card
        </button>
      </div>
      <p class="small">{share.myPlan.label}</p>
    </section>
  );
}
