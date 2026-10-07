// Mid-scroll frames of the desktop choreography for visual review.
// Usage: node tools/motion-frames.mjs <baseUrl> <outDir>
// Writes hero-0/hero-50/hero-100, food, seats-1/seats-2, events, footer (.png).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/@playwright/cli/node_modules/playwright');
// An unquoted output path containing spaces arrives split; rejoin it.
const [base, ...outParts] = process.argv.slice(2);
const out = outParts.join(' ');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(base, { waitUntil: 'networkidle' });
await page.waitForTimeout(900);
const shot = async (name, y) => {
  await page.evaluate((v) => scrollTo(0, v), Math.round(y));
  await page.waitForTimeout(900);
  await page.screenshot({ path: join(out, `${name}.png`) });
};
const span = (sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  const box = (el?.closest('.pin-spacer') || el);
  if (!box) return { top: 0, dist: 0 };
  return { top: box.getBoundingClientRect().top + scrollY, dist: Math.max(0, box.offsetHeight - innerHeight) };
}, sel);
const hero = await span('[data-hero]');
await shot('hero-0', 0);
await shot('hero-50', hero.top + hero.dist * 0.5);
await shot('hero-100', hero.top + hero.dist * 0.98);
const food = await span('#food');
await shot('food', food.top - 120);
const seats = await span('[data-seats]');
await shot('seats-1', seats.top + seats.dist * 0.1);
await shot('seats-2', seats.top + seats.dist * 0.9);
const events = await span('.a-events');
await shot('events', events.top - 60);
await shot('footer', await page.evaluate(() => document.documentElement.scrollHeight));
await browser.close();
console.log('frames written');
