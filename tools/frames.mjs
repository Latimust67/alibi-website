// Quick scroll frames for review: node tools/frames.mjs <url> <outDir> <width> <y1,y2,...|sel:selector@offset,...> [--phone]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/@playwright/cli/node_modules/playwright');
const [base, out, width, list] = process.argv.slice(2);
const phone = process.argv.includes('--phone');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const ctx = await browser.newContext(phone
  ? { viewport: { width: +width, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
  : { viewport: { width: +width, height: 900 } });
const page = await ctx.newPage();
page.on('pageerror', (e) => console.log('pageerror', String(e)));
page.on('console', (m) => { if (m.type() === 'error') console.log('console', m.text()); });
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
let cur = 0;
for (const item of list.split(',')) {
  let y;
  if (item.startsWith('sel:')) {
    const [sel, off] = item.slice(4).split('@');
    y = await page.evaluate(([s, o]) => { const el = document.querySelector(s); return el.getBoundingClientRect().top + scrollY + Number(o || 0); }, [sel, off]);
  } else y = +item;
  // scroll in steps so scrubbed timelines catch up
  const steps = Math.max(1, Math.ceil(Math.abs(y - cur) / 400));
  for (let i = 1; i <= steps; i++) { await page.evaluate((v) => scrollTo(0, v), cur + (y - cur) * i / steps); await page.waitForTimeout(60); }
  cur = y;
  await page.waitForTimeout(1300);
  const name = item.replace(/[^a-z0-9@-]+/gi, '_');
  await page.screenshot({ path: join(out, `${phone ? 'p' : 'd'}${width}-${name}.jpg`), quality: 70, type: 'jpeg' });
}
await browser.close();
