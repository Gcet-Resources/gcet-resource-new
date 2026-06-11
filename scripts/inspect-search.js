const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.goto("http://localhost:8080");
  try {
    await page.click('button:has-text("Search...")');
  } catch (e) {}
  try {
    await page.keyboard.press("Control+K");
  } catch (e) {}
  await page.waitForTimeout(1000);
  const html = await page.content();
  console.log(html.slice(0, 8000));
  await browser.close();
})();
