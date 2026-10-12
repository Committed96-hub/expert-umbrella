const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const base = process.env.BASE_URL || "http://localhost:5195";
  for (const width of [320, 390, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    // Functional QA explicitly excludes external photos blocked by the environment policy.
    await page.route("https://upload.wikimedia.org/**", (r) => r.abort());
    await page.goto(base + "/#cinema");
    await page
      .getByRole("heading", { name: "Кино в Новоуральске", exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "18:00 · DEMO", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Выбрать места в DEMO-зале", exact: true })
      .click();
    const first = page.getByRole("button", { name: /^Ряд 1, место 1,/ });
    await first.click();
    await page.getByRole("button", { name: /^Ряд 3, место 1,/ }).click();
    assert.equal(
      await page.getByRole("button", { name: /^Ряд 1, место 2,/ }).isDisabled(),
      true,
    );
    await page
      .getByRole("button", { name: "В корзину билетов", exact: true })
      .click();
    await page.getByRole("heading", { name: /Итого DEMO: 800/ }).waitFor();
    await page
      .getByRole("button", { name: "Получить DEMO-билет", exact: true })
      .click();
    await page.locator(".ticket-invalid").waitFor();
    assert.match(
      await page.locator(".demo-ticket").innerText(),
      /не действителен для прохода/,
    );
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Скачать DEMO-билет" }).click();
    assert.equal(
      (await downloadPromise).suggestedFilename(),
      "novik24-DEMO-ticket.txt",
    );
    await page.goto(base + "/#cars");
    await page.locator('[data-real-id="rav4"]').waitFor();
    await page.locator('[data-real-id="rav4"] > details > summary').click();
    await page.locator('[data-real-id="rav4"] .real-fields').waitFor();
    assert.match(
      await page.locator('[data-real-id="rav4"]').innerText(),
      /287 000 км/,
    );
    const save = page.getByRole("button", {
      name: "Сохранить Toyota RAV4, 2010 — Новоуральск",
      exact: true,
    });
    await save.click();
    assert.equal(await save.getAttribute("aria-pressed"), "true");
    await page
      .getByRole("checkbox", {
        name: "Сравнить Toyota RAV4, 2010 — Новоуральск",
      })
      .check();
    await page
      .getByRole("checkbox", {
        name: "Сравнить LADA Vesta, 2024 — архивный пример",
      })
      .check();
    assert.equal(await page.locator('.comparison th[scope="col"]').count(), 3);
    assert.match(
      await page.locator('[data-real-id="vesta-archive"]').innerText(),
      /АРХИВ/,
    );
    await page.reload();
    await page
      .getByRole("button", {
        name: "Сохранить Toyota RAV4, 2010 — Новоуральск",
        exact: true,
      })
      .waitFor();
    assert.equal(
      await page
        .getByRole("button", {
          name: "Сохранить Toyota RAV4, 2010 — Новоуральск",
          exact: true,
        })
        .getAttribute("aria-pressed"),
      "true",
    );
    await page.goto(base + "/#search/saved");
    await page.locator('[data-real-id="rav4"]').waitFor();
    assert.equal(await page.locator(".real-card").count(), 1);
    await page.goto(base + "/#jobs");
    await page.locator('[data-real-id="ueip-job"] > details > summary').click();
    await page
      .getByLabel("Тестовое сообщение", { exact: true })
      .fill("DEMO: готов обсудить требования");
    await page.getByRole("button", { name: "Сохранить DEMO-отклик" }).click();
    await page.getByText(/Работодателю ничего не отправлено/).waitFor();
    await page.goto(base + "/#exchange");
    await page
      .getByRole("button", { name: "Выбрать DEMO-исполнитель Б", exact: true })
      .click();
    await page.getByLabel("Сообщение в DEMO-чат").fill("DEMO: подходит время");
    await page.getByRole("button", { name: "Отправить в DEMO-чат" }).click();
    await page.getByText("DEMO-бот:", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "Завершить DEMO-заказ услуги" })
      .click();
    await page.getByText("Статус: Завершена · DEMO", { exact: true }).waitFor();
    await page.goto(base + "/#cafes");
    await page
      .getByRole("link", { name: "Открыть отдельное DEMO-меню", exact: true })
      .click();
    await page
      .getByText("DEMO-меню, не официальное меню Solo", { exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "В корзину: DEMO-пицца", exact: true })
      .click();
    await page
      .getByRole("button", { name: "В корзину: DEMO-лимонад", exact: true })
      .click();
    await page.goto(base + "/#cart");
    await page.getByText(/750/).first().waitFor();
    await page
      .getByRole("button", { name: "Увеличить DEMO-пицца", exact: true })
      .click();
    await page.getByText(/1.350/).first().waitFor();
    await page.getByLabel("Способ получения").selectOption("delivery");
    await page.getByText(/1.550/).first().waitFor();
    await page
      .getByRole("checkbox", {
        name: "Понимаю, что это демонстрация, заказ не будет исполнен",
      })
      .check();
    await page
      .getByRole("button", { name: "Оформить демо-заказ", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Демо-заказ создан", exact: true })
      .waitFor();
    for (const route of [
      "feed",
      "services",
      "ads",
      "shops",
      "city/schedule",
      "city/medical",
      "city/events",
      "city/addresses",
      "city/cinema",
      "parks",
      "online",
      "malls",
      "search",
      "assistant",
      "bonus",
      "pharmacy",
      "appointments",
      "cars",
      "cinema",
    ]) {
      await page.goto(base + "/#" + route);
      await page
        .locator(route === "feed" ? ".hero h1" : "main h1")
        .first()
        .waitFor();
      await page.waitForFunction(
        () => !document.querySelector('main .empty[role="status"]'),
      );
      await page.evaluate(async () =>
        Promise.all(
          document.getAnimations().map((a) => a.finished.catch(() => {})),
        ),
      );
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${width}: ${route}`,
      );
    }
    await page.goto(base + "/#malls");
    await page.getByRole("button", { name: "Включить дневную тему" }).click();
    await page.reload();
    await page.getByRole("button", { name: "Включить ночную тему" }).waitFor();
    await page.getByLabel("Поиск реальных объектов").fill("НЕСУЩЕСТВУЮЩИЙ 123");
    await page
      .getByText("Совпадений среди реальных объектов нет.", { exact: true })
      .waitFor();
    assert.deepEqual(errors, []);
    await page.close();
    console.log(
      `REAL cards, movie → seat → ticket, cars, job, exchange, Solo → quantity → delivery → order, themes/routes ${width}px: passed`,
    );
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
