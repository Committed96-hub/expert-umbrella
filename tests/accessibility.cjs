const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage({ viewport: { width: Number(process.env.QA_WIDTH || 390), height: 1000 } });
  const all = [];
  for (const route of [
    "feed",
    "city/medical",
    "city/events",
    "search",
    "assistant",
  ]) {
    await page.goto(
      (process.env.BASE_URL || "http://localhost:4180") + "/#" + route,
    );
    await page.locator("main h1").waitFor();
    await page.waitForTimeout(100);
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
