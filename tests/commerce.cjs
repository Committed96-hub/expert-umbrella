const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const base = process.env.BASE_URL || "http://localhost:4190";
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      locale: "ru-RU",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "/#feed");
    await page.locator(".hero h1").waitFor();
    await page
      .locator(".city-context")
      .getByText(/мм рт. ст.|Источник погоды временно недоступен/)
      .waitFor();
    await page.goto(base + "/#ads");
    await page.getByRole("button", { name: "Добавить", exact: true }).click();
    await page
      .getByLabel("Название", { exact: true })
      .fill("Объявление для пути demo");
    await page
      .getByLabel("Описание", { exact: true })
      .fill("Демонстрационные данные");
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Добавить объявление", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Объявление для пути demo" })
      .waitFor();
    await page.reload();
    await page
      .getByRole("heading", { name: "Объявление для пути demo" })
      .waitFor();
    await page
      .locator(".journey-nav")
      .getByRole("button", { name: "Биржа", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Откликнуться · demo" })
      .first()
      .click();
    await page
      .getByText("Демо-отклик сохранён. Никому не отправлен.")
      .waitFor();
    await page.getByRole("button", { name: "Найти услугу и время" }).click();
    await page.getByLabel("Специалист", { exact: true }).selectOption("s1");
    await page
      .getByLabel("Время записи")
      .selectOption("2026-10-20T10:00:00+05:00");
    await page.getByRole("button", { name: "Создать демо-запись" }).click();
    await page.getByText(/Демо-запись DEMO-/).waitFor();
    await page.getByRole("button", { name: "После дел — в кафе" }).click();
    await page
      .getByRole("button", { name: "В корзину: Круассан", exact: true })
      .click();
    await page
      .getByRole("button", { name: "В корзину: Круассан", exact: true })
      .click();
    await page
      .getByRole("button", { name: "В корзину: Капучино", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Перейти в корзину", exact: true })
      .click();
    await page.locator(".quote").waitFor();
    await page.getByLabel("Бонусные баллы").fill("50");
    await page.locator(".quote").getByText(/530/).waitFor();
    await page.getByRole("checkbox", { name: "Понимаю, что это демонстрация, заказ не будет исполнен" }).check();
    await page
      .getByRole("button", { name: "Оформить демо-заказ", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Демо-заказ создан", exact: true })
      .waitFor();
    assert.ok(
      await page
        .getByText(
          "Оплата не выполнялась. Кафе не получило заказ, доставка не будет выполнена.",
        )
        .count(),
    );
    await page
      .getByRole("button", { name: "Посмотреть бонусы", exact: true })
      .click();
    await page.locator(".bonus-balance").getByText(/476/).waitFor();
    assert.ok(
      await page.getByText("Демо-списание за заказ", { exact: true }).count(),
    );
    assert.ok(
      await page.getByText("Демо-покупка у партнёра", { exact: true }).count(),
    );
    await page.reload();
    await page.locator(".bonus-balance").getByText(/476/).waitFor();
    await page
      .locator(".commerce-links")
      .getByRole("button", { name: "Аптеки", exact: true })
      .click();
    await page.getByLabel("Название препарата").fill("Тестовый препарат");
    await page
      .locator(".pharmacy-future")
      .getByRole("button", { name: "Поиск", exact: true })
      .click();
    await page
      .getByRole("heading", {
        name: "Источник аптечных предложений не подключён",
      })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", { name: /Купить|Забронировать лекарство/ })
        .count(),
      0,
    );
    await page.goto(base + "/#cafes");
    await page.getByLabel("Поиск в меню").fill("несуществующее");
    await page.getByRole("heading", { name: "Блюд не найдено" }).waitFor();
    for (const route of [
      "exchange",
      "appointments",
      "cafes",
      "cart",
      "bonus",
      "pharmacy",
    ]) {
      await page.goto(base + "/#" + route);
      await page.locator(".commerce-module").waitFor();
      assert.ok(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        "Overflow " + route + " " + width,
      );
    }
    assert.deepEqual(errors, []);
    console.log(
      "Whole city → ad → exchange → booking → cafe → cart → order → bonus → pharmacy, " +
        width +
        "px: passed",
    );
    await context.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
