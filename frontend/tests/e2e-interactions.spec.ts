import { test, expect } from "@playwright/test";

test("keyboard search selects an actual subject and restores focus on close", async ({
  page,
}) => {
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Search resources",
    exact: true,
  });
  await trigger.click();
  const search = page.getByRole("combobox", { name: "Search query" });
  await search.fill("BAS101");
  await expect(page.getByRole("option").first()).toContainText("BAS101");
  await search.press("Enter");
  await expect(page).toHaveURL(/\/resources\/1st\/BAS101$/);
  await trigger.click();
  await page.getByRole("button", { name: "Close search" }).click();
  await expect(trigger).toBeFocused();
});

test("theme choice persists across reloads", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("guest saves and removes a subject across reloads", async ({ page }) => {
  await page.goto("/resources/1st/BAS101");
  await page.getByRole("button", { name: "Save subject", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Saved", exact: true }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("button", { name: "Saved", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save subject", exact: true }),
  ).toBeVisible();
});

test("malformed local storage cannot crash a resource page", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("gcet-favorites", "{bad json");
    localStorage.setItem("gcet-recently-viewed:guest", '[null,2,{"id":true}]');
  });
  await page.goto("/resources/1st/BAS101");
  await expect(page.locator("main h1")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Save subject", exact: true }),
  ).toBeVisible();
});

test("subject filter shows a useful empty state", async ({ page }) => {
  await page.goto("/resources/1st");
  await page
    .getByLabel("Filter subjects")
    .fill("NO SUBJECT EXISTS WITH THIS NAME");
  await expect(
    page.getByText("No matching subjects.", { exact: false }),
  ).toBeVisible();
});
