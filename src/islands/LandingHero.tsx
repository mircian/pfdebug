/**
 * Landing hero — two states (BUILD.md §3):
 *  - no saved result → intro + "Start the check"
 *  - `pfdebug.lastResult` in localStorage → "Welcome back" + View my plan / Retest
 *
 * The new-visitor hero carries the product's one atmospheric moment: a
 * measuring tape marked 0→15 minutes, the full span re-inked in --mark.
 */
import { useEffect, useState } from "preact/hooks";
import { Md, MdP } from "~/components/Md";
import { landing } from "~/copy/copy";
import { getLastResult } from "~/lib/storage";

/** The 15-minute measuring tape — the hero graphic. */
function MinutesTape() {
  return (
    <svg
      class="hero-tape"
      viewBox="0 0 356 118"
      role="img"
      aria-label="A measuring tape marked from zero to fifteen minutes, the full span highlighted — the length of the check."
    >
      <line x1="10" y1="74" x2="346" y2="74" stroke="var(--ink)" stroke-width="2" />
      <line x1="10" y1="74" x2="346" y2="74" stroke="var(--mark)" stroke-width="3" />
      <g stroke="var(--ink-soft)" stroke-width="1.5">
        <line x1="32" y1="74" x2="32" y2="62" />
        <line x1="55" y1="74" x2="55" y2="62" />
        <line x1="77" y1="74" x2="77" y2="62" />
        <line x1="99" y1="74" x2="99" y2="62" />
        <line x1="144" y1="74" x2="144" y2="62" />
        <line x1="167" y1="74" x2="167" y2="62" />
        <line x1="189" y1="74" x2="189" y2="62" />
        <line x1="211" y1="74" x2="211" y2="62" />
        <line x1="256" y1="74" x2="256" y2="62" />
        <line x1="279" y1="74" x2="279" y2="62" />
        <line x1="301" y1="74" x2="301" y2="62" />
        <line x1="323" y1="74" x2="323" y2="62" />
      </g>
      <g stroke="var(--ink)" stroke-width="2.5">
        <line x1="10" y1="74" x2="10" y2="48" />
        <line x1="122" y1="74" x2="122" y2="48" />
        <line x1="234" y1="74" x2="234" y2="48" />
        <line x1="346" y1="74" x2="346" y2="48" />
      </g>
      <g font-family="IBM Plex Mono, monospace" font-size="13" fill="var(--ink)" text-anchor="middle">
        <text x="10" y="98">0</text>
        <text x="122" y="98">5</text>
        <text x="234" y="98">10</text>
        <text x="346" y="98">15</text>
      </g>
      <text
        x="178"
        y="30"
        text-anchor="middle"
        font-family="IBM Plex Mono, monospace"
        font-size="11"
        letter-spacing="0.12em"
        fill="var(--ink-soft)"
      >
        MINUTES · START TO FINISH
      </text>
    </svg>
  );
}

export default function LandingHero() {
  const [lastResult, setLastResult] = useState<string | null>(null);
  useEffect(() => {
    setLastResult(getLastResult());
  }, []);

  if (lastResult) {
    return (
      <section aria-label="Welcome back">
        <p class="kicker" style="color:var(--mark)">
          Welcome back
        </p>
        <h1>
          <Md text={landing.returning_title} />
        </h1>
        <p class="wizard-lede">{landing.returning_body}</p>
        <div class="stack-actions">
          <a class="btn btn--primary" href={`/plan#${lastResult}`}>
            {landing.view_plan}
          </a>
          <a class="btn" href="/assessment?mode=retest">
            {landing.retest}
          </a>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Introduction">
      <p class="kicker">The 15-minute self-check</p>
      <h1>{landing.hero_title}</h1>
      <MdP text={landing.hero_body} class="wizard-lede" />
      <MinutesTape />
      <p aria-label="Evidence">
        {landing.evidence_badges.map((b) => (
          <span class="badge" key={b}>
            {b}
          </span>
        ))}
      </p>
      <div class="stack-actions">
        <a class="btn btn--primary btn--full" href="/assessment">
          {landing.cta}
        </a>
      </div>
      <p class="small">{landing.small_print}</p>
    </section>
  );
}
