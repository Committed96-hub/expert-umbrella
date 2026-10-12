const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    headless: true,
    args: ["--no-sandbox"],
  });
  const reports = [];
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 390, height: 844 },
    { width: 320, height: 740 },
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    const failed = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.status() >= 400) failed.push(r.url());
    });
    const start = Date.now();
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#city/medical",
    );
    await page
      .getByRole("heading", { name: "Ваш город — под рукой" })
      .waitFor();
    await page.locator(".city-service-card").first().waitFor();
    assert.equal(await page.locator(".city-service-card").count(), 3);
    const loadMs = Date.now() - start;
    await page.getByRole("checkbox").check();
    assert.equal(await page.locator(".city-service-card").count(), 2);
    await page.getByLabel("Дата", { exact: true }).fill("2026-10-20");
    assert.equal(await page.locator(".city-service-card").count(), 1);
    await page
      .getByRole("button", {
        name: "Подробнее: Офтальмолог · пример доступных талонов",
      })
      .click();
    await page.getByRole("dialog").waitFor();
    assert.ok(
      await page
        .getByRole("dialog")
        .getByText("Реальная запись недоступна.", { exact: false })
        .count(),
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.getByRole("dialog").count(), 0);
    await page.getByRole("button", { name: "Киносеансы", exact: true }).click();
    await page.getByLabel("Поиск городских сервисов").fill("несуществующее");
    await page.getByRole("heading", { name: "Ничего не найдено" }).waitFor();
    await page.getByRole("button", { name: "Сбросить фильтры" }).click();
    assert.equal(await page.locator(".city-service-card").count(), 2);
    await page.getByRole("button", { name: "Адреса", exact: true }).click();
    await page.getByLabel("Поиск городских сервисов").fill("книжная");
    assert.equal(await page.locator(".city-service-card").count(), 1);
    await page
      .getByRole("button", { name: "Сохранить: Библиотека «Открытая книга»" })
      .click();
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#search/saved",
    );
    await page.locator(".card").first().waitFor();
    assert.equal(await page.locator(".card").count(), 1);
    await page.reload();
    await page.locator(".card").first().waitFor();
    assert.equal(await page.locator(".card").count(), 1);
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#ads",
    );
    await page.getByRole("button", { name: "Добавить", exact: true }).click();
    await page.getByRole("dialog").waitFor();
    await page
      .getByLabel("Название", { exact: true })
      .fill("Тестовое объявление QA");
    await page
      .getByLabel("Описание", { exact: true })
      .fill("Проверка сохранения формы");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Добавить объявление", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Тестовое объявление QA" })
      .waitFor();
    await page.reload();
    await page
      .getByRole("heading", { name: "Тестовое объявление QA" })
      .waitFor();
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#search",
    );
    await page.getByLabel("Поиск в разделе").fill("терапевт");
    assert.equal(await page.locator(".card").count(), 1);
    await page.getByLabel("Поиск в разделе").fill("ничегонесуществует");
    await page
      .getByRole("heading", { name: "Пока ничего не найдено" })
      .waitFor();
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#assistant",
    );
    await page.getByRole("button", { name: "Где выпить кофе?" }).click();
    await page.locator(".message.assistant").waitFor();
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#feed",
    );
    await page.locator(".card").first().waitFor();
    await page.getByRole("button", { name: "0 комментариев" }).first().click();
    await page
      .getByLabel("Комментарий", { exact: true })
      .fill("Проверка комментария");
    await page.getByRole("button", { name: "Добавить комментарий" }).click();
    await page
      .getByRole("dialog")
      .getByText("Проверка комментария", { exact: false })
      .waitFor();
    await page.keyboard.press("Escape");
    for (const hash of [
      "feed",
      "services",
      "ads",
      "shops",
      "city/schedule",
      "city/addresses",
      "city/medical",
      "city/cinema",
      "city/events",
      "search",
      "assistant",
    ]) {
      await page.goto(
        `${process.env.BASE_URL || "http://localhost:4180"}/#${hash}`,
      );
      await page.locator(".hero h1, main h1").first().waitFor();
      await page.waitForTimeout(80);
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow ${viewport.width} ${hash}`,
      );
    }
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#city/events",
    );
    await page.locator(".city-service-card").first().waitFor();
    assert.deepEqual(errors, []);
    assert.deepEqual(failed, []);
    assert.equal(await page.locator('a[href=""],a[href="#"]').count(), 0);
    reports.push({
      viewport,
      loadMs,
      consoleErrors: errors.length,
      failedResources: failed.length,
      flows:
        "city tabs, dates, availability, cards, search, empty states, favorites persistence, ad form, assistant, comments, all routes, overflow",
    });
    await context.close();
  }
  console.log(JSON.stringify(reports, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
