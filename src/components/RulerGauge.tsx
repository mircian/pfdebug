/**
 * Ruler gauge — the core results component (BUILD.md §6): a horizontal ruler
 * with zone bands beneath (--mark "in range", --flag "worth working on"),
 * one pointer per side on the same scale, value in Plex Mono above each
 * pointer, asymmetry % between the pointers. States: single value /
 * L-R compare / retest delta (ghost pointer).
 *
 * Semantics rule: test results are never emergencies — gauges only ever use
 * --mark and --flag, never --stop.
 */

export interface GaugeZone {
  from: number;
  to: number;
  kind: "mark" | "flag";
  label: string;
}

export interface GaugePointer {
  label: string; // "L" / "R"
  value: number; // canonical domain units (cm or reps)
  display: string; // unit-aware text shown above the pointer
  prevValue?: number; // retest baseline → ghost pointer
  prevDisplay?: string;
}

export default function RulerGauge({
  title,
  domainMax,
  zones,
  pointers,
  threshold,
  thresholdLabel,
  asymmetryText,
  ariaSummary,
}: {
  title: string;
  domainMax: number;
  zones: GaugeZone[];
  pointers: GaugePointer[];
  threshold?: number;
  thresholdLabel?: string;
  asymmetryText?: string;
  ariaSummary: string;
}) {
  const W = 400;
  const H = 116;
  const rulerY = 62;
  const zoneY = rulerY + 8;
  const x = (v: number) => Math.max(0, Math.min(1, v / domainMax)) * (W - 24) + 12;

  const ticks = [];
  for (let i = 0; i <= 40; i++) {
    const tx = 12 + (i / 40) * (W - 24);
    const major = i % 5 === 0;
    ticks.push(
      <line
        key={i}
        x1={tx}
        y1={rulerY}
        x2={tx}
        y2={rulerY - (major ? 12 : 6)}
        stroke="var(--ink-soft)"
        stroke-width={major ? 1.5 : 1}
      />,
    );
  }

  const mid =
    pointers.length === 2
      ? (x(pointers[0]!.value) + x(pointers[1]!.value)) / 2
      : null;

  return (
    <figure style="margin:0 0 1.75rem">
      <figcaption style="font-weight:600">{title}</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={ariaSummary}
        style="display:block;width:100%;height:auto"
      >
        {/* zone bands beneath the ruler */}
        {zones.map((z) => (
          <g key={`${z.from}-${z.to}`}>
            <rect
              x={x(z.from)}
              y={zoneY}
              width={Math.max(0, x(z.to) - x(z.from))}
              height={7}
              fill={z.kind === "mark" ? "var(--mark)" : "var(--flag)"}
              opacity="0.85"
              rx="1.5"
            />
            <text
              x={(x(z.from) + x(z.to)) / 2}
              y={zoneY + 22}
              text-anchor="middle"
              font-family="var(--font-data)"
              font-size="9.5"
              fill="var(--ink-soft)"
            >
              {z.label}
            </text>
          </g>
        ))}

        {/* ruler line + ticks */}
        <line
          x1="12"
          y1={rulerY}
          x2={W - 12}
          y2={rulerY}
          stroke="var(--ink)"
          stroke-width="1.5"
        />
        {ticks}

        {/* threshold marker */}
        {threshold !== undefined && (
          <g>
            <line
              x1={x(threshold)}
              y1={rulerY - 18}
              x2={x(threshold)}
              y2={zoneY + 7}
              stroke="var(--ink)"
              stroke-width="1"
              stroke-dasharray="3 3"
            />
            {thresholdLabel && (
              <text
                x={x(threshold)}
                y={zoneY + 34}
                text-anchor="middle"
                font-family="var(--font-data)"
                font-size="9.5"
                fill="var(--ink)"
              >
                {thresholdLabel}
              </text>
            )}
          </g>
        )}

        {/* retest ghost pointers */}
        {pointers.map(
          (p) =>
            p.prevValue !== undefined && (
              <g key={`ghost-${p.label}`} opacity="0.55">
                <path
                  d={`M ${x(p.prevValue)} ${rulerY - 2} l -5 -9 l 10 0 z`}
                  fill="none"
                  stroke="var(--ink-soft)"
                  stroke-width="1.5"
                />
                <text
                  x={x(p.prevValue)}
                  y={rulerY - 34}
                  text-anchor="middle"
                  font-family="var(--font-data)"
                  font-size="9"
                  fill="var(--ink-soft)"
                >
                  was {p.prevDisplay}
                </text>
              </g>
            ),
        )}

        {/* pointers, value in Plex Mono above each */}
        {pointers.map((p) => (
          <g key={p.label}>
            <path
              d={`M ${x(p.value)} ${rulerY - 2} l -6 -11 l 12 0 z`}
              fill="var(--ink)"
            />
            <text
              x={x(p.value)}
              y={rulerY - 20}
              text-anchor="middle"
              font-family="var(--font-data)"
              font-weight="500"
              font-size="13"
              fill="var(--ink)"
            >
              {p.display}
            </text>
            <text
              x={x(p.value)}
              y={rulerY - 44}
              text-anchor="middle"
              font-family="var(--font-data)"
              font-size="10"
              fill="var(--ink-soft)"
            >
              {p.label}
            </text>
          </g>
        ))}

        {/* asymmetry % rendered between the two pointers */}
        {/* --flag is for bands/fills only, never text (BUILD.md §6). */}
        {asymmetryText && mid !== null && (
          <text
            x={mid}
            y={rulerY - 52}
            text-anchor="middle"
            font-family="var(--font-data)"
            font-size="10"
            fill="var(--ink-soft)"
          >
            {asymmetryText}
          </text>
        )}
      </svg>
    </figure>
  );
}
