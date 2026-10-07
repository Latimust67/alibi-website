// Acceptance checks for the desktop scroll choreography.
// Usage: node tools/motion-check.mjs <baseUrl>
// Exits non-zero, listing every failure, unless:
//  desktop (1440, motion allowed): the hero pins and its layers, sun and dusk
//    respond to scroll; the stat counters land on their real values; the
//    seating section pins and steps Inside -> Deck -> Beer Forest with scroll;
//    the pint progress fills; the kept beer worlds stay sticky with no
//    transformed ancestor; no console errors while scrolling the whole page;
//  reduced motion (1440): nothing pins, layers are untransformed, content shown;
//  phone (390): nothing pins and the pint progress is absent.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/@playwright/cli/node_modules/playwright');
const base = process.argv[2] || 'http://127.0.0.1:4175/';
const fails = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const settle = (page, ms = 350) => page.waitForTimeout(ms);
const browser = await chromium.launch();

// ---------- desktop, motion allowed ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base, { waitUntil: 'networkidle' });
  await settle(page, 900);

  const heroPinned = await page.evaluate(() => !!document.querySelector('[data-hero]')?.closest('.pin-spacer'));
  check(heroPinned, 'desktop: hero is not pinned');
  const sample = () => page.evaluate(() => {
    const t = (sel) => getComputedStyle(document.querySelector(sel) || document.body).transform;
    const sun = document.querySelector('.a-hero-sun');
    return { table: t('[data-layer="table"]'), land: t('[data-layer="land"]'), sunY: sun ? sun.getBoundingClientRect().top : null, dusk: +getComputedStyle(document.querySelector('.a-hero-dusk') || document.body).opacity };
  });
  const s0 = await sample();
  const pin = await page.evaluate(() => { const sp = document.querySelector('[data-hero]')?.closest('.pin-spacer'); return sp ? sp.offsetHeight - innerHeight : 0; });
  await page.evaluate((y) => scrollTo(0, y), Math.round(pin * 0.7));
  await settle(page, 700);
  const s1 = await sample();
  check(s0.table !== s1.table && s1.table !== 'none', 'desktop: foreground table layer does not move with scroll');
  check(s0.land !== s1.land, 'desktop: land layer does not move with scroll');
  check(s0.sunY !== null && s1.sunY > s0.sunY + 20, 'desktop: sun does not sink with scroll');
  check(s1.dusk > s0.dusk + 0.2, 'desktop: dusk does not fall with scroll');

  // counters land on their real values
  await page.evaluate(() => document.querySelector('.a-proof')?.scrollIntoView({ block: 'center' }));
  await settle(page, 2600);
  const counts = await page.evaluate(() => [...document.querySelectorAll('.a-proof-list strong')].map((s) => s.textContent.trim()));
  check(JSON.stringify(counts) === JSON.stringify(['2014', '11×', '94']), `desktop: counters ended at ${JSON.stringify(counts)}`);

  // seating scrollytelling
  const seats = await page.evaluate(() => {
    const sec = document.querySelector('[data-seats]');
    const sp = sec?.closest('.pin-spacer');
    if (!sp) return null;
    const top = sp.getBoundingClientRect().top + scrollY;
    return { top, dist: sp.offsetHeight - innerHeight };
  });
  check(!!seats, 'desktop: seating section is not pinned');
  if (seats) {
    const pressedAt = async (p) => {
      await page.evaluate((y) => scrollTo(0, y), Math.round(seats.top + seats.dist * p));
      await settle(page, 700);
      return page.evaluate(() => [...document.querySelectorAll('[data-seat]')].findIndex((b) => b.getAttribute('aria-pressed') === 'true'));
    };
    const steps = [await pressedAt(0.1), await pressedAt(0.5), await pressedAt(0.92)];
    check(JSON.stringify(steps) === '[0,1,2]', `desktop: seating steps with scroll were ${JSON.stringify(steps)}, expected [0,1,2]`);
  }

  // pint progress fills as the page scrolls
  const fill = () => page.evaluate(() => { const p = document.querySelector('#a-pint'); return p ? parseFloat(getComputedStyle(p).getPropertyValue('--fill')) : NaN; });
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.3));
  await settle(page, 500);
  const f1 = await fill();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight * 0.8));
  await settle(page, 500);
  const f2 = await fill();
  check(Number.isFinite(f1) && Number.isFinite(f2) && f2 > f1 + 0.2, `desktop: pint progress did not fill (${f1} -> ${f2})`);

  // kept beer worlds remain sticky with no transformed ancestor
  const sticky = await page.evaluate(() => {
    const w = document.querySelector('.desktop-world');
    if (!w) return 'missing';
    if (getComputedStyle(w).position !== 'sticky') return 'not sticky';
    for (let a = w.parentElement; a && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.transform !== 'none' || cs.filter !== 'none' || cs.overflow === 'hidden' && a.matches('.pin-spacer')) return `ancestor ${a.className} breaks sticky`;
    }
    return 'ok';
  });
  check(sticky === 'ok', `desktop: beer worlds ${sticky}`);

  // full scroll pass for errors
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60); }
  for (let y = h; y > 0; y -= 1400) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(40); }
  check(errors.length === 0, `desktop: console errors ${errors.join(' | ')}`);
  for (const path of ['/menu/', '/whats-on/', '/visit/']) {
    const errs = [];
    const p2 = await ctx.newPage();
    p2.on('pageerror', (e) => errs.push(String(e)));
    p2.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await p2.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
    const hh = await p2.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < hh; y += 800) { await p2.evaluate((v) => scrollTo(0, v), y); await p2.waitForTimeout(50); }
    check(errs.length === 0, `desktop ${path}: console errors ${errs.join(' | ')}`);
    await p2.close();
  }
  await ctx.close();
}

// ---------- desktop, reduced motion ----------
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await settle(page, 600);
  const r = await page.evaluate(() => ({
    pins: document.querySelectorAll('.pin-spacer').length,
    table: getComputedStyle(document.querySelector('[data-layer="table"]') || document.body).transform,
    hidden: [...document.querySelectorAll('[data-reveal]')].filter((e) => !e.classList.contains('is-in')).length,
    h1: getComputedStyle(document.querySelector('#home-title') || document.body).opacity,
  }));
  check(r.pins === 0, `reduced motion: ${r.pins} pinned sections`);
  check(r.table === 'none', `reduced motion: table layer transformed (${r.table})`);
  check(r.hidden === 0, `reduced motion: ${r.hidden} reveal elements not shown`);
  check(r.h1 === '1', 'reduced motion: hero headline not fully visible');
  await ctx.close();
}

// ---------- phone ----------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base, { waitUntil: 'networkidle' });
  await settle(page, 600);
  const r = await page.evaluate(() => ({ pins: document.querySelectorAll('.pin-spacer').length, pint: (() => { const p = document.querySelector('#a-pint'); return p ? getComputedStyle(p).display : 'none'; })() }));
  check(r.pins === 0, `phone: ${r.pins} pinned sections`);
  check(r.pint === 'none', 'phone: pint progress is shown');
  await ctx.close();
}

await browser.close();
if (fails.length) { console.log('MOTION CHECK FAILED\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1); }
console.log('MOTION CHECK OK');
