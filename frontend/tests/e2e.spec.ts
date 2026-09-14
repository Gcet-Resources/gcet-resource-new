import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  "/",
  "/year-selection",
  "/resources/1st",
  "/resources/1st/BAS101",
  "/notices",
  "/clubs",
  "/login",
  "/account",
  "/admin",
  "/publish",
  "/dashboard",
  "/essentials",
  "/about",
  "/contact",
  "/support",
  "/coding-resources",
  "/coding-resources/dsa",
  "/coding-resources/projects",
  "/youtube-resources",
  "/youtube-resources/academic",
  "/youtube-resources/non-academic",
];

for (const route of routes) {
  test(`route renders meaningful accessible content: ${route}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator("main#main-content")).toBeVisible();
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator("main")).not.toContainText(
      "Something went wrong",
    );
    expect(errors).toEqual([]);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        description: v.description,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  });
}

test("unknown route and invalid year/subject show 404", async ({ page }) => {
  for (const route of [
    "/does-not-exist",
    "/resources/5th",
    "/resources/1st/NO-SUCH-SUBJECT",
  ]) {
    await page.goto(route);
    await expect(
      page.getByRole("heading", { name: "404", exact: true }),
    ).toBeVisible();
  }
});

test("legacy notice and admin URLs resolve to current pages", async ({
  page,
}) => {
  await page.goto("/notice-board");
  await expect(page).toHaveURL(/\/notices$/);
  await expect(
    page.getByRole("heading", { name: "The campus noticeboard." }),
  ).toBeVisible();
  await page.goto("/admin/approvals");
  await expect(page).toHaveURL(/\/admin$/);
});

test("mobile navigation and pages fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const route of ["/", "/resources/1st", "/notices", "/clubs", "/login"]) {
    await page.goto(route);
    await expect(page.locator("main h1").first()).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto("/");
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Notices", exact: true })
    .click();
  await expect(page).toHaveURL(/\/notices$/);
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation" }),
  ).toHaveCount(0);
});
