// Fault injection happens only in the test browser's downloaded asset.
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  await page.addInitScript(() => {
    let calls = 0;
    window.__qaSource = async (data) => {
      await new Promise((r) => setTimeout(r, 300));
      if (calls++ === 0) throw new Error("Simulated source failure");
      return structuredClone(data);
    };
  });
  await page.route("**/assets/*.js", async (route) => {
    const response = await route.fetch();
    const text = await response.text();
    assert.match(text, /structuredClone\(\w+\)/);
    await route.fulfill({
      response,
      body: text.replace(
        /structuredClone\((\w+)\)/,
        "await window.__qaSource($1)",
      ),
    });
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
  console.log("Loading, source error and successful retry: passed");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
