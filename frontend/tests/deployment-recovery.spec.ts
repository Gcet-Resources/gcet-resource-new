import { test, expect, type Page } from "@playwright/test";

// Exercise real Vite imports instead of allowing PWA precaching to serve them.
test.use({ serviceWorkers: "block" });
const loginChunk = /\/assets\/Login-[^/]+\.js$/;
const loginDestination = "/login?next=%2Fdashboard#security";

function documentRequests(page: Page) {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (
      request.isNavigationRequest() &&
      request.frame() === page.mainFrame()
    ) {
      requests.push(request.url());
    }
  });
  return requests;
}

async function expectSignIn(page: Page) {
  await expect(
    page.getByRole("heading", {
      name: "Sign in or create an account",
      exact: true,
    }),
  ).toBeVisible();
}

test("a failed lazy Login import reloads once and recovers the clicked destination", async ({
  page,
}) => {
  const documents = documentRequests(page);
  let imports = 0;
  await page.route(loginChunk, (route) =>
    ++imports === 1 ? route.abort("failed") : route.continue(),
  );
  await page.goto("/");
  await page.getByRole("link", { name: "College sign in", exact: true }).click();
  await expectSignIn(page);
  await expect(page).toHaveURL(/\/login$/);
  expect(imports).toBe(2);
  expect(documents.map((url) => new URL(url).pathname)).toEqual(["/", "/login"]);
  expect(
    await page.evaluate(
      () => (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type,
    ),
  ).toBe("reload");
});

test("chunk recovery preserves a direct sign-in link's query and fragment", async ({
  page,
}) => {
  const documents = documentRequests(page);
  let imports = 0;
  await page.route(loginChunk, (route) =>
    ++imports === 1 ? route.abort("failed") : route.continue(),
  );
  await page.goto(loginDestination, { waitUntil: "commit" });
  await expectSignIn(page);
  await expect(page).toHaveURL(`http://127.0.0.1:8080${loginDestination}`);
  expect(imports).toBe(2);
  expect(documents).toHaveLength(2);
});

test("a repeated import failure stops automatic reloads and preserves manual retry", async ({
  page,
}) => {
  const documents = documentRequests(page);
  let imports = 0;
  let unavailable = true;
  await page.route(loginChunk, (route) => {
    imports += 1;
    return unavailable ? route.abort("failed") : route.continue();
  });
  await page.goto(loginDestination, { waitUntil: "commit" });
  await expect.poll(() => imports).toBe(2);
  await expect(
    page.getByRole("heading", { name: "Something interrupted this page" }),
  ).toBeVisible();
  expect(documents).toHaveLength(2);

  unavailable = false;
  await page.getByRole("button", { name: "Reload page", exact: true }).click();
  await expectSignIn(page);
  await expect(page).toHaveURL(`http://127.0.0.1:8080${loginDestination}`);
  expect(imports).toBe(3);
  expect(documents).toHaveLength(3);
});

test("an offline import failure keeps manual recovery available without reloading", async ({
  page,
  context,
}) => {
  const documents = documentRequests(page);
  await page.goto("/");
  const signIn = page.getByRole("link", { name: "College sign in", exact: true });
  await expect(signIn).toBeVisible();
  await context.setOffline(true);
  await signIn.click();
  await expect(
    page.getByRole("heading", { name: "Something interrupted this page" }),
  ).toBeVisible();
  expect(documents).toHaveLength(1);

  await context.setOffline(false);
  await page.getByRole("button", { name: "Reload page", exact: true }).click();
  await expectSignIn(page);
  expect(documents).toHaveLength(2);
});

test("unavailable session storage prevents automatic reload and retains manual retry", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Storage unavailable", "SecurityError");
      },
    });
  });
  const documents = documentRequests(page);
  let imports = 0;
  await page.route(loginChunk, (route) =>
    ++imports === 1 ? route.abort("failed") : route.continue(),
  );
  await page.goto(loginDestination, { waitUntil: "commit" });
  await expect(
    page.getByRole("heading", { name: "Something interrupted this page" }),
  ).toBeVisible();
  expect(imports).toBe(1);
  expect(documents).toHaveLength(1);

  await page.getByRole("button", { name: "Reload page", exact: true }).click();
  await expectSignIn(page);
  expect(imports).toBe(2);
  expect(documents).toHaveLength(2);
});
