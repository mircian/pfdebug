/**
 * Generates the single static OG card (public/og.png) — tick-mark identity +
 * the 15-minute promise. One card for all shares by design: personalized
 * results live in URL fragments and never reach a server (BUILD.md §4/§7).
 *
 * Usage: node scripts/generate-og.mjs
 */
import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import path from "node:path";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "og.png");

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600&family=IBM+Plex+Mono:wght@500&family=Public+Sans:wght@400&display=swap">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; background: #FAFAF7; color: #1F2E35;
         font-family: "Public Sans", sans-serif; padding: 72px 80px; position: relative; }
  .wordmark { font-family: "IBM Plex Mono", monospace; font-weight: 500; font-size: 40px; }
  h1 { font-family: "Bricolage Grotesque", sans-serif; font-weight: 600; font-size: 72px;
       line-height: 1.08; letter-spacing: -0.01em; margin-top: 110px; max-width: 1000px; }
  .promise { font-size: 32px; color: #5C6B72; margin-top: 36px; }
  .promise strong { color: #0E7C6B; font-weight: 600; }
  .ruler { position: absolute; left: 80px; right: 80px; top: 150px; height: 26px;
           border-bottom: 3px solid #1F2E35; }
  .ruler i { position: absolute; bottom: 0; width: 2px; background: #5C6B72; height: 12px; }
  .ruler i.major { height: 24px; background: #1F2E35; }
  .ruler i.mark { background: #0E7C6B; }
  .pointer { position: absolute; top: 176px; left: 62%;
             width: 0; height: 0; border-left: 12px solid transparent;
             border-right: 12px solid transparent; border-bottom: 18px solid #0E7C6B; }
</style></head>
<body>
  <div class="wordmark">pfdebug</div>
  <div class="ruler" id="ruler"></div>
  <div class="pointer"></div>
  <h1>Find out what's actually driving your heel pain.</h1>
  <p class="promise">A <strong>15-minute self-check</strong> · three exercises backed by trials · free, no signup</p>
  <script>
    const r = document.getElementById('ruler');
    for (let i = 0; i <= 80; i++) {
      const t = document.createElement('i');
      t.style.left = (i / 80 * 100) + '%';
      if (i % 10 === 0) t.className = 'major';
      if (i / 80 > 0.60 && i / 80 < 0.65) t.className += ' mark';
      r.appendChild(t);
    }
  </script>
</body></html>`;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: out });
await browser.close();
console.log(`wrote ${out}`);
