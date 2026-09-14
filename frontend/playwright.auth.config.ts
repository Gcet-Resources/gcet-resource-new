import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  outputDir: "./test-results-auth",
  testMatch: "auth-flows.spec.ts",
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    ...devices["Desktop Chrome"],
    baseURL: "http://127.0.0.1:4177",
    headless: true,
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined,
    },
  },
  webServer: {
    command:
      "node node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4177 --strictPort",
    url: "http://127.0.0.1:4177",
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_local_browser_fixture",
      VITE_PHONE_MFA_ENABLED: "true",
      VITE_TURNSTILE_SITE_KEY: "local-captcha-fixture-site-key",
      VITE_GA_ID: "",
    },
  },
});
