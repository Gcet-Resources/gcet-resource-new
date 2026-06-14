import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  webServer: {
    command: "npm run dev -- --host",
    url: "http://localhost:8080",
    reuseExistingServer: true,
    timeout: 120000,
  },
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: "http://localhost:8080",
    ignoreHTTPSErrors: true,
  },
  retries: 0,
});
