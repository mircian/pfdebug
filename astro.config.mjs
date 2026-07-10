// @ts-check
import { defineConfig } from "astro/config";
import preact from "@astrojs/preact";

// Static output (default). Deployed to Cloudflare Pages as a plain static
// site — no adapter needed; the assessment is a single interactive island.
export default defineConfig({
  site: "https://pfdebug.com",
  integrations: [preact()],
});
