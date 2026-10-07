// Scroll-behaviour probe for the October 2026 scroll redesign.
// Usage: node tools/scroll-check.mjs <baseUrl> <outDir> --part <hero|food|dishes|tour|footer|phone|reduced|content|all>
// Writes PNG frames into <outDir> and exits non-zero, listing each failure,
// when the measured behaviour does not hold.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/@playwright/cli/node_modules/playwright');

// An unquoted output path containing spaces arrives split; rejoin it up to the first flag.
const argv = process.argv.slice(2);
const flagAt = argv.findIndex((a, i) => i > 1 && a.startsWith('--'));
const base = argv[0];
const out = argv.slice(1, flagAt < 0 ? argv.length : flagAt).join(' ');
const rest = flagAt < 0 ? [] : argv.slice(flagAt);
const part = rest.includes('--part') ? rest[rest.indexOf('--part') + 1] : 'all';
mkdirSync(out, { recursive: true });

const fails = [], notes = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const note = (msg) => notes.push(msg);
const browser = await chromium.launch();
const DESK = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

async function open(ctxOpts, path = '/', extra = {}) {
  const ctx = await browser.newContext({ ...ctxOpts, ...extra });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(new URL(path, base).href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(ctxOpts === PHONE ? 1800 : 1600);
  return { ctx, page, errors };
}
const settle = (page, ms = 900) => page.waitForTimeout(ms);
const scrollTo = async (page, y, ms = 900) => { await page.evaluate((v) => scrollTo(0, v), Math.round(y)); await settle(page, ms); };
// Top of a pinned scene's spacer (or the element) and how far it pins.
const span = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s);
  if (!el) return null;
  const box = el.closest('.pin-spacer') || el;
  return { top: box.getBoundingClientRect().top + scrollY, dist: Math.max(0, box.offsetHeight - innerHeight), pinned: !!el.closest('.pin-spacer') };
}, sel);
const motionReady = (page) => page.waitForFunction(() => document.documentElement.classList.contains('a-motion'), null, { timeout: 15000 }).then(() => true, () => false);

async function hero() {
  const { ctx, page, errors } = await open(DESK);
  check(await motionReady(page), 'hero: desktop motion did not start');
  const read = () => page.evaluate(() => {
    const svg = document.querySelector('.a-lights--desk');
    const avg = (sel) => { const els = [...(svg?.querySelectorAll(sel) || [])]; return els.length ? els.reduce((s, e) => s + +getComputedStyle(e).opacity, 0) / els.length : -1; };
    const sun = document.querySelector('.a-hero-sun')?.getBoundingClientRect();
    const night = +getComputedStyle(document.querySelector('.a-sky--night')).opacity;
    return { bulbs: svg?.querySelectorAll('.a-bulb-core').length || 0, cores: avg('.a-bulb-core'), halos: avg('.a-bulb-halo'), sunTop: sun?.top ?? null, night };
  });
  await scrollTo(page, 0, 400);
  const day = await read();
  await page.screenshot({ path: join(out, 'hero-day.png') });
  const s = await span(page, '[data-hero]');
  check(s?.pinned, 'hero: not pinned on desktop');
  await scrollTo(page, s.top + s.dist * 0.82, 1400);
  const dark = await read();
  await page.screenshot({ path: join(out, 'hero-night.png') });
  check(day.bulbs >= 10, `hero: only ${day.bulbs} drawn bulbs`);
  check(day.cores < 0.05 && day.halos < 0.05, `hero: bulbs already lit by day (cores ${day.cores.toFixed(2)}, halos ${day.halos.toFixed(2)})`);
  check(dark.cores > 0.9 && dark.halos > 0.6, `hero: bulbs not lit after sundown (cores ${dark.cores.toFixed(2)}, halos ${dark.halos.toFixed(2)})`);
  check(dark.sunTop - day.sunTop > 120, `hero: sun did not set (moved ${Math.round(dark.sunTop - day.sunTop)}px)`);
  check(dark.night > 0.9, `hero: sky not at night (${dark.night})`);
  // Lights come on only once the sun is down: sample the moment the first bulb lights.
  let firstLit = null;
  for (let p = 0.25; p <= 0.7; p += 0.025) {
    await scrollTo(page, s.top + s.dist * p, 500);
    const r = await read();
    if (r.cores > 0.02) { firstLit = { p, sunTop: r.sunTop }; break; }
  }
  const horizon = await page.evaluate(() => { const land = document.querySelector('[data-layer="land"]').getBoundingClientRect(); return land.top + land.height * 0.36; });
  check(firstLit && firstLit.sunTop > horizon - 30, `hero: lights came on before the sun was down (first lit at ${JSON.stringify(firstLit)}, horizon ${Math.round(horizon)})`);
  note(`hero: day ${JSON.stringify(day)} night ${JSON.stringify(dark)} firstLit ${JSON.stringify(firstLit)}`);
  check(errors.length === 0, `hero: console errors ${errors.join(' | ')}`);
  await ctx.close();
}

async function food() {
  for (const [opts, name] of [[DESK, '1440'], [PHONE, '390']]) {
    const { ctx, page, errors } = await open(opts);
    await motionReady(page);
    const head = await page.evaluate(() => { const h = document.querySelector('#food-title'); return h ? h.getBoundingClientRect().top + scrollY : null; });
    check(head !== null, `food ${name}: heading missing`);
    const spotT = () => page.evaluate(() => getComputedStyle(document.querySelector('.a-food-spot')).transform);
    // Bring the heading in from below and catch it while its lines are still rising.
    const vh = opts.viewport.height;
    await scrollTo(page, head - vh * 0.92, 500);
    const t1 = await spotT();
    await scrollTo(page, head - vh * 0.55, 180);
    if (name === '1440') await page.screenshot({ path: join(out, `food-${name}.png`) });
    await settle(page, 1500);
    const t2 = await spotT();
    if (name === '390') { await scrollTo(page, head - vh * 0.25, 1200); await page.screenshot({ path: join(out, `food-${name}.png`) }); }
    const masks = await page.evaluate(() => [...document.querySelectorAll('#food-title .a-split-line-mask')].map((m) => { const cs = getComputedStyle(m); return parseFloat(cs.paddingBottom) / parseFloat(cs.fontSize); }));
    check(masks.length === 0 || masks.every((r) => r >= 0.15), `food ${name}: line masks leave no room for descenders (${masks.map((r) => r.toFixed(2))})`);
    const text = await page.evaluate(() => document.querySelector('#food-title')?.textContent.replace(/\s+/g, ' ').trim());
    check(/Pizza, pints & plenty to share\./.test(text || ''), `food ${name}: heading text is "${text}"`);
    check(await page.evaluate(() => !!document.querySelector('.a-food-spot img')), `food ${name}: pizza illustration missing`);
    check(t1 !== t2, `food ${name}: pizza does not move with scroll (${t1} → ${t2})`);
    check(errors.length === 0, `food ${name}: console errors ${errors.join(' | ')}`);
    await ctx.close();
  }
}

async function dishes() {
  const { ctx, page } = await open(DESK);
  await motionReady(page);
  const info = await page.evaluate(() => ({
    oldGrid: !!document.querySelector('.a-food-grid, .a-food-main, .a-food-bao'),
    courses: [...document.querySelectorAll('.a-courses .a-course')].map((li) => ({ name: li.querySelector('.a-course-name')?.textContent.trim(), desc: li.querySelector('.a-course-desc')?.textContent.trim(), img: !!li.querySelector('img') })),
  }));
  check(!info.oldGrid, 'dishes: the old two-photo grid is still present');
  const complete = info.courses.filter((c) => c.name && c.desc && c.desc.length > 12 && c.img);
  check(complete.length >= 5, `dishes: ${complete.length} complete dishes (need 5)`);
  const s = await span(page, '.a-oven-pin');
  check(s?.pinned, 'dishes: showcase is not pinned on desktop');
  const seen = [];
  for (let p = 0.02; p < 1; p += 0.06) {
    await scrollTo(page, s.top + s.dist * p, 450);
    const cur = await page.evaluate(() => {
      const copies = [document.querySelector('.a-oven-intro'), ...document.querySelectorAll('.a-courses .a-course-copy')];
      let best = -1, op = 0;
      copies.forEach((c, i) => { const o = +getComputedStyle(c).opacity; if (o > op) { op = o; best = i; } });
      return op > 0.9 ? copies[best].querySelector('.a-course-name')?.textContent.trim() : null;
    });
    if (cur && seen.at(-1) !== cur) seen.push(cur);
  }
  note(`dishes: stepped through ${JSON.stringify(seen)}`);
  check(new Set(seen).size >= 6, `dishes: scroll showed ${new Set(seen).size} distinct steps (${seen.join(' → ')})`);
  await ctx.close();
}

async function tour() {
  {
    const { ctx, page } = await open(DESK);
    await motionReady(page);
    const legacy = await page.evaluate(() => ({ text: /Pick your spot/i.test(document.body.innerText), buttons: document.querySelectorAll('[data-seat]').length }));
    check(!legacy.text && legacy.buttons === 0, `tour: old section still present ${JSON.stringify(legacy)}`);
    const s = await span(page, '[data-tour] .a-tour-pin');
    check(s?.pinned, 'tour: not pinned on desktop');
    const at = async (p) => { await scrollTo(page, s.top + s.dist * p, 700); return page.evaluate(() => ({ cur: [...document.querySelectorAll('[data-tour] .a-scene')].findIndex((x) => x.classList.contains('is-current')), clip: [...document.querySelectorAll('[data-tour] .a-scene-media')].map((m) => getComputedStyle(m).clipPath.slice(0, 18)) })); };
    const order = [await at(0.4), await at(0.68), await at(0.95)];
    check(JSON.stringify(order.map((o) => o.cur)) === '[0,1,2]', `tour: scenes with scroll were ${JSON.stringify(order.map((o) => o.cur))}, expected [0,1,2]`);
    await at(0.47);
    await page.screenshot({ path: join(out, 'tour-1440-mid.png') });
    const imgs = await page.evaluate(() => [...document.querySelectorAll('[data-tour] .a-scene-media img')].every((i) => i.complete && i.naturalWidth > 600));
    check(imgs, 'tour: a scene photograph did not load');
    await ctx.close();
  }
  {
    const { ctx, page } = await open(PHONE);
    await motionReady(page);
    const s = await span(page, '[data-tour] .a-tour-pin');
    check(!s?.pinned, 'tour: pinned on phone');
    const first = await page.evaluate(() => { const m = document.querySelector('[data-tour] .a-scene-media'); return m.getBoundingClientRect().top + scrollY; });
    await scrollTo(page, first - 844 * 0.8, 700);
    const c1 = await page.evaluate(() => getComputedStyle(document.querySelector('[data-tour] .a-scene-media')).clipPath);
    await scrollTo(page, first - 844 * 0.25, 900);
    const c2 = await page.evaluate(() => getComputedStyle(document.querySelector('[data-tour] .a-scene-media')).clipPath);
    check(c1 !== c2, 'tour: phone scene does not animate with scroll');
    await scrollTo(page, first - 844 * 0.12, 1000);
    await page.screenshot({ path: join(out, 'tour-390.png') });
    await ctx.close();
  }
  {
    const { ctx, page } = await open(DESK, '/', { reducedMotion: 'reduce' });
    const r = await page.evaluate(() => [...document.querySelectorAll('[data-tour] .a-scene')].map((sc) => { const m = sc.querySelector('.a-scene-media').getBoundingClientRect(); const cs = getComputedStyle(sc.querySelector('.a-scene-media')); return { h: m.height, clip: cs.clipPath, op: +getComputedStyle(sc.querySelector('.a-scene-copy')).opacity }; }));
    check(r.length === 3 && r.every((x) => x.h > 150 && x.clip === 'none' && x.op === 1), `tour: reduced motion does not show all three spaces ${JSON.stringify(r)}`);
    await ctx.close();
  }
}

async function footer() {
  for (const [opts, name] of [[DESK, '1440'], [PHONE, '390']]) {
    const { ctx, page } = await open(opts);
    await motionReady(page);
    const sceneTop = await page.evaluate(() => document.querySelector('.a-closing').getBoundingClientRect().top + scrollY);
    const vh = opts.viewport.height;
    const lay = () => page.evaluate(() => [...document.querySelectorAll('.a-closing .a-forest-layer[data-depth]')].map((l) => new DOMMatrix(getComputedStyle(l).transform).m42));
    await scrollTo(page, sceneTop - vh * 0.8, 900);
    const early = await lay();
    await scrollTo(page, sceneTop, 1400);
    const late = await lay();
    const h = await page.evaluate(() => document.querySelector('.a-closing').getBoundingClientRect().height);
    if (name === '1440') {
      check(early.length >= 4, `footer: ${early.length} tree layers`);
      const moved = early.map((y, i) => y - late[i]);
      check(moved.filter((m) => m > 8).length >= 4 && new Set(moved.map((m) => Math.round(m / 6))).size >= 3, `footer: layers do not move at different speeds ${JSON.stringify(moved.map(Math.round))}`);
      check(h >= vh * 0.9, `footer: scene is ${Math.round(h)}px tall`);
    }
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await settle(page, 1200);
    // The fixed header and back-to-top pint would sit on top of an element capture; hide them for this frame only.
    await page.addStyleTag({ content: '[data-header], .skip-link, #a-pint { visibility: hidden !important; }' });
    await page.locator('footer').screenshot({ path: join(out, `footer-${name}.png`) });
    await ctx.close();
  }
}

async function phone() {
  const { ctx, page, errors } = await open(PHONE);
  check(await motionReady(page), 'phone: motion did not start');
  const pins = await page.evaluate(() => document.querySelectorAll('.pin-spacer').length);
  check(pins === 0, `phone: ${pins} pinned sections`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  check(overflow <= 1, `phone: horizontal overflow ${overflow}px`);
  const SEL = ['.a-hero-art picture', '.a-hero-flat-night', '.a-lights--phone .a-bulb-core', '.a-food-spot', '.a-oven-flip', '.a-oven-ring', '[data-tour] .a-scene-media img', '.a-crew-photo img', '.a-pint-cut', '.a-closing .a-forest-layer[data-depth="4"]', '.a-closing-copy'];
  const sample = () => page.evaluate((sels) => sels.map((s) => { const e = document.querySelector(s); if (!e) return null; const cs = getComputedStyle(e); return `${cs.transform}|${cs.opacity}|${cs.clipPath}`; }), SEL);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const changed = new Set();
  let prev = await sample();
  for (let y = 300; y < h; y += 380) {
    await scrollTo(page, y, 420);
    const cur = await sample();
    cur.forEach((v, i) => { if (v !== null && prev[i] !== null && v !== prev[i]) changed.add(SEL[i]); });
    prev = cur;
  }
  note(`phone: animated ${[...changed].join(', ')}`);
  check(changed.size >= 6, `phone: only ${changed.size} elements animate with scroll: ${[...changed].join(', ')}`);
  check(changed.has('.a-hero-flat-night') || changed.has('.a-hero-art picture'), 'phone: hero does not respond to scroll');
  check(changed.has('.a-food-spot') || changed.has('.a-oven-flip'), 'phone: pizza does not respond to scroll');
  check(errors.length === 0, `phone: console errors ${errors.join(' | ')}`);
  await ctx.close();
}

async function reduced() {
  for (const [opts, name] of [[DESK, '1440'], [PHONE, '390']]) {
    const { ctx, page } = await open(opts, '/', { reducedMotion: 'reduce' });
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await settle(page, 600);
    const r = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll('main :is(h1, h2, h3, p, li, figure, picture)')].filter((e) => !e.closest('.a-kept, [aria-hidden="true"], [role="img"], [hidden], .a-hero-after, .a-hero-art-cap')).filter((e) => {
        if (e.offsetParent === null && getComputedStyle(e).position !== 'fixed') return false; // display:none variants for other widths
        for (let a = e; a && a !== document.body; a = a.parentElement) if (+getComputedStyle(a).opacity < 0.99 || getComputedStyle(a).visibility === 'hidden') return true;
        return false;
      }).map((e) => e.className || e.tagName);
      const heroOk = innerWidth >= 1000
        ? [...document.querySelectorAll('.a-hero-stage img[data-layer]')].every((i) => i.complete && i.naturalWidth > 0)
        : (() => { const i = document.querySelector('.a-hero-art img'); return i.complete && i.naturalWidth > 0; })();
      return { pins: document.querySelectorAll('.pin-spacer').length, hidden: hidden.slice(0, 12), heroOk, h1: +getComputedStyle(document.querySelector('#home-title')).opacity };
    });
    check(r.pins === 0, `reduced ${name}: ${r.pins} pinned sections`);
    check(r.hidden.length === 0, `reduced ${name}: content left hidden: ${r.hidden.join(', ')}`);
    check(r.heroOk && r.h1 === 1, `reduced ${name}: hero scene incomplete ${JSON.stringify(r)}`);
    await ctx.close();
  }
}

async function content() {
  const res = await fetch(new URL('/', base));
  const html = (await res.text()).replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
  writeFileSync(join(out, 'home-text.txt'), html);
  const need = [
    ['weekday happy hour 3–5pm', /happy hour/i.test(html) && /3–5\s*pm/i.test(html)],
    ['groups up to 200', /up to 200/i.test(html)],
    ['2024 EPA recognition', /EPA/.test(html) && /2024/.test(html)],
    ['94 non-profits in 2025', /94 non-profits/i.test(html)],
    ['Alibi Anonymous', /Alibi Anonymous/.test(html)],
    ['gift cards', /gift card/i.test(html)],
    ['kids welcome', /Kids are welcome|Kids welcome/i.test(html)],
    ['leashed dogs in the Beer Forest', /Leashed dogs[^.]*Beer Forest/i.test(html)],
  ];
  need.filter(([, ok]) => !ok).forEach(([label]) => fails.push(`content: missing ${label}`));
}

const parts = { hero, food, dishes, tour, footer, phone, reduced, content };
for (const name of part === 'all' ? Object.keys(parts) : [part]) await parts[name]();
await browser.close();
writeFileSync(join(out, 'scroll-check.txt'), [...notes, ...fails.map((f) => 'FAIL ' + f)].join('\n') || 'OK');
notes.forEach((n) => console.log(n));
if (fails.length) { console.log('SCROLL CHECK FAILED\n' + fails.map((f) => ' - ' + f).join('\n')); process.exit(1); }
console.log(`SCROLL CHECK OK (${part})`);
