const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const base = process.env.BASE_URL || "http://localhost:5197";
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    let attempts = 0;
    // A transparent 1px PNG tests load/retry and native dialog behaviour ONLY, never actual photo content.
    const fixture = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl6hGkAAAAASUVORK5CYII=",
      "base64",
    );
    await page.route("https://upload.wikimedia.org/**", (r) => r.abort());
    await page.route("**/*819*", async (r) => {
      attempts++;
      if (attempts === 1) await r.abort();
      else
        await r.fulfill({
          status: 200,
          contentType: "image/png",
          body: fixture,
        });
    });
    await page.goto(base + "/#photos");
    await page
      .getByRole("heading", { name: "Новоуральск в деталях", exact: true })
      .waitFor();
    await page.locator(".photo-gallery .verified-photo").first().waitFor();
    assert.equal(
      await page.locator(".photo-gallery .verified-photo").count(),
      6,
    );
    const forest = page.locator(".photo-gallery .verified-photo").first();
    await forest
      .getByRole("button", { name: "Повторить загрузку фото", exact: true })
      .click();
    const expand = forest.getByRole("button", { name: /Рассмотреть фото:/ });
    await expand.click();
    await page
      .getByRole("dialog", { name: /Оригинальная фотография:/ })
      .waitFor();
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.equal(
      await expand.evaluate((e) => document.activeElement === e),
      true,
    );
    await expand.click();
    await page
      .getByRole("button", { name: "Закрыть фотографию", exact: true })
      .click();
    assert.equal(await page.getByRole("dialog").count(), 0);
    assert.match(
      await forest.locator("figcaption").innerText(),
      /Денис Александров/,
    );
    await page.getByRole("button", { name: "Включить дневную тему" }).click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `Photo gallery, attribution, retry, dialog focus/Escape and responsive ${width}px: passed (original downloads not verified)`,
    );
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
