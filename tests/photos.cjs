const {chromium} = require('playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined,args:['--no-sandbox']});
  for (const width of [320,390,1440]) {
    const page = await browser.newPage({viewport:{width,height:900}});
    const errors=[];page.on('pageerror',e=>errors.push(e.message));
    // Explicitly test denied image downloads; never pretend that blocked images were loaded.
    await page.route('https://upload.wikimedia.org/**',r=>r.abort());
    await page.goto((process.env.BASE_URL || 'http://localhost:5192')+'/#feed');
    await page.locator('.hero h1').waitFor();
    await page.locator('.verified-photo figcaption').first().waitFor();
    await page.locator('.photo-unavailable').first().waitFor();
    await page.getByRole('button',{name:'Включить дневную тему'}).click();
    assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'light');
    await page.reload();
    await page.getByRole('button',{name:'Включить ночную тему'}).waitFor();
    for (const route of ['feed','ads','services','shops','city/events','city/medical','city/cinema','jobs','online','parks','malls','cafes','cart','exchange','bonus','pharmacy','appointments','search','assistant']) {
      await page.goto((process.env.BASE_URL || 'http://localhost:5192')+'/#'+route);
      await page.locator(route === 'feed' ? '.hero h1' : 'main h1').waitFor();
      await page.evaluate(async()=>Promise.all(document.getAnimations().map(a=>a.finished.catch(()=>{}))));
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth > innerWidth),false,`Overflow: ${width} ${route}`);
      assert.equal(await page.locator('img[src*="novouralsk-night"],img[src*="city-editorial"]').count(),0);
    }
    assert.deepEqual(errors,[]);
    await page.close();console.log(`Verified photo fallback, routes, light persistence and responsive ${width}px: passed`);
  }
  await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
