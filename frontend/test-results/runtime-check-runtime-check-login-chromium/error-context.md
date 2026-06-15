# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: runtime-check.spec.ts >> runtime check: /login
- Location: tests/runtime-check.spec.ts:29:3

# Error details

```
Error: main content on /login

expect(received).not.toBeNull()

Received: null
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - link "Skip to main content" [ref=e3] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e5]:
    - heading "Student login" [level=2] [ref=e6]
    - generic [ref=e7]:
      - generic [ref=e8]: College Email
      - textbox "you@galgotiacollege.edu" [ref=e9]
      - button "Continue" [ref=e11] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | const ALL_ROUTES = [
  4  |   "/",
  5  |   "/about",
  6  |   "/contact",
  7  |   "/support",
  8  |   "/year-selection",
  9  |   "/resources/1st",
  10 |   "/resources/1st/BAS101",
  11 |   "/resources/1st/BAS103/pdf-notes",
  12 |   "/resources/2nd",
  13 |   "/resources/3rd",
  14 |   "/resources/4th",
  15 |   "/youtube-resources",
  16 |   "/youtube-resources/academic",
  17 |   "/youtube-resources/non-academic",
  18 |   "/coding-resources",
  19 |   "/coding-resources/dsa",
  20 |   "/coding-resources/projects",
  21 |   "/essentials",
  22 |   "/notice-board",
  23 |   "/login",
  24 |   "/admin/approvals",
  25 |   "/some/nonexistent/path",
  26 | ];
  27 | 
  28 | for (const route of ALL_ROUTES) {
  29 |   test(`runtime check: ${route}`, async ({ page }) => {
  30 |     const errors: string[] = [];
  31 |     page.on("pageerror", (err) => {
  32 |       errors.push(`pageerror: ${err.message}\n${err.stack?.slice(0, 200)}`);
  33 |     });
  34 |     page.on("console", (msg) => {
  35 |       if (msg.type() === "error") {
  36 |         errors.push(`console.error: ${msg.text()}`);
  37 |       }
  38 |     });
  39 | 
  40 |     const resp = await page.goto(route, { waitUntil: "networkidle" });
  41 |     expect(resp && resp.ok()).toBeTruthy();
  42 | 
  43 |     // Extra wait for lazy-loaded components
  44 |     await page.waitForTimeout(1000);
  45 | 
  46 |     // Check for React rendering errors in the DOM
  47 |     const errorOverlay = await page.$("vite-error-overlay, react-error-overlay");
  48 |     if (errorOverlay) {
  49 |       const text = await errorOverlay.textContent();
  50 |       errors.push(`Error overlay found: ${text?.slice(0, 500)}`);
  51 |     }
  52 | 
  53 |     // Only flag real runtime errors, not warnings
  54 |     const runtimeErrors = errors.filter(
  55 |       (e) => !e.startsWith("console.warn:")
  56 |     );
  57 | 
  58 |     // /admin/approvals is expected to return 403 (auth required)
  59 |     const expectedForbidden = route === "/admin/approvals";
  60 |     if (expectedForbidden) {
  61 |       const filtered = runtimeErrors.filter(
  62 |         (e) => !e.includes("403") && !e.includes("Forbidden")
  63 |       );
  64 |       expect(filtered, `Runtime errors on ${route}`).toEqual([]);
  65 |     } else {
  66 |       expect(runtimeErrors, `Runtime errors on ${route}`).toEqual([]);
  67 |     }
  68 | 
  69 |     // Verify main content exists (admin page may not have main without auth)
  70 |     if (!expectedForbidden) {
  71 |       const main = await page.$("main#main-content, main");
> 72 |       expect(main, `main content on ${route}`).not.toBeNull();
     |                                                    ^ Error: main content on /login
  73 |     }
  74 |   });
  75 | }
```