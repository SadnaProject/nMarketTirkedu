import { type PlaywrightTestConfig, devices } from "@playwright/test";

const baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";
console.log(`ℹ️ Using base URL "${baseUrl}"`);

const opts = {
  // launch headless on CI, in browser locally
  headless: true, //!!process.env.CI || !!process.env.PLAYWRIGHT_HEADLESS,
  // collectCoverage: !!process.env.PLAYWRIGHT_HEADLESS
  video: "on",
} as const;
const config: PlaywrightTestConfig = {
  testDir: "./src/e2e",
  fullyParallel: true,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: baseUrl,
    ...opts,
  },
};

export default config;
