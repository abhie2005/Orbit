import { chromium } from 'playwright';
const BASE = 'http://localhost:3210';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, deviceScaleFactor: 2 });
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push(m.text().slice(0,160)); });
const step = (s) => console.log('\n▶ ' + s);
const shot = (n) => page.screenshot({ path: `/tmp/shots/e2e-${n}.png` });

step('1. Landing → Join');
await page.goto(BASE + '/', { waitUntil: 'networkidle' });
await page.getByRole('link', { name: 'Join a class' }).first().click();
await page.waitForURL('**/join');

step('2. Enter code ORBIT7');
await page.locator('#join-code').fill('ORBIT7');
await page.getByRole('button', { name: 'Continue' }).click();
await page.waitForURL('**/onboarding');

step('3. Onboarding');
await page.locator('#display-name').fill('Riya');
await page.locator('#pronouns').fill('she/her');
await page.getByRole('button', { name: 'Continue' }).click();
for (let i = 0; i < 8; i++) {
  await page.waitForTimeout(320);
  const chips = page.locator('label:has(input[type=checkbox]), label:has(input[type=radio])');
  const n = await chips.count();
  if (n > 0) { await chips.nth(0).click(); if (n > 3) await chips.nth(2).click(); }
  const done = page.getByRole('button', { name: 'Create my passport' });
  if (await done.count()) { await shot('3-review'); await done.click(); break; }
  await page.getByRole('button', { name: 'Continue' }).click();
}
await page.waitForURL('**/passport', { timeout: 15000 });
await page.waitForTimeout(1800);
await shot('4-passport');
const aside = await page.locator('aside').innerText();
console.log('   suggestions panel:', aside.split('\n').filter(Boolean).slice(0,7).join(' / ').slice(0,220));

step('5. Constellation');
await page.getByRole('link', { name: 'Enter the constellation' }).click();
await page.waitForURL('**/constellation');
await page.waitForTimeout(2500);
console.log('   nodes:', await page.locator('.react-flow__node').count(), 'edges:', await page.locator('.react-flow__edge').count());
await shot('5-constellation');

step('6. Mission → We met (dashed becomes solid)');
const missionTitle = await page.locator('aside').first().innerText();
console.log('   mission:', missionTitle.split('\n').filter(Boolean).slice(0,5).join(' / ').slice(0,200));
const solidBefore = await page.evaluate(() => [...document.querySelectorAll('.react-flow__edge path.react-flow__edge-path')].filter(p => !p.style.strokeDasharray).length);
await page.getByRole('button', { name: 'We met' }).click();
await page.waitForTimeout(1200);
const solidAfter = await page.evaluate(() => [...document.querySelectorAll('.react-flow__edge path.react-flow__edge-path')].filter(p => !p.style.strokeDasharray).length);
console.log(`   solid edges: ${solidBefore} → ${solidAfter}  ${solidAfter > solidBefore ? '✅' : '❌ NO CHANGE'}`);
await shot('6-met');

step('7. Professor dashboard');
await page.goto(BASE + '/professor/dashboard', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await shot('7-dashboard');
const dash = await page.locator('main').innerText();
console.log('   ' + dash.split('\n').filter(Boolean).slice(0, 18).join(' / ').slice(0, 400));

console.log('\nCONSOLE ERRORS:', errors.length ? errors.slice(0,5).join('\n  ') : 'none');
await browser.close();
