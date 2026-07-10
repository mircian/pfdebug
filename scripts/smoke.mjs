/**
 * End-to-end smoke pass against the built site (dist/ via `astro preview`):
 *  - every core route renders,
 *  - every engine output route (D0, D0_soft, composed, D5, D4) renders the
 *    correct copy from a real payload,
 *  - unit toggle converts thresholds,
 *  - returning-visitor landing appears when pfdebug.lastResult exists,
 *  - zero console errors anywhere.
 *
 * Usage: node scripts/smoke.mjs [--shots <dir>]
 */
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import lz from "lz-string";
import { chromium } from "playwright";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtures = JSON.parse(
  readFileSync(path.join(root, "src/engine/fixtures/pfdebug-personas.fixtures.json"), "utf8"),
);
const shotsDir = (() => {
  const i = process.argv.indexOf("--shots");
  return i === -1 ? null : process.argv[i + 1];
})();

const encode = (input, extra = {}) =>
  "v1." + lz.compressToEncodedURIComponent(JSON.stringify({ input, date: "2026-07-10", ...extra }));

const byId = (id) => fixtures.cases.find((c) => c.id === id).input;

const PORT = 4173;
const BASE = `http://localhost:${PORT}`;

// -- start preview server ----------------------------------------------------
const server = spawn(path.join(root, "node_modules/.bin/astro"), ["preview", "--port", String(PORT)], {
  cwd: root,
  stdio: "pipe",
});
await new Promise((resolve, reject) => {
  const t = setTimeout(() => reject(new Error("preview server timeout")), 30000);
  server.stdout.on("data", (d) => {
    if (String(d).includes(String(PORT))) {
      clearTimeout(t);
      resolve();
    }
  });
  server.on("exit", () => reject(new Error("preview exited early")));
});

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const failures = [];
const consoleErrors = [];

async function check(name, url, assertions, shotName) {
  const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    // Third-party resources (Google Fonts, Plausible) are blocked by the
    // sandbox's egress proxy; that's an environment artifact, not an app
    // error. First-party failures and script errors still count.
    const loc = msg.location()?.url ?? "";
    const text = msg.text();
    if (/Failed to load resource/.test(text) && !loc.includes("localhost")) return;
    consoleErrors.push(`${name}: ${text}`);
  });
  page.on("pageerror", (err) => consoleErrors.push(`${name}: ${err.message}`));
  await page.goto(url, { waitUntil: "networkidle" });
  try {
    await assertions(page);
    console.log(`ok    ${name}`);
  } catch (e) {
    failures.push(`${name}: ${e.message}`);
    console.log(`FAIL  ${name}: ${e.message}`);
  }
  if (shotsDir && shotName) {
    await page.screenshot({ path: path.join(shotsDir, shotName), fullPage: true });
  }
  await page.close();
}

const expectText = async (page, text) => {
  const found = await page.getByText(text, { exact: false }).first().isVisible();
  if (!found) throw new Error(`missing text: "${text.slice(0, 60)}..."`);
};

// -- landing, new visitor ------------------------------------------------------
await check("landing (new visitor)", `${BASE}/`, async (page) => {
  await expectText(page, "Find out what's actually driving your heel pain.");
  await expectText(page, "Start the check");
  await expectText(page, "Rathleff 2015");
}, "landing-new.png");

// -- assessment intro ----------------------------------------------------------
await check("assessment intro", `${BASE}/assessment`, async (page) => {
  await expectText(page, "This is a self-check, not a diagnosis.");
  await expectText(page, "Begin");
}, "assessment-intro.png");

// -- /plan with no fragment ------------------------------------------------------
await check("plan (no result)", `${BASE}/plan`, async (page) => {
  await expectText(page, "No result to show yet.");
});

// -- engine output routes ----------------------------------------------------------
await check("plan D2 composed (P1: capacity headline)", `${BASE}/plan#${encode(byId("P1"))}`, async (page) => {
  await expectText(page, "Here's what we found — and what to do about it.");
  await expectText(page, "Why this is your priority:");
  await expectText(page, "painful side 11 reps vs 18 on the other side");
  await expectText(page, "Heel raise with a towel under your toes");
  await expectText(page, "Knee-to-wall ankle mobilization");
  await expectText(page, "What set this off:");
}, "plan-p1.png");

await check("plan D2 (P3: bilateral, flag cap)", `${BASE}/plan#${encode(byId("P3"))}`, async (page) => {
  await expectText(page, "About your calf strength:");
  await expectText(page, "at your body weight the simple rep benchmark");
  await expectText(page, "Also worth addressing");
  await expectText(page, "Extra body weight loads the fascia every step");
}, "plan-p3.png");

await check("plan D2 (P4: joint referral, no Ex2)", `${BASE}/plan#${encode(byId("P4"))}`, async (page) => {
  await expectText(page, "Your ankle needs hands, not reps.");
  const ex2 = await page.getByText("Exercise 2 — Knee-to-wall ankle mobilization").count();
  if (ex2 > 0) throw new Error("Exercise 2 must be suppressed for joint subtype");
}, "plan-p4.png");

await check("plan D2 (P5: skipped capacity note)", `${BASE}/plan#${encode(byId("P5"))}`, async (page) => {
  await expectText(page, "One thing we couldn't test today:");
  await expectText(page, "within range (21 reps)");
  await expectText(page, "on your feet most of the day");
}, "plan-p5.png");

await check("plan D5 overload (P2)", `${BASE}/plan#${encode(byId("P2"))}`, async (page) => {
  await expectText(page, "Good news: nothing's broken. You did too much, too soon.");
  await expectText(page, "painful side 30 reps vs 34, both strong");
  await expectText(page, "textbook lag");
}, "plan-p2.png");

await check("plan D4 no-clear-driver (P8)", `${BASE}/plan#${encode(byId("P8"))}`, async (page) => {
  await expectText(page, "Good news, and an honest answer.");
  await expectText(page, "your calf strength is solid (23 reps)");
}, "plan-p8.png");

await check("plan D0_soft (P6)", `${BASE}/plan#${encode(byId("P6"))}`, async (page) => {
  await expectText(page, "This might not be plantar fasciitis.");
  await expectText(page, "points more toward the Achilles");
}, "plan-p6.png");

await check("plan D0 referral (P7)", `${BASE}/plan#${encode(byId("P7"))}`, async (page) => {
  await expectText(page, "Let's get you to the right person first.");
  await expectText(page, "your diabetes with reduced feeling in your feet");
  const share = await page.getByText("Share my plan").count();
  if (share > 0) throw new Error("share must not render on the referral page");
}, "plan-p7.png");

// -- hedged note (fit score 1-2) -----------------------------------------------------
const hedgedInput = { ...byId("P8"), thumbPress: "tender_not_the_pain", worstWhen: ["morning_first_steps"] };
await check("plan hedged note", `${BASE}/plan#${encode(hedgedInput)}`, async (page) => {
  await expectText(page, "your pain fits");
  await expectText(page, "but not all of it");
});

// -- retest delta -----------------------------------------------------------------------
const retestPayload = encode(byId("P1"), {
  prev: {
    kneeToWall: { left_cm: 6.5, right_cm: 11 },
    heelRaise: { goodReps: 18, painfulReps: 8 },
    date: "2026-05-29",
  },
});
await check("plan retest delta", `${BASE}/plan#${retestPayload}`, async (page) => {
  await expectText(page, "Left calf: 8 → 11 reps in 6 weeks.");
}, "plan-retest.png");

// -- unit toggle: threshold converts, canonical stays --------------------------------------
await check("unit toggle converts", `${BASE}/plan#${encode(byId("P1"))}`, async (page) => {
  await page.getByRole("button", { name: "in·lb" }).click();
  await expectText(page, "~4 in");
  await expectText(page, "3.1 in"); // left 8 cm
  await page.getByRole("button", { name: "cm·kg" }).click();
  await expectText(page, "10 cm");
}, "plan-imperial.png");

// -- returning visitor landing ---------------------------------------------------------------
await check("landing (returning visitor)", `${BASE}/`, async (page) => {
  await page.evaluate((p) => localStorage.setItem("pfdebug.lastResult", p), encode(byId("P1")));
  await page.reload({ waitUntil: "networkidle" });
  await expectText(page, "Welcome back.");
  await expectText(page, "View my plan");
  await expectText(page, "Retest");
}, "landing-returning.png");

// ------------------------------------------------------------------------------------------------
await browser.close();
server.kill();

if (consoleErrors.length) {
  console.log("\nCONSOLE ERRORS:");
  for (const e of consoleErrors) console.log("  " + e);
}
if (failures.length || consoleErrors.length) {
  console.log(`\n${failures.length} failures, ${consoleErrors.length} console errors`);
  process.exit(1);
}
console.log("\nsmoke: all green, zero console errors");
