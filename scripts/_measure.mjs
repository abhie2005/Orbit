import { chromium } from 'playwright';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 } });
await page.goto('http://localhost:3210/constellation', { waitUntil: 'networkidle' });
await page.waitForTimeout(2500);
const data = await page.evaluate(() => {
  const out = [];
  for (const node of document.querySelectorAll('.react-flow__node')) {
    const nb = node.getBoundingClientRect();
    const circle = node.querySelector('div[style*="width"]')?.getBoundingClientRect();
    const label = node.querySelector('span.whitespace-nowrap');
    const lb = label?.getBoundingClientRect();
    out.push({
      name: label?.textContent?.trim(),
      nodeBox: `${Math.round(nb.width)}x${Math.round(nb.height)}`,
      transform: node.style.transform,
      dx: circle && lb ? Math.round((lb.x + lb.width/2) - (circle.x + circle.width/2)) : null,
      gapBelowCircle: circle && lb ? Math.round(lb.y - circle.bottom) : null,
    });
  }
  return out;
});
console.table(data);
const zoom = await page.evaluate(() => document.querySelector('.react-flow__viewport')?.style.transform);
console.log('viewport transform:', zoom);
await browser.close();
