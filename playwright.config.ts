import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    // Playwright's own Chromium download is geo-blocked in this environment
    // (403 from cdn.playwright.dev); use the system-installed Edge instead.
    { name: "msedge", use: { ...devices["Desktop Edge"], channel: "msedge" } },
  ],
});
