import fs from "fs";
import { chromium } from "playwright";

(async () => {
  const headless = process.env.HEAD === "true" ? false : true;
  const browser = await chromium.launch({ headless });
  const page = await browser.newPage();
  const consolePath = "/tmp/pdf-console.log";
  const errorPath = "/tmp/pdf-errors.log";
  const consoleLines = [];
  page.on("console", (msg) => {
    try {
      consoleLines.push(`${msg.type()}: ${msg.text()}`);
    } catch (e) {}
  });
  const pageErrors = [];
  page.on("pageerror", (err) => {
    pageErrors.push(String(err));
  });
  const url =
    process.env.URL || "http://localhost:8080/resources/1st/BAS101/pdf-notes";
  console.log("Opening", url);
  await page.goto(url, { waitUntil: "networkidle" });
  // wait for the subjects grid
  await page.waitForSelector(".grid", { timeout: 10000 });
  // click first subject card
  const card = await page.$(".grid .cursor-pointer");
  if (!card) {
    console.error("No subject card found");
    await browser.close();
    process.exit(2);
  }
  await card.click();
  // wait for the PdfViewer canvas or iframe
  try {
    await page.waitForSelector("canvas, iframe", { timeout: 15000 });
    const el = await page.$("canvas, iframe");
    const screenshotPath = "/tmp/pdf-viewer-snap.png";
    await el.screenshot({ path: screenshotPath });
    console.log("Saved screenshot to", screenshotPath);
  } catch (e) {
    console.error("Viewer did not appear:", e.message);
    // dump page HTML to /tmp/pdf-page.html
    // write console and page errors
    try {
      fs.writeFileSync(consolePath, consoleLines.join("\n"));
      console.log("Wrote console log to", consolePath);
    } catch (ex) {}
    try {
      fs.writeFileSync(errorPath, pageErrors.join("\n"));
      console.log("Wrote page errors to", errorPath);
    } catch (ex) {}
    const html = await page.content();
    fs.writeFileSync("/tmp/pdf-page.html", html);
    console.log("Wrote page HTML to /tmp/pdf-page.html");
    await browser.close();
    process.exit(3);
  }

  await browser.close();
  process.exit(0);
})();
