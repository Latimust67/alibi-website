// Phone probe for the October 7 mobile pass. Usage:
//   node tools/phone-check.mjs <baseUrl> <outDir> --part <overflow|sideways|dishes|beers|events|crew|pub|story|kept|reduced|type|overview|steady|pour|footer|sticky|all>
// Writes contact sheets (PNG) into <outDir> and exits non-zero, listing each
// failure, when the measured behaviour does not hold.
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/@playwright/cli/node_modules/playwright');
const sharp = require('sharp');

// An unquoted output path containing spaces arrives split; rejoin it up to the first flag.
const argv = process.argv.slice(2);
const flagAt = argv.findIndex((a, i) => i > 1 && a.startsWith('--'));
const base = argv[0].replace(/\/$/, '');
const out = argv.slice(1, flagAt < 0 ? argv.length : flagAt).join(' ');
const rest = flagAt < 0 ? [] : argv.slice(flagAt);
const part = rest.includes('--part') ? rest[rest.indexOf('--part') + 1] : 'all';
const want = (p) => part === 'all' || part === p;
mkdirSync(out, { recursive: true });

const fails = [], notes = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const note = (msg) => notes.push(msg);
const browser = await chromium.launch();
const PHONE = { width: 390, height: 844 }, SMALL = { width: 375, height: 667 }, TABLET = { width: 768, height: 1024 };
const IPHONE15 = { width: 393, height: 852 };

async function open(path, { vp = PHONE, reduced = false, js = true } = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, isMobile: true, hasTouch: true, reducedMotion: reduced ? 'reduce' : 'no-preference', javaScriptEnabled: js });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base + path, { waitUntil: 'load' });
  await page.waitForTimeout(js ? 1600 : 300);
  return { ctx, page, errors };
}
// Scroll in small steps (as a thumb would) so scrubbed scenes update on the way.
async function scrollTo(page, y, settle = 700) {
  const from = await page.evaluate(() => scrollY);
  const step = y > from ? 90 : -90;
  for (let s = from; step > 0 ? s < y : s > y; s += step) { await page.evaluate((v) => window.scrollTo(0, v), s); await page.waitForTimeout(16); }
  await page.evaluate((v) => window.scrollTo(0, v), y);
  await page.waitForTimeout(settle);
}
const topOf = (page, sel, off = 0) => page.evaluate(([s, o]) => { const el = document.querySelector(s); return el ? Math.round(el.getBoundingClientRect().top + scrollY + o) : null; }, [sel, off]);
async function sheet(name, buffers, w) {
  const gap = 12, h = Math.max(...await Promise.all(buffers.map(async (b) => (await sharp(b).metadata()).height)));
  const comp = buffers.map((b, k) => ({ input: b, left: k * (w + gap), top: 0 }));
  await sharp({ create: { width: buffers.length * (w + gap) - gap, height: h, channels: 3, background: '#ff00ff' } }).composite(comp).png().toFile(join(out, name));
}
async function frames(page, ys, settle = 800) { const shots = []; for (const y of ys) { await scrollTo(page, y, settle); shots.push(await page.screenshot()); } return shots; }

// ---- overflow + console: every page, phone, small phone and tablet ----------------------------
if (want('overflow')) {
  for (const vp of [PHONE, SMALL, TABLET]) {
    for (const path of ['/', '/menu/', '/whats-on/', '/visit/']) {
      const { ctx, page, errors } = await open(path, { vp });
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      let worst = 0;
      for (let y = 0; y < H; y += Math.round(vp.height * 0.9)) {
        await scrollTo(page, y, 120);
        worst = Math.max(worst, await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth));
      }
      check(worst <= 0, `${vp.width}px ${path}: page scrolls sideways by ${worst}px`);
      check(!errors.length, `${vp.width}px ${path}: console errors: ${errors.slice(0, 3).join(' | ')}`);
      await ctx.close();
    }
  }
  note('overflow: 4 pages x 3 phone/tablet sizes checked for sideways page scroll and console errors');
}

// ---- nothing on the home page moves or scrolls sideways (the rolling pizza excepted) ---------
if (want('sideways')) {
  const { ctx, page } = await open('/');
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  const scrollers = await page.evaluate(() => [...document.querySelectorAll('main *')].filter((el) => {
    const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
    return r.width > 0 && /(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth + 2;
  }).map((el) => el.className || el.tagName));
  check(!scrollers.length, `sideways: horizontally scrolling containers on the phone home page: ${scrollers.join(', ')}`);
  const marquee = await page.evaluate(() => { const m = document.querySelector('.a-marquee'); return m ? m.getBoundingClientRect().height : 0; });
  check(marquee === 0, `sideways: the scrolling text band is still shown on phones (${marquee}px tall)`);
  const track = new Map();
  for (let y = 0; y < H; y += 260) {
    await scrollTo(page, y, 260);
    const sample = await page.evaluate(() => {
      const res = [];
      document.querySelectorAll('main *').forEach((el, i) => {
        if (el.closest('.a-food-spot')) return; // the rolling pizza is meant to roll in from the left
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight || !r.width) return;
        const cs = getComputedStyle(el);
        const m = cs.transform !== 'none' ? new DOMMatrix(cs.transform).m41 : 0;
        const t = cs.translate && cs.translate !== 'none' ? parseFloat(cs.translate) || 0 : 0;
        res.push([i, (el.className && el.className.baseVal === undefined ? el.className : el.tagName) + '', m + t]);
      });
      return res;
    });
    for (const [i, name, x] of sample) { const t = track.get(i) || { name, min: x, max: x }; t.min = Math.min(t.min, x); t.max = Math.max(t.max, x); track.set(i, t); }
  }
  const movers = [...track.values()].filter((t) => t.max - t.min > 4).map((t) => `${t.name} (${Math.round(t.max - t.min)}px)`);
  check(!movers.length, `sideways: elements that slide sideways while scrolling: ${movers.slice(0, 8).join(', ')}`);
  note(`sideways: tracked ${track.size} elements across the page`);
  await ctx.close();
}

// ---- dishes: a vertical stack of five cards; each fits the screen while it is stuck -----------
if (want('dishes')) {
  for (const vp of [PHONE, SMALL]) {
    const { ctx, page } = await open('/', { vp });
    const info = await page.evaluate(() => [...document.querySelectorAll('.a-course')].map((c) => { const cs = getComputedStyle(c); const r = c.getBoundingClientRect(); return { pos: cs.position, top: parseFloat(cs.top) || 0, h: r.height, w: r.width, x: r.left }; }));
    check(info.length === 5, `dishes ${vp.width}: expected 5 dish cards, found ${info.length}`);
    check(info.every((c) => c.pos === 'sticky'), `dishes ${vp.width}: dish cards are not sticky-stacked (${info.map((c) => c.pos).join(',')})`);
    info.forEach((c, i) => check(c.top + c.h <= vp.height - 8, `dishes ${vp.width}x${vp.height}: card ${i + 1} (${Math.round(c.h)}px tall, stuck at ${c.top}px) does not fit the screen`));
    check(new Set(info.map((c) => Math.round(c.x))).size === 1 && info.every((c) => c.x >= 12 && c.x + c.w <= vp.width - 12), `dishes ${vp.width}: cards are not one aligned column inside the screen`);
    check(new Set(info.map((c) => Math.round(c.h))).size === 1, `dishes ${vp.width}: cards differ in height (${info.map((c) => Math.round(c.h)).join(',')}), so taller ones peek out under the stack`);
    if (vp === PHONE) {
      const t0 = await topOf(page, '.a-courses', -140);
      const span = await page.evaluate(() => document.querySelector('.a-courses').getBoundingClientRect().height);
      const shots = await frames(page, [t0, t0 + span * 0.18, t0 + span * 0.38, t0 + span * 0.58, t0 + span * 0.78, t0 + span * 0.98].map(Math.round));
      // The card beneath eases back once the next one lands on it.
      const scales = await page.evaluate(() => [...document.querySelectorAll('.a-course')].map((c) => new DOMMatrix(getComputedStyle(c).transform === 'none' ? undefined : getComputedStyle(c).transform).a));
      check(scales[0] < 0.99 && Math.abs(scales[4] - 1) < 0.01, `dishes: covered cards do not ease back (scales ${scales.map((s) => s.toFixed(3)).join(',')})`);
      await sheet('dishes.png', shots, vp.width);
    }
    await ctx.close();
  }
  const { ctx, page } = await open('/', { reduced: true });
  const still = await page.evaluate(() => [...document.querySelectorAll('.a-course')].map((c) => { const r = c.getBoundingClientRect(); return { pos: getComputedStyle(c).position, top: r.top + scrollY, bottom: r.bottom + scrollY }; }));
  check(still.every((c) => c.pos !== 'sticky') && still.every((c, i) => !i || c.top >= still[i - 1].bottom), 'dishes reduced motion: cards should be a plain list, one under another');
  await ctx.close();
}

// ---- beers: a two-column shelf of six ------------------------------------------------------
if (want('beers')) {
  const { ctx, page } = await open('/');
  const t = await topOf(page, '.house-mobile-beers', -64);
  await scrollTo(page, t, 400);
  const h = await page.evaluate(() => document.querySelector('.house-mobile-beers').getBoundingClientRect().height);
  const shots = await frames(page, [t, t + Math.max(0, h - 844) / 2, t + Math.max(0, h - 844)].map(Math.round), 1100);
  const tiles = await page.evaluate(() => [...document.querySelectorAll('.house-mobile-beers li.mobile-beer')].map((li) => {
    const r = li.getBoundingClientRect(); const h3 = li.querySelector('h3'); const can = li.querySelector('.mobile-beer-can img');
    return { x: Math.round(r.left), y: Math.round(r.top), r: r.right, name: h3.textContent, clipped: h3.scrollWidth > h3.clientWidth + 1, can: can && can.naturalWidth > 0 && can.getBoundingClientRect().height > 80 };
  }));
  check(tiles.length === 6, `beers: expected 6 beers, found ${tiles.length}`);
  check(new Set(tiles.map((b) => b.x)).size === 2 && new Set(tiles.map((b) => b.y)).size === 3, `beers: not a 2-column, 3-row shelf (x ${[...new Set(tiles.map((b) => b.x))]}, rows ${new Set(tiles.map((b) => b.y)).size})`);
  check(tiles.every((b) => b.x >= 12 && b.r <= 390 - 12), 'beers: a tile runs off the screen');
  tiles.forEach((b) => { check(!b.clipped, `beers: "${b.name}" name is cut off`); check(b.can, `beers: "${b.name}" can is missing or too small`); });
  await sheet('beers.png', shots, 390);
  await ctx.close();
}

// ---- good nights: weekly tiles in a 2x2 grid, coming-up dates as whole tappable tickets ------
if (want('events')) {
  const { ctx, page } = await open('/');
  const t = await topOf(page, '.a-events--night', -64);
  const shots = await frames(page, [t, t + 700, t + 1300].map(Math.round), 1100);
  const week = await page.evaluate(() => [...document.querySelectorAll('.a-events--night .a-week li')].map((li) => { const r = li.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top)]; }));
  check(week.length === 4 && new Set(week.map((w) => w[0])).size === 2 && new Set(week.map((w) => w[1])).size === 2, `events: weekly regulars are not a 2x2 grid (${JSON.stringify(week)})`);
  const tickets = await page.evaluate(() => [...document.querySelectorAll('.a-events--night .a-event:not([hidden]) .a-event-link')].map((a) => ({ h: a.getBoundingClientRect().height, w: a.getBoundingClientRect().width, chip: getComputedStyle(a.querySelector('.a-event-chip')).display })));
  check(tickets.length >= 1, 'events: no upcoming dates shown');
  check(tickets.every((k) => k.h >= 56 && k.w >= 300), `events: an upcoming date is not a full-width tappable ticket (${tickets.map((k) => Math.round(k.w) + 'x' + Math.round(k.h)).join(', ')})`);
  check(tickets.every((k) => k.chip === 'none'), 'events: separate arrow boxes are still shown beside each date');
  await sheet('events.png', shots, 390);
  await ctx.close();
}

// ---- bring the whole crew: no sliding text; the hall photo carries the heading ---------------
if (want('crew')) {
  const { ctx, page } = await open('/');
  const t = await topOf(page, '.a-crew', -80);
  const shots = await frames(page, [t - 300, t, t + 520].map(Math.round), 1300);
  const geo = await page.evaluate(() => { const p = document.querySelector('.a-crew-photo picture').getBoundingClientRect(); const h = document.querySelector('.a-crew-title').getBoundingClientRect(); return { pw: p.width, overlap: h.top < p.bottom && h.bottom > p.top }; });
  check(geo.pw >= 388, `crew: the hall photo is not full width (${Math.round(geo.pw)}px)`);
  check(geo.overlap, 'crew: the heading does not sit over the hall photo');
  await sheet('crew.png', shots, 390);
  await ctx.close();
}

// ---- around the pub: printed photos with captions -------------------------------------------
if (want('pub')) {
  const { ctx, page } = await open('/');
  const t = await topOf(page, '.house-mobile-company', -100);
  const h = await page.evaluate(() => document.querySelector('.house-mobile-company').getBoundingClientRect().height);
  const shots = await frames(page, [t, t + Math.max(0, h - 700)].map(Math.round), 1400);
  const prints = await page.evaluate(() => [...document.querySelectorAll('.house-mobile-company figure')].map((f) => ({ cap: (f.querySelector('figcaption')?.textContent || '').trim(), img: f.querySelector('img')?.naturalWidth > 0, r: f.getBoundingClientRect().right, l: f.getBoundingClientRect().left })));
  check(prints.length >= 3, `pub: expected at least 3 prints, found ${prints.length}`);
  check(prints.every((p) => p.cap && p.img), 'pub: a print is missing its photo or caption');
  check(prints.every((p) => p.l >= 4 && p.r <= 386), 'pub: a print runs off the screen');
  await sheet('pub.png', shots, 390);
  await ctx.close();
}

// ---- brewed here: a pint beside the milestones fills as you read them ------------------------
if (want('story')) {
  const { ctx, page } = await open('/');
  const g = await page.evaluate(() => { const el = document.querySelector('.a-story .a-glass'); const cs = getComputedStyle(el); return { d: cs.display, pos: cs.position, h: el.getBoundingClientRect().height }; });
  check(g.d !== 'none' && g.h >= 90, `story: the pint is not shown on phones (${g.d}, ${Math.round(g.h)}px)`);
  check(g.pos === 'sticky', `story: the pint does not stay beside the milestones (position ${g.pos})`);
  const listTop = await topOf(page, '.a-marks', 0), listH = await page.evaluate(() => document.querySelector('.a-marks').getBoundingClientRect().height);
  const read = () => page.evaluate(() => { const gl = document.querySelector('.a-story .a-glass'); return { level: parseFloat(getComputedStyle(gl).getPropertyValue('--level')), lit: document.querySelectorAll('.a-story .a-mark.is-lit').length, gTop: gl.getBoundingClientRect().top, gBottom: gl.getBoundingClientRect().bottom }; });
  const ys = [listTop - 844, listTop - 420, listTop - 200, listTop + listH * 0.25 - 300, listTop + listH * 0.5 - 300, listTop + listH * 0.75 - 300, listTop + listH - 300].map(Math.round);
  const samples = [], shots = [];
  for (const y of ys) { await scrollTo(page, y, 900); samples.push(await read()); shots.push(await page.screenshot()); }
  note(`story: level ${samples.map((s) => s.level.toFixed(2)).join(' → ')}; lit ${samples.map((s) => s.lit).join(' → ')}`);
  check(samples[0].level <= 0.2 && samples[0].lit === 0, `story: the pint starts full or marks start lit (${samples[0].level}, ${samples[0].lit})`);
  check(samples.at(-1).level >= 0.95 && samples.at(-1).lit === 4, `story: the pint is not full with every milestone lit by the end (${samples.at(-1).level}, ${samples.at(-1).lit})`);
  check(samples.every((s, i) => !i || (s.level >= samples[i - 1].level - 0.01 && s.lit >= samples[i - 1].lit)), 'story: the pour goes backwards while scrolling down');
  const mid = samples.slice(3, 6);
  check(mid.every((s) => s.gTop >= 60 && s.gBottom <= 844), 'story: the pint leaves the screen while the milestones are being read');
  await sheet('story.png', [shots[1], shots[3], shots[4], shots[5], shots[6]], 390);
  await ctx.close();
}

// ---- kept: the day-to-night hero and the rolling pizza still play ---------------------------
if (want('kept')) {
  const { ctx, page } = await open('/');
  const night = () => page.evaluate(() => +getComputedStyle(document.querySelector('.a-hero-flat-night')).opacity);
  const n0 = await night(); await scrollTo(page, 460, 900); const n1 = await night();
  check(n0 < 0.1 && n1 > 0.6, `kept: the hero no longer turns to night (${n0} → ${n1})`);
  const lit = await page.evaluate(() => [...document.querySelectorAll('.a-hero-art .a-bulb-core')].filter((c) => +getComputedStyle(c).opacity > 0.5).length);
  check(lit > 3, `kept: the hero's string lights do not come on (${lit} lit)`);
  const food = await topOf(page, '.a-food', 0);
  const spotX = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelector('.a-food-spot')).transform).m41);
  await scrollTo(page, food - 844 * 0.9, 900); const x0 = await spotX();
  await scrollTo(page, food - 844 * 0.25, 900); const x1 = await spotX();
  check(x0 < -40 && Math.abs(x1) < 6, `kept: the little pizza no longer rolls in from the left (${Math.round(x0)} → ${Math.round(x1)})`);
  await ctx.close();
}

// ---- reduced motion and no-JS keep every section readable -----------------------------------
if (want('reduced')) {
  for (const mode of [{ reduced: true }, { js: false }]) {
    const { ctx, page } = await open('/', mode);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 800) await scrollTo(page, y, 60);
    const hidden = await page.evaluate(() => [...document.querySelectorAll('main h2, main h3, main p, main li, main figure, main img')].filter((el) => {
      if (el.closest('[aria-hidden="true"], .sr-only, [hidden], .desktop-experience, .a-hero-after, .a-hero-tonight')) return false;
      if (!el.getClientRects().length) return false;
      for (let n = el; n && n !== document.body; n = n.parentElement) { const cs = getComputedStyle(n); if (+cs.opacity < 0.05 || cs.visibility === 'hidden') return true; }
      return false;
    }).map((el) => el.tagName + '.' + el.className).slice(0, 6));
    const sw = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    const label = mode.reduced ? 'reduced motion' : 'no JavaScript';
    check(!hidden.length, `${label}: content left invisible: ${hidden.join(', ')}`);
    check(sw <= 0, `${label}: page scrolls sideways by ${sw}px`);
    await ctx.close();
  }
}

// ---- type floor and tap targets on the phone home page --------------------------------------
if (want('type')) {
  const { ctx, page } = await open('/');
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 800) await scrollTo(page, y, 80);
  const small = await page.evaluate(() => {
    const bad = [];
    const walker = document.createTreeWalker(document.querySelector('main'), NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const el = n.parentElement; if (!n.textContent.trim() || !el.getClientRects().length) continue;
      if (el.closest('.sr-only, [aria-hidden="true"], .desktop-experience, sub, .a-sub')) continue;
      const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 13) bad.push(`${n.textContent.trim().slice(0, 24)} (${fs}px)`);
    }
    return bad;
  });
  check(!small.length, `type: text under 13px on the phone home page: ${small.slice(0, 6).join('; ')}`);
  const taps = await page.evaluate(() => [...document.querySelectorAll('main :is(.a-btn, .a-event-link, .a-perk, .house-link)')].filter((a) => a.getClientRects().length && !a.closest('.desktop-experience, [hidden]')).map((a) => ({ t: a.textContent.trim().slice(0, 24), h: a.getBoundingClientRect().height })).filter((a) => a.h < 44));
  check(!taps.length, `type: buttons/links under 44px tall: ${taps.map((a) => a.t + ' ' + Math.round(a.h)).join('; ')}`);
  await ctx.close();
}

// ---- overview sheets: the whole phone home page, top to bottom ------------------------------
if (want('overview')) {
  for (const [vp, tag] of [[PHONE, 'overview'], [SMALL, 'overview-small']]) {
    const { ctx, page } = await open('/', { vp });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const ys = []; for (let y = 0; y < H - vp.height / 2; y += vp.height) ys.push(y);
    const shots = await frames(page, ys, 900);
    // Half-size frames, up to 12 per sheet.
    const small = await Promise.all(shots.map((b) => sharp(b).resize(Math.round(vp.width / 2)).toBuffer()));
    for (let s = 0; s * 12 < small.length; s++) await sheet(`${tag}-${s + 1}.png`, small.slice(s * 12, s * 12 + 12), Math.round(vp.width / 2));
    note(`${tag}: ${shots.length} frames`);
    await ctx.close();
  }
}

// ---- October 8 follow-up ------------------------------------------------------------------------
// The dish deck holds still: nothing re-transforms the stuck cards on every scroll frame (that is
// what shook on iPhone), and every card and photo stays inside the screen at iPhone 15 Pro size.
if (want('steady')) {
  const { ctx, page } = await open('/', { vp: IPHONE15 });
  const t = await topOf(page, '.a-courses', -120);
  const span = await page.evaluate(() => document.querySelector('.a-courses').getBoundingClientRect().height);
  await scrollTo(page, t + span * 0.6, 900);
  const scrubbed = await page.evaluate(() => {
    if (!window.ScrollTrigger) return -1;
    const targetsOf = (a) => (a.getChildren ? a.getChildren(true, true, false).flatMap(targetsOf) : a.targets ? a.targets() : []);
    return ScrollTrigger.getAll().filter((st) => st.vars.scrub && st.animation && targetsOf(st.animation).some((el) => el.classList && el.classList.contains('a-course'))).length;
  });
  check(scrubbed === 0, `steady: ${scrubbed} scroll-scrubbed animation(s) still move the stuck dish cards`);
  const fit = await page.evaluate(() => [...document.querySelectorAll('.a-course')].map((c) => { const r = c.getBoundingClientRect(), p = c.querySelector('.a-plate-in').getBoundingClientRect(); return { l: r.left, r: r.right, inner: c.scrollWidth - c.clientWidth, pr: p.right }; }));
  fit.forEach((f, i) => check(f.l >= 12 && f.r <= IPHONE15.width - 12 && f.inner <= 0 && f.pr <= f.r, `steady: dish card ${i + 1} or its photo runs past the screen (${Math.round(f.l)}–${Math.round(f.r)}, photo to ${Math.round(f.pr)})`));
  const covered = await page.evaluate(() => [...document.querySelectorAll('.a-course')].map((c) => c.classList.contains('is-covered')));
  check(covered[0] && !covered[4], `steady: covered cards are not marked as covered (${covered.join(',')})`);
  await ctx.close();
}

// ---- brewed here: the pint stays put mid-screen and pours; one milestone at a time ------------
if (want('pour')) {
  const { ctx, page } = await open('/', { vp: IPHONE15 });
  const listTop = await topOf(page, '.a-marks', 0), listH = await page.evaluate(() => document.querySelector('.a-marks').getBoundingClientRect().height);
  const read = () => page.evaluate(() => {
    const gl = document.querySelector('.a-story .a-glass'), r = gl.getBoundingClientRect();
    const shown = [...document.querySelectorAll('.a-story .a-mark')].filter((m) => +getComputedStyle(m).opacity > 0.5 && m.getBoundingClientRect().bottom > 0 && m.getBoundingClientRect().top < innerHeight);
    const stream = document.querySelector('.a-story .a-pour--above');
    return { top: r.top, bottom: r.bottom, cx: r.left + r.width / 2, level: parseFloat(getComputedStyle(gl).getPropertyValue('--level')), shown: shown.map((m) => m.dataset.mark), stream: stream ? +getComputedStyle(stream).opacity * (getComputedStyle(stream).display === 'none' ? 0 : 1) : 0, sh: stream ? stream.getBoundingClientRect().height : 0 };
  });
  // The scene runs while the milestones are held in place: from the first one reaching its spot
  // to the last one leaving it. Sample evenly inside that stretch.
  const geo = await page.evaluate(() => { const lis = [...document.querySelectorAll('.a-story .a-mark')]; return { T: parseFloat(getComputedStyle(lis[0]).top), lastH: lis.at(-1).offsetHeight }; });
  check(Number.isFinite(geo.T), 'pour: the milestones are not held in place while the pint pours');
  const from = listTop - (geo.T || 0), to = listTop + listH - (geo.T || 0) - geo.lastH;
  const ys = [0.1, 0.3, 0.5, 0.7, 0.9].map((f) => Math.round(from + (to - from) * f));
  const s = [], shots = [];
  for (const y of ys) { await scrollTo(page, y, 1000); s.push(await read()); shots.push(await page.screenshot()); }
  await scrollTo(page, Math.round(to + 200), 1000); const end = await read();
  note(`pour: glass top ${s.map((x) => Math.round(x.top)).join(', ')}; level ${s.map((x) => x.level.toFixed(2)).join(' → ')} → ${end.level.toFixed(2)}; shown ${s.map((x) => x.shown.join('+') || '-').join(' | ')}; stream ${s.map((x) => x.stream.toFixed(1)).join(', ')} → ${end.stream.toFixed(1)}`);
  const tops = s.map((x) => x.top);
  check(Math.max(...tops) - Math.min(...tops) <= 2, `pour: the pint moves on screen while it pours (top ${tops.map(Math.round).join(', ')})`);
  check(s.every((x) => x.top >= 64 && x.bottom <= IPHONE15.height - 40 && Math.abs(x.cx - IPHONE15.width / 2) <= 4), 'pour: the pint is not centred and fully on screen during the pour');
  check(s.every((x, i) => !i || x.level > s[i - 1].level), `pour: the level does not rise steadily (${s.map((x) => x.level.toFixed(2)).join(', ')})`);
  check(s.every((x) => x.shown.length === 1), `pour: not exactly one milestone on screen at a time (${s.map((x) => x.shown.length).join(', ')})`);
  check(new Set(s.map((x) => x.shown[0])).size >= 3, 'pour: the milestone shown does not change as the pint fills');
  check(s.slice(0, 4).every((x) => x.stream > 0.5 && x.sh > 20), 'pour: no stream of beer pours into the glass while it fills');
  check(end.level >= 0.99 && end.stream < 0.1, `pour: at the end the glass is not full with the pour stopped (${end.level}, stream ${end.stream})`);
  await sheet('pour.png', shots, IPHONE15.width);
  await ctx.close();
}

// ---- footer: composed for a phone ------------------------------------------------------------
if (want('footer')) {
  const { ctx, page, errors } = await open('/', { vp: IPHONE15 });
  const t = await topOf(page, '.a-footer-body', -64);
  const h = await page.evaluate(() => document.querySelector('.a-footer-body').getBoundingClientRect().height);
  const shots = await frames(page, [t, t + Math.max(0, h - IPHONE15.height + 64)].map(Math.round), 900);
  const m = await page.evaluate(() => {
    const body = document.querySelector('.a-footer-body');
    // Standalone links and controls; links inside the credits' prose are inline text (exempt).
    const taps = [...body.querySelectorAll('a, summary')].filter((a) => a.getClientRects().length && !a.closest('.a-credits div')).map((a) => ({ t: a.textContent.trim().slice(0, 22), h: a.getBoundingClientRect().height, r: a.getBoundingClientRect().right })).filter((a) => a.h < 44 || a.r > innerWidth);
    // Text under 13px; the logo lockup's sub-line is exempt, as it is elsewhere on the site.
    const small = [];
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) { const el = n.parentElement; if (!n.textContent.trim() || !el.getClientRects().length || el.closest('[aria-hidden="true"], .sr-only, details:not([open]) > div, .a-footer-sub')) continue; const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 13) small.push(`${n.textContent.trim().slice(0, 20)} (${fs}px)`); }
    const word = document.querySelector('.a-giant-word').getBoundingClientRect();
    return { taps, small, wordW: word.width, sw: document.documentElement.scrollWidth - innerWidth };
  });
  check(!m.taps.length, `footer: links under 44px tall or off screen: ${m.taps.map((a) => `${a.t} ${Math.round(a.h)}`).join('; ')}`);
  check(!m.small.length, `footer: text under 13px: ${m.small.slice(0, 5).join('; ')}`);
  check(m.wordW >= IPHONE15.width * 0.8, `footer: the giant Alibi does not span the phone (${Math.round(m.wordW)}px)`);
  check(m.sw <= 0 && !errors.length, 'footer: sideways scroll or console errors');
  await sheet('footer.png', shots, IPHONE15.width);
  await ctx.close();
}

// ---- sticky elements must not sit inside a clipping container -----------------------------------
// iPhone Safari only moves a sticky element in step with the scroll when no ancestor clips overflow
// (overflow hidden/clip/auto/scroll on either axis). Otherwise it repositions it from the main
// thread a frame late, and it shakes while scrolling (October 8: the dish deck and the pint).
if (want('sticky')) {
  for (const [vp, path] of [IPHONE15, SMALL, TABLET].flatMap((v) => ['/', '/menu/', '/whats-on/', '/visit/'].map((p) => [v, p]))) {
    const { ctx, page } = await open(path, { vp });
    const bad = await page.evaluate(() => {
      const found = [];
      // The body's overflow moves to the viewport when <html> has none of its own, so it clips nothing.
      const root = getComputedStyle(document.documentElement), bodyToViewport = root.overflowX === 'visible' && root.overflowY === 'visible';
      document.querySelectorAll('body *').forEach((el) => {
        if (getComputedStyle(el).position !== 'sticky' || !el.getClientRects().length) return;
        for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
          if (a === document.body && bodyToViewport) continue;
          const cs = getComputedStyle(a);
          if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') { found.push(`.${String(el.className).split(' ')[0]} inside ${a.tagName.toLowerCase()}.${String(a.className).split(' ').join('.')} (overflow ${cs.overflowX} / ${cs.overflowY})`); break; }
        }
      });
      return [...new Set(found)];
    });
    const n = await page.evaluate(() => [...document.querySelectorAll('body *')].filter((el) => getComputedStyle(el).position === 'sticky' && el.getClientRects().length).length);
    note(`sticky ${vp.width}x${vp.height} ${path}: ${n} sticky elements checked`);
    check(!bad.length, `sticky ${vp.width} ${path}: sticky elements inside a clipping container (iPhone Safari shakes them while scrolling): ${bad.slice(0, 6).join('; ')}`);
    await ctx.close();
  }
}

await browser.close();
writeFileSync(join(out, `phone-check-${part}.json`), JSON.stringify({ part, fails, notes }, null, 1));
notes.forEach((n) => console.log('· ' + n));
if (fails.length) { console.log(`FAIL (${fails.length}):\n- ` + fails.join('\n- ')); process.exit(1); }
console.log(`phone-check ${part}: all checks passed`);
