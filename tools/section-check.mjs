// Pin positions are read as page coordinates (getBoundingClientRect + scrollY):
// offsetTop is relative to the nearest positioned parent and pointed the dish
// sweep at the wrong part of the page (fixed October 5, thresholds unchanged).
// Probe for the October 5 section pass (hero night, dishes, events, story,
// visit, footer). Usage:
//   node tools/section-check.mjs <baseUrl> <outDir> --part <hero|dishes|events|story|visit|footer|phone|reduced|sheet|all>
// Writes PNG frames into <outDir> and exits non-zero, listing each failure,
// when the measured behaviour does not hold.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
const want = (p) => part === 'all' || part === p;
mkdirSync(out, { recursive: true });

const fails = [], notes = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const note = (msg) => notes.push(msg);
const browser = await chromium.launch();
const DESK = { viewport: { width: 1440, height: 900 } };
const PHONE = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

async function open(ctxOpts, extra = {}) {
  const ctx = await browser.newContext({ ...ctxOpts, ...extra });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(new URL('/', base).href, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  return { ctx, page, errors };
}
// Scroll in steps so scrubbed timelines follow, then let them settle.
async function scrollTo(page, y, ms = 1100) {
  const from = await page.evaluate(() => scrollY);
  const steps = Math.max(1, Math.ceil(Math.abs(y - from) / 350));
  for (let i = 1; i <= steps; i++) { await page.evaluate((v) => scrollTo(0, v), from + ((y - from) * i) / steps); await page.waitForTimeout(50); }
  await page.waitForTimeout(ms);
}
const topOf = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top + scrollY : null; }, sel);
// Transform + opacity of every element inside a section, keyed by DOM order.
const motionState = (page, sel) => page.evaluate((s) => {
  const root = document.querySelector(s);
  if (!root) return null;
  return [...root.querySelectorAll('*')].map((el) => { const cs = getComputedStyle(el); return `${cs.transform}|${cs.opacity}|${cs.clipPath}`; });
}, sel);
const changed = (a, b) => (a && b ? a.reduce((n, v, i) => n + (v !== b[i] ? 1 : 0), 0) : 0);
// Elements that differ between b and c and are back to their b state at b2.
const reversible = (b, c, b2) => (b && c && b2 ? b.reduce((n, v, i) => n + (v !== c[i] && v === b2[i] ? 1 : 0), 0) : 0);
const pinCount = (page) => page.evaluate(() => document.querySelectorAll('.pin-spacer').length);

// ---------------------------------------------------------------------------- hero (night state)
if (want('hero')) {
  const { ctx, page, errors } = await open(DESK);
  const spacer = await page.evaluate(() => { const sp = document.querySelector('[data-hero]')?.closest('.pin-spacer'); return sp ? { top: sp.getBoundingClientRect().top + scrollY, h: sp.offsetHeight } : null; });
  check(!!spacer, 'hero: the desktop hero is not pinned');
  if (spacer) {
    await scrollTo(page, spacer.top + spacer.h - 900 - 20, 1600);
    const m = await page.evaluate(() => {
      const hero = document.querySelector('[data-hero]');
      const vis = (el) => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); return cs.visibility !== 'hidden' && +cs.opacity > 0.9 && r.width > 0 && r.height > 0; };
      const hr = hero.getBoundingClientRect();
      // Visible text in the left half of the hero, measured as boxes.
      const boxes = [...hero.querySelectorAll('h1, h2, h3, p, a, li, strong, span, time')]
        .filter((el) => el.children.length === 0 || el.matches('a, p, li'))
        .filter((el) => (el.textContent || '').trim() && vis(el) && [...function* () { let e = el; while (e && e !== hero) { yield e; e = e.parentElement; } }()].every((x) => +getComputedStyle(x).opacity > 0.9))
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.left < hr.left + hr.width * 0.42 && r.bottom > hr.top && r.top < hr.bottom);
      const lowest = boxes.reduce((b, r) => Math.max(b, r.bottom), 0);
      const tonight = document.querySelector('.a-hero-tonight');
      return { heroTop: hr.top, heroH: hr.height, lowest, n: boxes.length, tonight: tonight ? { vis: vis(tonight), text: tonight.innerText } : null, links: [...hero.querySelectorAll('.a-hero-after a')].filter(vis).length };
    });
    const fill = (m.lowest - m.heroTop) / m.heroH;
    note(`hero night: visible left-column text reaches ${(fill * 100).toFixed(0)}% of the hero height, ${m.links} visible links in the night block`);
    check(fill >= 0.72, `hero: in the night state the left column's visible text ends at ${(fill * 100).toFixed(0)}% of the hero height; the lower left is still empty (need >= 72%)`);
    check(m.tonight && m.tonight.vis, 'hero: no visible .a-hero-tonight block in the night state');
    check(m.tonight && /(\d{1,2}(:\d\d)?\s*(am|pm))|closed|hours/i.test(m.tonight.text), 'hero: the tonight block does not show hours or today\'s status');
    check(m.links >= 2, `hero: the night state offers ${m.links} visible links (need >= 2 actions)`);
    await page.screenshot({ path: join(out, 'hero-night.png') });
  }
  check(errors.length === 0, `hero: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- dishes
// The original photos each dish crop is cut from (width x height), so coverage
// can be measured against the real frame rather than the crop file.
const SOURCES = { 'dish-pepperoni': [1024, 682], 'dish-bao': [1600, 900], 'dish-wings': [1600, 900], 'dish-chicken': [1600, 900], 'dish-salad': [1600, 900], 'dish-pizza': [1920, 1277], 'dish-greek': [1911, 1433] };
if (want('dishes')) {
  const images = JSON.parse(readFileSync(new URL('../src/data/images.json', import.meta.url), 'utf8'));
  const { ctx, page, errors } = await open(DESK);
  check(await page.evaluate(() => !document.querySelector('.a-oven-face--art, .a-oven [src*="/art/oven/"]')), 'dishes: the illustrated pizza is still inside the dish turntable');
  const spacer = await page.evaluate(() => { const sp = document.querySelector('.a-oven-pin')?.closest('.pin-spacer'); return sp ? { top: sp.getBoundingClientRect().top + scrollY, h: sp.offsetHeight } : null; });
  check(!!spacer, 'dishes: the desktop dish showcase is not pinned');
  // The food heading's spot pizza still turns with scroll.
  const ft = await topOf(page, '.a-food');
  await scrollTo(page, ft - 860, 900);
  const r0 = await page.evaluate(() => getComputedStyle(document.querySelector('.a-food-spot')).transform);
  await scrollTo(page, ft - 450, 900);
  const r1 = await page.evaluate(() => getComputedStyle(document.querySelector('.a-food-spot')).transform);
  check(r0 !== r1, 'dishes: the spot pizza beside the food heading no longer turns with scroll');
  const seen = new Map();
  let firstKey = null, shot = false;
  if (spacer) {
    for (let k = 0; k <= 24; k++) {
      await scrollTo(page, spacer.top + (spacer.h - 900) * (k / 24), 700);
      const vis = await page.evaluate(() => {
        const stage = document.querySelector('.a-oven-pin');
        const sr = stage.getBoundingClientRect();
        return [...stage.querySelectorAll('img')].map((img) => {
          const r = img.getBoundingClientRect();
          let el = img, op = 1; while (el && el !== stage) { op *= +getComputedStyle(el).opacity; if (getComputedStyle(el).visibility === 'hidden') op = 0; el = el.parentElement; }
          const frame = img.closest('[data-dish]');
          const fr = frame ? frame.getBoundingClientRect() : r;
          const rad = frame ? parseFloat(getComputedStyle(frame).borderTopLeftRadius) || 0 : 0;
          const inView = Math.max(0, Math.min(fr.right, sr.right) - Math.max(fr.left, sr.left)) * Math.max(0, Math.min(fr.bottom, sr.bottom) - Math.max(fr.top, sr.top));
          return { key: frame?.dataset.dish || null, src: img.currentSrc, op, w: fr.width, h: fr.height, rad, inView: inView / Math.max(1, fr.width * fr.height), nw: img.naturalWidth, nh: img.naturalHeight, fit: getComputedStyle(img).objectFit };
        }).filter((d) => d.op > 0.95 && d.inView > 0.9 && d.w > 200);
      });
      for (const d of vis) {
        if (!d.key) continue;
        if (!firstKey) firstKey = d.key;
        if (!seen.has(d.key)) seen.set(d.key, d);
      }
      if (!shot && seen.size >= 2 && k >= 6) { await page.screenshot({ path: join(out, 'dishes-1440.png') }); shot = true; }
    }
  }
  if (!shot) await page.screenshot({ path: join(out, 'dishes-1440.png') });
  note(`dishes: first fully shown dish ${firstKey}; dishes seen ${[...seen.keys()].join(', ')}`);
  check(seen.size >= 5, `dishes: only ${seen.size} dish photos were fully shown while scrolling the showcase (need >= 5)`);
  check(firstKey && /^dish-/.test(firstKey), 'dishes: the showcase does not open on a dish photograph');
  for (const [key, d] of seen) {
    const meta = images[key], srcDim = SOURCES[key];
    if (!meta || !srcDim) { fails.push(`dishes: ${key} has no image record or known source size`); continue; }
    const cropFrac = (meta.width * meta.height) / (srcDim[0] * srcDim[1]);
    const A = meta.width / meta.height, F = d.w / d.h;
    const coverFrac = d.fit === 'contain' ? 1 : Math.min(F / A, A / F);
    const round = d.rad >= Math.min(d.w, d.h) * 0.45 ? Math.PI / 4 : 1;
    const shown = Math.min(1, cropFrac) * coverFrac * round;
    note(`dishes: ${key} shown at ${Math.round(d.w)}x${Math.round(d.h)}, ${(shown * 100).toFixed(0)}% of the original photo visible`);
    check(shown >= 0.75, `dishes: ${key} shows only ${(shown * 100).toFixed(0)}% of its original photo (need >= 75%, i.e. zoomed out)`);
    check(d.w >= 640, `dishes: ${key} is displayed ${Math.round(d.w)}px wide at 1440 (need >= 640px, bigger than before)`);
  }
  check(errors.length === 0, `dishes: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- events
if (want('events')) {
  const { ctx, page, errors } = await open(DESK);
  const top = await topOf(page, '.a-events');
  const h = await page.evaluate(() => document.querySelector('.a-events').offsetHeight);
  // Let one-shot reveals finish at each spot, then compare: anything that still
  // differs between positions is driven by scroll position.
  // Let one-shot reveals finish at each spot, then compare: elements that change
  // between two positions and return to their first state when scrolled back
  // are driven by scroll position.
  await scrollTo(page, top - 200, 1800);
  await scrollTo(page, top + h * 0.2, 1800);
  const b = await motionState(page, '.a-events');
  await page.screenshot({ path: join(out, 'events-1440-mid.png') });
  await scrollTo(page, top + h * 0.45, 1800);
  const c = await motionState(page, '.a-events');
  await scrollTo(page, top + h * 0.2, 1800);
  const b2 = await motionState(page, '.a-events');
  const moved = changed(b, c), back = reversible(b, c, b2);
  note(`events: ${moved} elements changed between two scroll positions; ${back} of them returned when scrolled back`);
  check(back >= 4, `events: too little scroll-linked motion (${back} elements move with scroll and reverse; need >= 4)`);
  check(errors.length === 0, `events: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- story
if (want('story')) {
  const copyPath = new URL('../../.copy/2026-10-05/copy.json', import.meta.url);
  let copy = null;
  try { copy = JSON.parse(readFileSync(copyPath, 'utf8')); } catch { fails.push('story: .copy/2026-10-05/copy.json is missing or not JSON'); }
  const { ctx, page, errors } = await open(DESK);
  const text = await page.evaluate(() => document.querySelector('.a-story')?.innerText || '');
  const norm = (s) => s.replace(/\s+/g, ' ').replace(/[’']/g, "'").trim().toLowerCase();
  check(!/puts a lot of what it makes back/i.test(text), 'story: the old lede is still on the page');
  if (copy) {
    const pick = copy.story?.heading?.pick || {};
    const heading = await page.evaluate(() => document.querySelector('#story-title')?.innerText || '');
    check(norm(heading) === norm(`${pick.a || ''} ${pick.b || ''}`), `story: heading "${heading}" is not the copywriter's pick "${pick.a} ${pick.b}"`);
    const lede = copy.story?.lede?.pick;
    check(lede && norm(text).includes(norm(lede)), 'story: the copywriter\'s lede is not on the page');
  }
  const top = await topOf(page, '.a-story');
  const pinned = await page.evaluate(() => !!document.querySelector('.a-story')?.closest('.pin-spacer') || !!document.querySelector('.a-story .pin-spacer'));
  await scrollTo(page, top - 300, 1800);
  await scrollTo(page, top + 150, 1800);
  const b = await motionState(page, '.a-story');
  await scrollTo(page, top + 650, 1800);
  const c = await motionState(page, '.a-story');
  await scrollTo(page, top + 150, 1800);
  const b2 = await motionState(page, '.a-story');
  const back = reversible(b, c, b2);
  note(`story: pinned ${pinned}; ${changed(b, c)} elements changed with scroll, ${back} reversed when scrolled back`);
  check(back >= 4, `story: too little scroll-linked motion (${back} elements move with scroll and reverse; need >= 4)`);
  // Frame the section where its milestones are on screen.
  const mt = await topOf(page, '.a-story');
  await scrollTo(page, mt + (pinned ? 900 : 120), 1800);
  await page.screenshot({ path: join(out, 'story-1440.png') });
  check(errors.length === 0, `story: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- visit
if (want('visit')) {
  const { ctx, page, errors } = await open(DESK);
  const top = await topOf(page, '.a-visit');
  await scrollTo(page, top - 40, 2200);
  const m = await page.evaluate(() => {
    const table = document.querySelector('.a-visit .a-hours-table');
    if (!table) return null;
    let el = table, bg = null;
    while (el) { const c = getComputedStyle(el).backgroundColor; const a = c.match(/[\d.]+/g); if (a && (a.length < 4 || +a[3] > 0.5)) { bg = a.slice(0, 3).map(Number); break; } el = el.parentElement; }
    const lum = bg ? bg.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0) : 1;
    const rows = [...table.querySelectorAll('tr')].map((tr) => tr.innerText.replace(/\s+/g, ' ').trim());
    return { lum, bg, rows, today: !!table.querySelector('tr.is-today') };
  });
  check(!!m, 'visit: no hours table in the home visit section');
  if (m) {
    note(`visit: hours board background rgb(${m.bg}) luminance ${m.lum.toFixed(2)}; rows: ${m.rows.join(' / ')}`);
    check(m.lum <= 0.3, `visit: the hours board still sits on a light/white ground (luminance ${m.lum.toFixed(2)}, need <= 0.30)`);
    check(m.rows.length === 7 && ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].every((d, i) => m.rows[i]?.startsWith(d)), 'visit: the hours board does not list Monday to Sunday in order');
    check(m.today, 'visit: today is not highlighted on the hours board');
  }
  check(/931 Tahoe/i.test(await page.evaluate(() => document.querySelector('.a-visit')?.innerText || '')), 'visit: the address is missing from the visit section');
  await page.screenshot({ path: join(out, 'visit-1440.png') });
  check(errors.length === 0, `visit: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- footer
if (want('footer')) {
  for (const [name, opts] of [['1440', DESK], ['390', PHONE]]) {
    const { ctx, page, errors } = await open(opts);
    const top = await topOf(page, '.a-closing');
    await scrollTo(page, top - (name === '1440' ? 76 : 60), 2400);
    const m = await page.evaluate(() => {
      const scene = document.querySelector('.a-closing');
      const art = scene && [...scene.querySelectorAll('img')].find((i) => /\/art\/closing\//.test(i.currentSrc || i.src));
      return {
        art: art ? { ok: art.complete && art.naturalWidth > 0, w: art.getBoundingClientRect().width, h: art.getBoundingClientRect().height } : null,
        wires: document.querySelectorAll('.a-forest-wire').length,
        text: document.querySelector('.a-footer')?.innerText || '',
      };
    });
    check(m.art && m.art.ok, `footer ${name}: the closing scene has no loaded illustration from /assets/art/closing/`);
    if (m.art) check(m.art.w >= (name === '1440' ? 1300 : 380), `footer ${name}: the closing illustration is only ${Math.round(m.art.w)}px wide`);
    check(m.wires === 0, `footer ${name}: the old free-floating light strands are still drawn`);
    for (const t of ['931 Tahoe', '(775) 831-8300', 'Instagram', 'Menu']) check(m.text.includes(t), `footer ${name}: "${t}" is missing`);
    // The whole footer, closing scene through the last line, so the frame shows the
    // contact details as well as the scene (October 5: was the scene only).
    await page.locator('.a-footer').screenshot({ path: join(out, `footer-${name}.png`) });
    check(errors.length === 0, `footer ${name}: console errors: ${errors.slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------- phone
if (want('phone')) {
  const { ctx, page, errors } = await open(PHONE);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let overflow = 0;
  for (let y = 0; y < H; y += 800) {
    await page.evaluate((v) => scrollTo(0, v), y);
    await page.waitForTimeout(90);
    overflow = Math.max(overflow, await page.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  }
  await page.waitForTimeout(800);
  check(overflow <= 0, `phone: horizontal overflow of ${overflow}px`);
  check((await pinCount(page)) === 0, 'phone: a section is pinned on a phone');
  const m = await page.evaluate(() => ({
    tonight: !!document.querySelector('.a-hero-tonight'),
    art: !!document.querySelector('.a-oven-face--art'),
    dishes: document.querySelectorAll('.a-oven [data-dish] img').length,
    story: document.querySelector('.a-story')?.innerText.length || 0,
    hours: document.querySelectorAll('.a-visit .a-hours-table tr').length,
    closing: !![...document.querySelectorAll('.a-closing img')].find((i) => /\/art\/closing\//.test(i.currentSrc || i.src) && i.naturalWidth > 0),
  }));
  check(!m.art, 'phone: the illustrated pizza is still in the dish showcase');
  check(m.dishes >= 5, `phone: only ${m.dishes} dish photos in the showcase`);
  check(m.hours === 7, 'phone: the hours board does not have seven days');
  check(m.closing, 'phone: the closing illustration did not load');
  check(errors.length === 0, `phone: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- reduced motion
if (want('reduced')) {
  for (const [name, opts] of [['1440', DESK], ['390', PHONE]]) {
    const { ctx, page, errors } = await open(opts, { reducedMotion: 'reduce' });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(800);
    check((await pinCount(page)) === 0, `reduced ${name}: a section pins with reduced motion`);
    const hidden = await page.evaluate(() => {
      const bad = [];
      for (const sel of ['.a-hero', '.a-food', '.a-events', '.a-story', '.a-visit', '.a-footer']) {
        const root = document.querySelector(sel);
        if (!root) { bad.push(`${sel} missing`); continue; }
        for (const el of root.querySelectorAll('h2, h3, p, li, td, th, a, strong')) {
          if (el.closest('[aria-hidden="true"], [hidden], .sr-only, details:not([open]) > div, .a-hero-after, .a-hero-cue')) continue;
          if (!(el.textContent || '').trim()) continue;
          let e = el, op = 1, vis = true;
          while (e) { const cs = getComputedStyle(e); op *= +cs.opacity; if (cs.visibility === 'hidden' || cs.display === 'none') vis = false; e = e.parentElement; }
          if (vis && op < 0.95) bad.push(`${sel} ${el.tagName.toLowerCase()} "${el.textContent.trim().slice(0, 30)}" opacity ${op.toFixed(2)}`);
        }
      }
      return bad;
    });
    check(hidden.length === 0, `reduced ${name}: content left faded or hidden: ${hidden.slice(0, 4).join('; ')}`);
    check(errors.length === 0, `reduced ${name}: console errors: ${errors.slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
}

await browser.close();
writeFileSync(join(out, 'section-check.json'), JSON.stringify({ part, fails, notes }, null, 2));
for (const n of notes) console.log('note:', n);
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); }
console.log(`section-check ${part}: all checks passed`);
