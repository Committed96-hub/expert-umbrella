const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 844 },
      locale: "ru-RU",
    });
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#feed",
    );
    await page.locator(".hero h1").waitFor();
    await page.locator(".hero-panorama").evaluate((img) => img.decode());
    assert.equal(await page.locator(".hero-shortcuts button").count(), 7);
    assert.equal(await page.locator(".collection").count(), 8);
    assert.equal(await page.locator(".mobile-nav button").count(), 5);
    assert.equal(await page.locator(".mobile-nav").isVisible(), width <= 700);
    await page.getByLabel("Поиск на главной").fill("кофе");
    await page
      .getByRole("button", { name: "Найти в городе", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Результаты поиска", exact: true })
      .waitFor();
    assert.ok((await page.locator(".card").count()) > 0);
    for (const route of [
      "feed",
      "services",
      "ads",
      "shops",
      "city/medical",
      "city/cinema",
      "search",
      "assistant",
    ]) {
      await page.goto(
        (process.env.BASE_URL || "http://localhost:4180") + "/#" + route,
      );
      await page.locator(".hero h1,main h1").first().waitFor();
      await page.evaluate(async () => {
        await Promise.all(
          document.getAnimations().map((a) => a.finished.catch(() => {})),
        );
      });
      const colors = await page.evaluate(() => {
        const c = getComputedStyle(document.body).backgroundColor;
        const elements = [
          ...document.querySelectorAll(
            ".card,.modal,header,.mobile-nav,.local-search",
          ),
        ];
        return {
          body: c,
          white: elements.filter(
            (e) => getComputedStyle(e).backgroundColor === "rgb(255, 255, 255)",
          ).length,
          overflow: document.documentElement.scrollWidth > innerWidth,
        };
      });
      assert.equal(colors.body, "rgb(8, 15, 29)");
      assert.equal(colors.white, 0);
      assert.equal(colors.overflow, false);
    }
    await page.close();
    console.log(`Midnight theme and hero search ${width}px: passed`);
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
