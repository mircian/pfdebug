/**
 * Wizard progress — a measuring tape filling left→right: a hairline baseline
 * with tick hatching, the covered span re-inked in --mark, and a tape pointer
 * at the head (BUILD.md §6). Optional mono labels underneath read like the
 * marks on a real tape (STEP 2 OF 4 · KNEE-TO-WALL).
 */

// Design greys for the unfilled tape — quieter than --ink-soft so the teal
// fill and pointer stay the eye's anchor.
const TRACK = "#cbc8bf";
const TRACK_TICK = "#bdbab1";

export default function ProgressRuler({
  current,
  total,
  leftLabel,
  rightLabel,
  ariaLabel,
}: {
  current: number;
  total: number;
  leftLabel?: string;
  rightLabel?: string;
  ariaLabel?: string;
}) {
  const pct = total <= 1 ? 0 : Math.min(1, Math.max(0, current / (total - 1)));
  const fill = `${(pct * 100).toFixed(2)}%`;
  const hatch = (color: string) =>
    `repeating-linear-gradient(90deg, ${color} 0 1px, transparent 1px 15px)`;

  return (
    <div
      class="progress-ruler"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      aria-label={ariaLabel ?? `Step ${current + 1} of ${total}`}
    >
      <div style="position:relative;height:22px" aria-hidden="true">
        {/* baseline + covered span */}
        <div style={`position:absolute;left:0;right:0;bottom:8px;height:2px;background:${TRACK}`} />
        <div style={`position:absolute;left:0;bottom:8px;width:${fill};height:2px;background:var(--mark)`} />
        {/* tick hatching, grey then re-inked teal over the covered span */}
        <div style={`position:absolute;left:0;right:0;bottom:8px;height:9px;background:${hatch(TRACK_TICK)}`} />
        <div style={`position:absolute;left:0;bottom:8px;width:${fill};height:9px;background:${hatch("var(--mark)")}`} />
        {/* tape pointer at the head of the fill */}
        <div
          style={`position:absolute;left:calc(${fill} - 5px);bottom:0;width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:7px solid var(--ink)`}
        />
      </div>
      {(leftLabel || rightLabel) && (
        <div class="progress-ruler__labels" aria-hidden="true">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
      )}
    </div>
  );
}
