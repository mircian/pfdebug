/**
 * Wizard progress — a ruler filling left→right, minor/major ticks, current
 * step as the tape pointer (BUILD.md §6).
 */

export default function ProgressRuler({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const W = 400;
  const H = 34;
  const baseline = 24;
  const pct = total <= 1 ? 0 : current / (total - 1);
  const x = pct * W;

  const ticks = [];
  for (let i = 0; i <= 50; i++) {
    const tx = (i / 50) * W;
    const major = i % 5 === 0;
    ticks.push(
      <line
        key={i}
        x1={tx}
        y1={baseline}
        x2={tx}
        y2={baseline - (major ? 14 : 7)}
        stroke={tx <= x ? "var(--mark)" : "var(--ink-soft)"}
        stroke-width={major ? 2 : 1}
      />,
    );
  }

  return (
    <div
      class="progress-ruler"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={`Step ${current + 1} of ${total}`}
    >
      <svg viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
        <line
          x1="0"
          y1={baseline}
          x2={W}
          y2={baseline}
          stroke="var(--ink-soft)"
          stroke-width="1"
        />
        <line
          x1="0"
          y1={baseline}
          x2={x}
          y2={baseline}
          stroke="var(--mark)"
          stroke-width="3"
        />
        {ticks}
        {/* tape pointer */}
        <path
          d={`M ${x} ${baseline + 2} l -5 8 l 10 0 z`}
          fill="var(--ink)"
        />
      </svg>
    </div>
  );
}
