/**
 * Client-generated share card: canvas → PNG of the user's numbers (ruler
 * gauge + any retest delta). Contains only what the user chooses to show —
 * generated locally, downloaded locally; nothing leaves the device
 * (BUILD.md §7).
 */
import type { Input } from "~/engine";
import type { RetestBaseline } from "./payload";
import { displayLength, type Units } from "./units";

const PAPER = "#FAFAF7";
const INK = "#1F2E35";
const INK_SOFT = "#5C6B72";
const MARK = "#0E7C6B";

function drawTicks(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  ctx.strokeStyle = INK_SOFT;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  for (let i = 0; i <= 60; i++) {
    const tx = x + (i / 60) * w;
    const major = i % 5 === 0;
    ctx.beginPath();
    ctx.moveTo(tx, y);
    ctx.lineTo(tx, y - (major ? 22 : 11));
    ctx.stroke();
  }
}

export function generateShareCard(
  input: Input,
  units: Units,
  prev?: RetestBaseline,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, 1200, 630);

  ctx.fillStyle = INK;
  ctx.font = '500 44px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillText("pfdebug", 64, 92);

  drawTicks(ctx, 64, 160, 1072);

  const hr = input.heelRaise;
  const skipped = "painfulSkipped" in hr;
  let y = 250;

  ctx.font = '600 34px "Public Sans", system-ui, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText("Single-leg heel raise", 64, y);
  ctx.font = '500 60px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillStyle = MARK;
  const prevTested = prev && "painfulReps" in prev.heelRaise ? prev.heelRaise : null;
  if (skipped) {
    ctx.fillText(`${hr.goodReps} reps (good side)`, 64, y + 72);
  } else if (prevTested) {
    ctx.fillText(
      `${prevTested.painfulReps} → ${hr.painfulReps} reps`,
      64,
      y + 72,
    );
  } else {
    ctx.fillText(`${hr.painfulReps} vs ${hr.goodReps} reps`, 64, y + 72);
  }

  y = 430;
  ctx.font = '600 34px "Public Sans", system-ui, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText("Knee-to-wall", 64, y);
  ctx.font = '500 60px "IBM Plex Mono", ui-monospace, monospace';
  ctx.fillStyle = MARK;
  const l = displayLength(input.kneeToWall.left_cm, units).text;
  const r = displayLength(input.kneeToWall.right_cm, units).text;
  ctx.fillText(`L ${l} · R ${r}`, 64, y + 72);

  ctx.font = '400 28px "Public Sans", system-ui, sans-serif';
  ctx.fillStyle = INK_SOFT;
  ctx.fillText("The 15-minute heel-pain self-check — pfdebug.com", 64, 588);

  return canvas.toDataURL("image/png");
}
