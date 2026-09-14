import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

const pdf = readFileSync(new URL("./fixtures/two-page.pdf", import.meta.url));
const remotePdf =
  "https://www.aktuonline.com/btech/btech-1-sem-engineering-physics-bas101-2023.pdf";
const documentId = "1st/BAS101/aktu-pyq/2022-odd/0";
const documentRoute = `/resources/1st/BAS101/aktu-pyq?document=${encodeURIComponent(documentId)}`;

test("the production PDF worker renders both pages, zooms and reopens a deep link", async ({
  page,
}) => {
  await page.route(remotePdf, (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/pdf",
      headers: { "access-control-allow-origin": "*" },
      body: pdf,
    }),
  );
  await page.goto(documentRoute);
  await expect(page.getByText("Page 1 of 2", { exact: true })).toBeVisible();
  await expect(page.getByText("Loading document…")).not.toBeVisible();
  const canvas = page.locator("canvas");
  await expect
    .poll(() =>
      canvas.evaluate((element) => (element as HTMLCanvasElement).width),
    )
    .toBeGreaterThan(600);
  const firstPage = await canvas.evaluate((element) =>
    (element as HTMLCanvasElement).toDataURL(),
  );
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.getByText("Page 2 of 2", { exact: true })).toBeVisible();
  await expect(page.getByText("Loading document…")).not.toBeVisible();
  await expect
    .poll(() =>
      canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL()),
    )
    .not.toBe(firstPage);
  const width = await canvas.evaluate(
    (element) => (element as HTMLCanvasElement).width,
  );
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  await expect
    .poll(() =>
      canvas.evaluate((element) => (element as HTMLCanvasElement).width),
    )
    .toBeGreaterThan(width);
  await expect(
    page.getByRole("link", { name: "Open original / download" }),
  ).toHaveAttribute("href", remotePdf);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page).not.toHaveURL(/document=/);
  await page.goto(documentRoute);
  await expect(page.getByText("Page 1 of 2", { exact: true })).toBeVisible();
});

test("PDF errors expose retry, external fallback and reporting without claiming success", async ({
  page,
}) => {
  await page.route(remotePdf, (route) =>
    route.fulfill({
      status: 404,
      headers: { "access-control-allow-origin": "*" },
      body: "Missing",
    }),
  );
  await page.goto(documentRoute);
  await expect(page.getByRole("alert")).toContainText(
    "could not load this PDF",
  );
  await expect(
    page.getByRole("link", { name: "Open original / download" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Retry", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Report an issue", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Report a resource issue" }),
  ).toBeVisible();
  await expect(
    page.getByText("Campus services are currently unavailable"),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Send report", exact: true }),
  ).toHaveCount(0);
});

test("an unknown document deep link shows a recoverable unavailable state", async ({
  page,
}) => {
  await page.goto("/resources/1st/BAS101/aktu-pyq?document=does-not-exist");
  await expect(page.getByRole("alert")).toContainText("no longer published");
  await page.getByRole("button", { name: "Dismiss", exact: true }).click();
  await expect(page).not.toHaveURL(/document=/);
});

test("keyboard activation of search clear and close does not navigate to the selected result", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox", { name: "Search query" });
  await input.fill("BAS101");
  await expect(page.getByRole("option").first()).toBeVisible();
  await page.getByRole("button", { name: "Clear search", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(input).toHaveValue("");
  await expect(page).toHaveURL(/\/$/);
  await input.fill("BAS101");
  await page.getByRole("button", { name: "Close search", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(input).toHaveCount(0);
  await expect(page).toHaveURL(/\/$/);
});
