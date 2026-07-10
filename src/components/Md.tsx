/**
 * Minimal inline-markdown renderer so copy strings keep the doc's emphasis
 * (**bold** / *italic*) byte-for-byte while rendering as real markup.
 * No block syntax, no HTML passthrough — copy is trusted but keep it dumb.
 */
import type { ComponentChildren } from "preact";

function parse(text: string): ComponentChildren[] {
  const out: ComponentChildren[] = [];
  // Tokenize on ** first, then * inside the remainder.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      out.push(<strong>{part.slice(2, -2)}</strong>);
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      out.push(<em>{part.slice(1, -1)}</em>);
    } else if (part) {
      out.push(part);
    }
  }
  return out;
}

export function Md({ text }: { text: string }) {
  return <>{parse(text)}</>;
}

export function MdP({ text, class: className }: { text: string; class?: string }) {
  return <p class={className}>{parse(text)}</p>;
}
