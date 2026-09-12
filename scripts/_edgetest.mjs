import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
await page.goto('http://localhost:3210/constellation', { waitUntil: 'networkidle' });
await page.waitForTimeout(2200);

const total = await page.locator('.react-flow__edge-interaction').count();
let ok = 0, hitNode = 0;
const failures = [];
for (let i = 0; i < total; i++) {
  await page.mouse.click(5, 5); // clear selection via pane
  await page.waitForTimeout(120);
  const pt = await page.evaluate((idx) => {
    const path = document.querySelectorAll('.react-flow__edge-interaction')[idx];
    const p = path.getPointAtLength(path.getTotalLength() / 2);
    const m = path.getScreenCTM();
    return { x: p.x*m.a + p.y*m.c + m.e, y: p.x*m.b + p.y*m.d + m.f };
  }, i);
  // What element is actually on top at that point?
  const top = await page.evaluate(({x,y}) => {
    const el = document.elementFromPoint(x, y);
    return el?.closest('.react-flow__node') ? 'node' : el?.closest('.react-flow__edge') ? 'edge' : (el?.className?.baseVal ?? el?.className ?? el?.tagName);
  }, pt);
  await page.mouse.click(pt.x, pt.y);
  await page.waitForTimeout(200);
  const aside = await page.locator('aside').innerText();
  if (aside.includes('WHY THIS CONNECTION')) ok++;
  else { if (top === 'node') hitNode++; failures.push(`${i}:${top}`); }
}
console.log(`edges=${total} whyPanelOpened=${ok} blockedByNode=${hitNode}`);
if (failures.length) console.log('failures:', failures.join(' '));
await browser.close();
