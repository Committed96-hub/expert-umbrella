const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({
    viewport: { width: Number(process.env.QA_WIDTH || 390), height: 1000 },
  });
  const all = [];
  for (const route of [
    "feed",
    "city/medical",
    "city/events",
    "search",
    "assistant",
    "exchange",
    "cafes",
    "cart",
    "bonus",
    "pharmacy",
    "appointments",
  ]) {
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#" + route,
    );
    await page.locator(".hero h1, main h1").first().waitFor();
    await page.waitForFunction(
      () => !document.querySelector('main .empty[role="status"]'),
    );
    await page.evaluate(async () => {
      await Promise.all(
        document.getAnimations().map((a) => a.finished.catch(() => {})),
      );
    });
    await page.addScriptTag({ path: require.resolve("axe-core/axe.min.js") });
    const result = await page.evaluate(() =>
      axe.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      }),
    );
    all.push({
      route,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  console.log(JSON.stringify(all, null, 2));
  require("node:assert/strict").ok(
    all.every((x) => x.violations.length === 0),
    "Accessibility violations",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
