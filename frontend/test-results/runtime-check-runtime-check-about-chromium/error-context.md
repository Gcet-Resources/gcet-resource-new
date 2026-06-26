# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: runtime-check.spec.ts >> runtime check: /about
- Location: tests/runtime-check.spec.ts:29:3

# Error details

```
Error: main content on /about

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
    - generic [ref=e29]:
      - generic [ref=e30]: Our Team
      - heading "Passing the Legacy" [level=1] [ref=e31]
      - paragraph [ref=e32]: We're a dedicated team of seniors and upcoming juniors working together to build and maintain quality educational resources for GCET students.
    - generic [ref=e33]:
      - generic [ref=e34]:
        - generic [ref=e35]:
          - heading "The Leads" [level=2] [ref=e36]: The Leads
          - paragraph [ref=e39]: The founding team passing on the torch
        - generic [ref=e40]:
          - generic [ref=e41]:
            - img "Gulshan Yadav" [ref=e46]
            - generic [ref=e47]:
              - heading "Gulshan Yadav" [level=3] [ref=e48]
              - paragraph [ref=e49]: Product Lead
              - generic [ref=e50]:
                - link [ref=e51] [cursor=pointer]:
                  - /url: https://github.com/gulshan214
                  - img [ref=e52]
                - link [ref=e55] [cursor=pointer]:
                  - /url: https://www.instagram.com/gulshan_214
                  - img [ref=e56]
                - link [ref=e59] [cursor=pointer]:
                  - /url: https://www.linkedin.com/in/gulshan-yadav04/
                  - img [ref=e60]
          - generic [ref=e64]:
            - img "Anshul Kushwaha" [ref=e69]
            - generic [ref=e70]:
              - heading "Anshul Kushwaha" [level=3] [ref=e71]
              - paragraph [ref=e72]: Engineering Lead
              - generic [ref=e73]:
                - link [ref=e74] [cursor=pointer]:
                  - /url: https://github.com/sudo-anshul
                  - img [ref=e75]
                - link [ref=e78] [cursor=pointer]:
                  - /url: https://www.instagram.com/sudo_anshul/
                  - img [ref=e79]
                - link [ref=e82] [cursor=pointer]:
                  - /url: https://www.linkedin.com/in/anshul-kushwaha
                  - img [ref=e83]
          - generic [ref=e87]:
            - img "Harshita" [ref=e92]
            - generic [ref=e93]:
              - heading "Harshita" [level=3] [ref=e94]
              - paragraph [ref=e95]: Design Lead
              - generic [ref=e96]:
                - link [ref=e97] [cursor=pointer]:
                  - /url: https://github.com/HARSHITA2450
                  - img [ref=e98]
                - link [ref=e101] [cursor=pointer]:
                  - /url: https://www.instagram.com/hyhh.harshita.124?utm_source=qr&igsh=MTR4OHFmZzhkMzlr
                  - img [ref=e102]
                - link [ref=e105] [cursor=pointer]:
                  - /url: https://www.linkedin.com/in/harshita-pandey-4b322a274?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app
                  - img [ref=e106]
          - generic [ref=e110]:
            - img "Himanshu Srivastava" [ref=e115]
            - generic [ref=e116]:
              - heading "Himanshu Srivastava" [level=3] [ref=e117]
              - paragraph [ref=e118]: Content Lead
              - generic [ref=e119]:
                - link [ref=e120] [cursor=pointer]:
                  - /url: https://github.com/travor21
                  - img [ref=e121]
                - img [ref=e125]
                - link [ref=e128] [cursor=pointer]:
                  - /url: https://www.linkedin.com/in/himanshu-srivastava-276929280?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app
                  - img [ref=e129]
          - generic [ref=e133]:
            - img "Aditya Kumar Gupta" [ref=e138]
            - generic [ref=e139]:
              - heading "Aditya Kumar Gupta" [level=3] [ref=e140]
              - paragraph [ref=e141]: Operations Lead
              - generic [ref=e142]:
                - link [ref=e143] [cursor=pointer]:
                  - /url: https://github.com/Aditya05-max
                  - img [ref=e144]
                - img [ref=e148]
                - link [ref=e151] [cursor=pointer]:
                  - /url: https://www.linkedin.com/in/aditya-kumar-786302314/
                  - img [ref=e152]
          - generic [ref=e156]:
            - img "Vinayak Sonthalia" [ref=e161]
            - generic [ref=e162]:
              - heading "Vinayak Sonthalia" [level=3] [ref=e163]
              - paragraph [ref=e164]: Community Lead
              - generic [ref=e165]:
                - link [ref=e166] [cursor=pointer]:
                  - /url: https://github.com/vinayaksonthalia
                  - img [ref=e167]
                - img [ref=e171]
                - link [ref=e174] [cursor=pointer]:
                  - /url: https://in.linkedin.com/in/vinayak-sonthalia-b472411b7
                  - img [ref=e175]
      - generic [ref=e179]:
        - generic [ref=e181]:
          - heading "The Next Generation" [level=2] [ref=e182]
          - paragraph [ref=e183]: Upcoming leaders carrying the vision forward
        - generic [ref=e184]:
          - generic [ref=e185]:
            - generic [ref=e186]:
              - img [ref=e188]
              - generic [ref=e191]:
                - heading "Junior Developer" [level=3] [ref=e192]
                - paragraph [ref=e193]: Assistant Developer
            - generic [ref=e195]: Incoming
          - generic [ref=e196]:
            - generic [ref=e197]:
              - img [ref=e199]
              - generic [ref=e202]:
                - heading "Junior Developer" [level=3] [ref=e203]
                - paragraph [ref=e204]: Assistant Developer
            - generic [ref=e206]: Incoming
          - generic [ref=e207]:
            - generic [ref=e208]:
              - img [ref=e210]
              - generic [ref=e213]:
                - heading "Junior Designer" [level=3] [ref=e214]
                - paragraph [ref=e215]: Assistant Designer
            - generic [ref=e217]: Incoming
          - generic [ref=e218]:
            - generic [ref=e219]:
              - img [ref=e221]
              - generic [ref=e224]:
                - heading "Junior Content" [level=3] [ref=e225]
                - paragraph [ref=e226]: Assistant Resource Manager
            - generic [ref=e228]: Incoming
          - generic [ref=e229]:
            - generic [ref=e230]:
              - img [ref=e232]
              - generic [ref=e235]:
                - heading "Junior Operations" [level=3] [ref=e236]
                - paragraph [ref=e237]: Assistant Resource Manager
            - generic [ref=e239]: Incoming
          - generic [ref=e240]:
            - generic [ref=e241]:
              - img [ref=e243]
              - generic [ref=e246]:
                - heading "Junior Community" [level=3] [ref=e247]
                - paragraph [ref=e248]: Assistant Resource Manager
            - generic [ref=e250]: Incoming
    - contentinfo [ref=e251]:
      - generic [ref=e253]:
        - generic [ref=e254]:
          - link "GCET Resources" [ref=e255] [cursor=pointer]:
            - /url: /
            - heading "GCET Resources" [level=3] [ref=e256]
          - paragraph [ref=e257]: Your one-stop destination for quality educational resources. Helping GCET students excel in their academic journey.
          - generic [ref=e258]:
            - link "WhatsApp" [ref=e259] [cursor=pointer]:
              - /url: https://chat.whatsapp.com/CKrN5kPTBqz1wcNruhBSAG
              - img [ref=e260]
            - link "Email" [ref=e262] [cursor=pointer]:
              - /url: mailto:gcetresources@gmail.com
              - img [ref=e263]
        - generic [ref=e267]:
          - link "Request Resource" [ref=e268] [cursor=pointer]:
            - /url: mailto:gcetresources@gmail.com?subject=Resource%20Request&body=Hi%20Team,%0A%0AI%20would%20like%20to%20request%20the%20following%20resource:%0A%0ASubject:%20%0AYear:%20%0AResource%20Type:%20%0A%0AThank%20you!
            - img [ref=e269]
            - text: Request Resource
          - link "Contribute Resource" [ref=e272] [cursor=pointer]:
            - /url: mailto:gcetresources@gmail.com?subject=Resource%20Contribution&body=Hi%20Team,%0A%0AI%20would%20like%20to%20contribute%20the%20following%20resource:%0A%0ASubject:%20%0AYear:%20%0AResource%20Type:%20%0AGoogle%20Drive%20Link:%20%0A%0AThank%20you!
            - img [ref=e273]
            - text: Contribute Resource
      - generic [ref=e277]:
        - img [ref=e278]
        - generic [ref=e280]:
          - heading "Content Disclaimer & Fair Use Notice" [level=5] [ref=e281]
          - paragraph [ref=e282]:
            - text: GCET Resources is a community-driven educational platform created by students, for students.
            - strong [ref=e283]: We do not own or claim ownership of any educational content displayed on this website.
            - text: All study materials, notes, previous year questions, and other resources are sourced from various publicly available platforms, educators, and contributors. The original content creators and copyright holders retain all rights to their respective materials.
          - paragraph [ref=e284]:
            - text: This platform operates under the principles of
            - strong [ref=e285]: fair use for educational purposes
            - text: . We respect intellectual property rights and are committed to removing any content upon valid request from rightful owners. If you believe any content infringes your copyright, please contact us at
            - link "gcetresources@gmail.com" [ref=e286] [cursor=pointer]:
              - /url: mailto:gcetresources@gmail.com
            - text: with relevant details, and we will promptly address your concerns.
      - paragraph [ref=e289]:
        - text: © 2026 GCET Resources. Made with
        - img [ref=e290]
        - text: for GCET students.
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
     |                                                    ^ Error: main content on /about
  73 |     }
  74 |   });
  75 | }
```