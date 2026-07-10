/**
 * Labelled illustration placeholder — final art ships later; the flow must
 * not depend on it (BUILD.md §6). Correct caption + alt text now, flat
 * vector frames later. Visuals augment, never gatekeep: the full text
 * instructions always accompany these.
 */

export default function Illustration({
  name,
  caption,
  alt,
}: {
  name: string;
  caption: string;
  alt: string;
}) {
  return (
    <figure class="illo">
      <svg
        viewBox="0 0 320 140"
        role="img"
        aria-label={alt}
        style="display:block;width:100%;height:auto"
      >
        <rect
          x="2"
          y="2"
          width="316"
          height="136"
          fill="none"
          stroke="var(--ink-soft)"
          stroke-width="1"
          stroke-dasharray="6 5"
        />
        <text
          x="160"
          y="66"
          text-anchor="middle"
          fill="var(--ink-soft)"
          font-family="var(--font-data)"
          font-size="13"
        >
          [illustration: {name}]
        </text>
        <text
          x="160"
          y="88"
          text-anchor="middle"
          fill="var(--ink-soft)"
          font-family="var(--font-data)"
          font-size="10"
        >
          final art pending — follow the text instructions
        </text>
      </svg>
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
