# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: runtime-check.spec.ts >> runtime check: /coding-resources/projects
- Location: tests/runtime-check.spec.ts:29:3

# Error details

```
Error: main content on /coding-resources/projects

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
  - generic [ref=e4]:
    - navigation [ref=e5]:
      - generic [ref=e7]:
        - link "GCET Resources" [ref=e8] [cursor=pointer]:
          - /url: /
          - generic [ref=e9]: GCET Resources
        - generic [ref=e10]:
          - link "Home" [ref=e11] [cursor=pointer]:
            - /url: /
          - link "Resources" [ref=e12] [cursor=pointer]:
            - /url: /year-selection
          - link "Notice Board" [ref=e13] [cursor=pointer]:
            - /url: /notice-board
          - link "About Us" [ref=e14] [cursor=pointer]:
            - /url: /about
          - link "Contact" [ref=e15] [cursor=pointer]:
            - /url: /contact
          - link "Support" [ref=e16] [cursor=pointer]:
            - /url: /support
          - button "Search... ⌘K" [ref=e17] [cursor=pointer]:
            - img [ref=e18]
            - generic [ref=e21]: Search...
            - generic [ref=e22]: ⌘K
          - button "Switch to dark mode" [ref=e23] [cursor=pointer]:
            - img [ref=e24]
          - link "Login" [ref=e26] [cursor=pointer]:
            - /url: /login
    - generic [ref=e27]:
      - heading "Student Projects" [level=1] [ref=e28]
      - generic [ref=e29]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - img [ref=e33]
            - heading "Student Portfolio" [level=3] [ref=e38]
          - paragraph [ref=e39]: A responsive portfolio website built with React and Tailwind CSS
          - generic [ref=e40]:
            - generic [ref=e41]:
              - generic [ref=e42]: React
              - generic [ref=e43]: Tailwind
              - generic [ref=e44]: TypeScript
            - link "View on GitHub" [ref=e45] [cursor=pointer]:
              - /url: https://github.com/sample/project1
              - img [ref=e46]
              - text: View on GitHub
        - generic [ref=e50]:
          - generic [ref=e51]:
            - img [ref=e52]
            - heading "Task Manager" [level=3] [ref=e57]
          - paragraph [ref=e58]: A full-stack task management application with authentication
          - generic [ref=e59]:
            - generic [ref=e60]:
              - generic [ref=e61]: Next.js
              - generic [ref=e62]: MongoDB
              - generic [ref=e63]: Express
            - link "View on GitHub" [ref=e64] [cursor=pointer]:
              - /url: https://github.com/sample/project2
              - img [ref=e65]
              - text: View on GitHub
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
     |                                                    ^ Error: main content on /coding-resources/projects
  73 |     }
  74 |   });
  75 | }
```