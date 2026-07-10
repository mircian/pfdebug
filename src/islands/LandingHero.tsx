/**
 * Landing hero — two states (BUILD.md §3):
 *  - no saved result → intro + "Start the check"
 *  - `pfdebug.lastResult` in localStorage → "Welcome back" + View my plan / Retest
 */
import { useEffect, useState } from "preact/hooks";
import { Md, MdP } from "~/components/Md";
import { landing } from "~/copy/copy";
import { getLastResult } from "~/lib/storage";

export default function LandingHero() {
  const [lastResult, setLastResult] = useState<string | null>(null);
  useEffect(() => {
    setLastResult(getLastResult());
  }, []);

  if (lastResult) {
    return (
      <section aria-label="Welcome back">
        <h1>
          <Md text={landing.returning_title} />
        </h1>
        <p>{landing.returning_body}</p>
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
      <h1>{landing.hero_title}</h1>
      <MdP text={landing.hero_body} />
      <div class="stack-actions">
        <a class="btn btn--primary" href="/assessment">
          {landing.cta}
        </a>
      </div>
      <p class="small">{landing.small_print}</p>
      <div class="ticks" role="presentation"></div>
      <p aria-label="Evidence">
        {landing.evidence_badges.map((b) => (
          <span class="badge" key={b}>
            {b}
          </span>
        ))}
      </p>
    </section>
  );
}
