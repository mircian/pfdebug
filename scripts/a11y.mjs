/**
 * Accessibility audit (axe-core, WCAG 2.x A/AA) on the core screens:
 * landing, assessment (first screens), and /plan for each result shape.
 * Zero violations is the bar — the WCAG AA floor is an acceptance criterion.
 *
 * Also emulates print media on /plan and reports the sheet's page count
 * estimate (must be ≤ 2 pages).
 *
 * Usage: node scripts/a11y.mjs
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lz from "lz-string";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = JSON.parse(
  readFileSync(path.join(root, "src/engine/fixtures/pfdebug-personas.fixtures.json"), "utf8"),
);
const encode = (input) =>
  "v1." + lz.compressToEncodedURIComponent(JSON.stringify({ input, date: "2026-07-10" }));
const byId = (id) => fixtures.cases.find((c) => c.id === id).input;

const PORT = 4175;
const BASE = `http://localhost:${PORT}`;

const server = spawn(path.join(root, "node_modules/.bin/astro"), ["preview", "--port", String(PORT)], {
  cwd: root,
  stdio: "pipe",
});
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error("preview timeout")), 30000);
  server.stdout.on("data", (d) => {
    if (String(d).includes(String(PORT))) {
      clearTimeout(t);
      resolve();
    }
  });
});

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const context = await browser.newContext({ viewport: { width: 420, height: 900 } });
let totalViolations = 0;

async function audit(name, url, prepare) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  if (prepare) await prepare(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  if (results.violations.length === 0) {
    console.log(`ok    ${name}`);
  } else {
    totalViolations += results.violations.length;
    console.log(`FAIL  ${name}`);
    for (const v of results.violations) {
      console.log(`      [${v.impact}] ${v.id}: ${v.help}`);
      for (const n of v.nodes.slice(0, 3)) console.log(`        ${n.target.join(" ")}`);
    }
  }
  await page.close();
}

await audit("landing", `${BASE}/`);
await audit("assessment intro", `${BASE}/assessment`);
await audit("assessment Q1", `${BASE}/assessment`, async (page) => {
  await page.getByRole("button", { name: "Begin" }).click();
});
await audit("assessment Q4 (safety)", `${BASE}/assessment`, async (page) => {
  await page.getByRole("button", { name: "Begin" }).click();
  for (let i = 0; i < 3; i++) {
    await page.locator(".choice input").first().check();
    await page.getByRole("button", { name: "Continue" }).click();
  }
});
await audit("plan composed (P1)", `${BASE}/plan#${encode(byId("P1"))}`);
await audit("plan bilateral capped (P3)", `${BASE}/plan#${encode(byId("P3"))}`);
await audit("plan overload (P2)", `${BASE}/plan#${encode(byId("P2"))}`);
await audit("plan referral (P7)", `${BASE}/plan#${encode(byId("P7"))}`);

// -- print sheet: emulate print media, estimate page count -------------------
const page = await context.newPage();
await page.setViewportSize({ width: 794, height: 1123 }); // A4 @ 96dpi
await page.goto(`${BASE}/plan#${encode(byId("P1"))}`, { waitUntil: "domcontentloaded" });
await page.waitForTimeout(800);
await page.emulateMedia({ media: "print" });
const sheetHeight = await page.evaluate(() => {
  const el = document.querySelector(".print-sheet");
  return el ? el.getBoundingClientRect().height : -1;
});
const qrDrawn = await page.evaluate(() => {
  const c = document.querySelector(".print-qr canvas");
  if (!c) return false;
  const ctx = c.getContext("2d");
  const d = ctx.getImageData(0, 0, c.width, c.height).data;
  for (let i = 0; i < d.length; i += 4) if (d[i] < 128) return true;
  return false;
});
// A4 printable height at 12mm margins ≈ 1030 CSS px; ≤2 pages ⇒ ≤ ~2060.
const pages = Math.ceil(sheetHeight / 1030);
console.log(
  `print sheet: height ${Math.round(sheetHeight)}px ≈ ${pages} page(s); QR drawn: ${qrDrawn}`,
);
if (sheetHeight <= 0 || pages > 2 || !qrDrawn) {
  console.log("FAIL  print sheet constraints");
  totalViolations += 1;
}
await page.close();

await browser.close();
server.kill();

if (totalViolations > 0) {
  console.log(`\n${totalViolations} accessibility/print failures`);
  process.exit(1);
}
console.log("\na11y: all screens clean; print sheet within budget");
