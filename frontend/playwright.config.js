// playwright.config.js
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./src/tests/e2e",
  timeout: 20 * 1000,

  use: {
    headless: true, // IMPORTANT for CI
    baseURL: "http://localhost:3000",
    viewport: { width: 1300, height: 720 },
  },

  projects: [
    { name: "chromium", use: { browserName: "chromium" } },
  ],

  webServer: {
    command: "npm run preview",
    port: 3000,
    reuseExistingServer: true,
    timeout: 120 * 1000,
  },

});
