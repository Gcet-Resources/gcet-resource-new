import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/year-selection",
  "/resources/1st",
  "/resources/1st/BAS101",
  "/youtube-resources",
  "/youtube-resources/academic",
  "/notice-board",
  "/some/nonexistent/path",
];

for (const route of ROUTES) {
  test(`visit ${route} without console errors`, async ({ page, baseURL }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => {
      // ignore known build-time token error from Vite client in this environment
      if (err && err.message && err.message.includes("__BUNDLED_DEV__")) return;
      errors.push(`pageerror: ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(`console.error: ${msg.text()}`);
      }
    });

    const resp = await page.goto(route);
    // ensure server served index.html (or route) OK
    expect(resp && resp.ok()).toBeTruthy();

    // wait for network to be idle
    await page.waitForLoadState("networkidle");

    // check there are no console errors
    expect(errors, `Console/page errors on ${route}`).toEqual([]);

    // basic accessibility check: main content exists
    const main = await page.$("main#main-content, main");
    if (!main) {
      const html = await page.content();
      console.log(`PAGE_SNAPSHOT ${route}:`, html.slice(0, 4000));
    }
    expect(main, "main content present").not.toBeNull();
  });
}
