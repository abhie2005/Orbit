import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
const errors = [];
page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

await page.goto('http://localhost:3210/constellation', { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);

// Click the true midpoint of an edge path, in screen coordinates.
const pt = await page.evaluate(() => {
  const path = document.querySelector('.react-flow__edge-interaction');
  const len = path.getTotalLength();
  const p = path.getPointAtLength(len / 2);
  const m = path.getScreenCTM();
  return { x: p.x * m.a + p.y * m.c + m.e, y: p.x * m.b + p.y * m.d + m.f };
});
await page.mouse.click(pt.x, pt.y);
await page.waitForTimeout(800);
const aside = (await page.locator('aside').innerText()).replace(/\n+/g, ' / ');
console.log('AFTER EDGE CLICK:', aside.slice(0, 300));
await page.screenshot({ path: '/tmp/shots/edge-why.png' });

await page.getByRole('tab', { name: 'List' }).click();
await page.waitForTimeout(600);
await page.locator('button:has-text("Aisha")').first().click();
await page.waitForTimeout(400);
await page.screenshot({ path: '/tmp/shots/list-aisha.png' });
console.log('ERRORS:', errors.length ? errors.join(' | ') : 'none');
await browser.close();
