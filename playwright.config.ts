import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 800 },
    baseURL: "http://localhost:8080",
    ignoreHTTPSErrors: true,
  },
  retries: 0,
});
