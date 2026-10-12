const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  let calls = 0;
  await page.route("**/api/catalog", async (route) => {
    if (calls++ === 0) {
      await new Promise((r) => setTimeout(r, 300));
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: '{"error":"Тестовая ошибка источника"}',
      });
    } else await route.continue();
  });
  await page.goto(
    (process.env.BASE_URL || "http://localhost:4180") + "/#city/medical",
  );
  await page.getByRole("heading", { name: "Загружаем город…" }).waitFor();
  await page.getByRole("alert").waitFor();
  await page.getByRole("button", { name: "Повторить загрузку" }).click();
  await page.locator(".city-service-card").first().waitFor();
  assert.equal(await page.locator(".city-service-card").count(), 3);
  assert.equal(await page.getByRole("alert").count(), 0);
  console.log("HTTP API loading/error/retry: passed");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
