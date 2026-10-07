// Probe for the October 5 follow-up (footer, find us, hero night, photo rope
// speed, the pint-filling story, phones). Usage:
//   node tools/round3-check.mjs <baseUrl> <outDir> --part <footer|visit|hero|rope|story|mobile|reduced|all>
// Writes PNG frames into <outDir>; exits non-zero listing each failure.
// Pin positions are page coordinates (getBoundingClientRect + scrollY).
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/@playwright/cli/node_modules/playwright');

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
const SMALL = { viewport: { width: 360, height: 780 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

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
async function scrollTo(page, y, ms = 1100) {
  const from = await page.evaluate(() => scrollY);
  const steps = Math.max(1, Math.ceil(Math.abs(y - from) / 350));
  for (let i = 1; i <= steps; i++) { await page.evaluate((v) => scrollTo(0, v), from + ((y - from) * i) / steps); await page.waitForTimeout(50); }
  await page.waitForTimeout(ms);
}
const topOf = (page, sel) => page.evaluate((s) => { const el = document.querySelector(s); return el ? el.getBoundingClientRect().top + scrollY : null; }, sel);
const spacerOf = (page, sel) => page.evaluate((s) => { const sp = document.querySelector(s)?.closest('.pin-spacer'); return sp ? { top: sp.getBoundingClientRect().top + scrollY, h: sp.offsetHeight } : null; }, sel);

// ---------------------------------------------------------------------------- footer
if (want('footer')) {
  for (const [name, opts] of [['1440', DESK], ['390', PHONE]]) {
    const { ctx, page, errors } = await open(opts);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    await scrollTo(page, H, 2200);
    const m = await page.evaluate(() => {
      const g = document.querySelector('.a-footer-giant'), w = g?.querySelector('.a-giant-word'), n = document.querySelector('.a-footer-notes');
      if (!g || !w || !n) return null;
      const gr = g.getBoundingClientRect(), wr = w.getBoundingClientRect(), nr = n.getBoundingClientRect();
      return {
        inside: wr.top >= gr.top - 1 && wr.bottom <= gr.bottom + 1 && wr.left >= gr.left - 1 && wr.right <= gr.right + 1,
        word: [Math.round(wr.top), Math.round(wr.bottom)], box: [Math.round(gr.top), Math.round(gr.bottom)],
        gap: Math.round(nr.top - wr.bottom),
        lockup: !!document.querySelector('.a-footer img[src*="alibi-footer-lockup"], .a-giant-mark'),
        signoff: !!n.querySelector('.a-footer-signoff'), notesVisible: nr.bottom <= innerHeight + 1 && nr.height > 0,
      };
    });
    check(!!m, `footer ${name}: giant word or subfooter missing`);
    if (m) {
      note(`footer ${name}: word ${m.word} in box ${m.box}; subfooter ${m.gap}px below the word`);
      check(m.inside, `footer ${name}: the giant "Alibi" is cut off by its container (word ${m.word}, box ${m.box})`);
      check(!m.lockup, `footer ${name}: the small lockup logo above the giant word is still there`);
      check(m.gap >= 40, `footer ${name}: the subfooter sits only ${m.gap}px below the giant word (need >= 40px)`);
      check(m.signoff && m.notesVisible, `footer ${name}: the subfooter with the sign-off is not visible at the bottom of the page`);
    }
    await page.screenshot({ path: join(out, `footer-end-${name}.png`) });
    check(errors.length === 0, `footer ${name}: console errors: ${errors.slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------- visit
if (want('visit')) {
  const { ctx, page, errors } = await open(DESK);
  const top = await topOf(page, '.a-visit');
  await scrollTo(page, top - 40, 2200);
  const m = await page.evaluate(() => {
    const sec = document.querySelector('.a-visit');
    const table = sec.querySelector('.a-hours-table');
    let el = table, bg = null;
    while (el) { const c = getComputedStyle(el).backgroundColor; const a = c.match(/[\d.]+/g); if (a && (a.length < 4 || +a[3] > 0.5)) { bg = a.slice(0, 3).map(Number); break; } el = el.parentElement; }
    const lum = bg ? bg.map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0) : 1;
    return {
      map: !!sec.querySelector('.a-map, [class*="map"]'), lum,
      rows: [...table.querySelectorAll('tr')].map((tr) => tr.querySelector('th')?.textContent.trim()),
      today: !!table.querySelector('tr.is-today'), text: sec.innerText,
    };
  });
  check(!m.map, 'visit: the map is still in the find-us section');
  check(m.lum <= 0.3, `visit: the hours board is on a light ground (luminance ${m.lum.toFixed(2)})`);
  check(m.rows.join(',') === 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', 'visit: hours board does not list Monday to Sunday');
  check(m.today, 'visit: today is not highlighted');
  for (const t of ['931 Tahoe', 'Get directions', '(775) 831-8300']) check(m.text.includes(t), `visit: "${t}" is missing`);
  await page.screenshot({ path: join(out, 'visit-1440.png') });
  check(errors.length === 0, `visit: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- hero (night)
if (want('hero')) {
  const { ctx, page, errors } = await open(DESK);
  const sp = await spacerOf(page, '[data-hero]');
  check(!!sp, 'hero: not pinned on desktop');
  if (sp) {
    await scrollTo(page, sp.top + sp.h - 900 - 20, 1800);
    const m = await page.evaluate(() => {
      const hero = document.querySelector('[data-hero]'), hr = hero.getBoundingClientRect();
      const shown = (el) => { for (let e = el; e && e !== hero; e = e.parentElement) { const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.5) return false; } return true; };
      const copy = hero.querySelector('.a-hero-copy');
      const boxes = [...copy.querySelectorAll('*')].filter((el) => !el.children.length || el.matches('svg, img, p, a, li'))
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.left < hr.left + hr.width * 0.42 && r.bottom > hr.top && r.top < hr.bottom && shown(el); })
        .map((el) => { const r = el.getBoundingClientRect(); return [r.top - hr.top, r.bottom - hr.top]; })
        .sort((a, b) => a[0] - b[0]);
      let gap = 0, end = boxes.length ? boxes[0][1] : 0;
      for (const [t, b] of boxes.slice(1)) { gap = Math.max(gap, t - end); end = Math.max(end, b); }
      return { n: boxes.length, first: boxes[0]?.[0] || 0, last: end, h: hr.height, gap };
    });
    note(`hero night: content from ${Math.round(m.first)} to ${Math.round(m.last)} of ${Math.round(m.h)}px; largest empty gap ${Math.round(m.gap)}px`);
    check(m.last / m.h >= 0.72, `hero: night content ends at ${Math.round((m.last / m.h) * 100)}% of the hero (need >= 72%)`);
    check(m.gap <= 110, `hero: the night column has an empty band of ${Math.round(m.gap)}px (need <= 110px)`);
    await page.screenshot({ path: join(out, 'hero-night.png') });
  }
  check(errors.length === 0, `hero: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- rope speed
if (want('rope')) {
  const { ctx, page, errors } = await open(DESK);
  const top = await topOf(page, '.house-company');
  await scrollTo(page, top - 60, 2500);
  await page.mouse.move(5, 5);
  const sample = () => page.evaluate(() => [...document.querySelectorAll('#company-rope .desktop-print')].map((p) => parseFloat((p.style.translate || '0').split(' ')[0])));
  const a = await sample(), t0 = Date.now();
  await page.waitForTimeout(3000);
  const b = await sample(), dt = (Date.now() - t0) / 1000;
  const speeds = a.map((x, i) => (b[i] - x) / dt).filter((v) => Math.abs(v) < 400).map(Math.abs).sort((x, y) => x - y);
  const median = speeds.length ? speeds[Math.floor(speeds.length / 2)] : 0;
  note(`rope: median drift ${median.toFixed(1)} px/s across ${speeds.length} photos (was 26 px/s)`);
  check(median >= 42 && median <= 80, `rope: the photo rope drifts at ${median.toFixed(1)} px/s (need 42-80 px/s, at least 1.6x the old 26 px/s)`);
  check(errors.length === 0, `rope: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- story (the pint fills)
if (want('story')) {
  const { ctx, page, errors } = await open(DESK);
  const sp = await spacerOf(page, '[data-story] .a-story-pin');
  check(!!sp, 'story: the desktop story scene is not pinned');
  if (sp) {
    const state = () => page.evaluate(() => {
      const beer = document.querySelector('[data-story] .a-story-beer');
      const r = beer?.getBoundingClientRect();
      return { level: r ? r.height * (beer.getBoundingClientRect().height ? 1 : 0) : -1, lit: document.querySelectorAll('[data-story] .a-mark.is-lit').length, marks: document.querySelectorAll('[data-story] .a-mark').length };
    });
    const levels = [], lits = [];
    let mid = false;
    for (let k = 0; k <= 8; k++) {
      await scrollTo(page, sp.top + (sp.h - 900) * (k / 8), 1000);
      const s = await state();
      levels.push(Math.round(s.level)); lits.push(s.lit);
      if (k === 4 && !mid) { await page.screenshot({ path: join(out, 'story-mid-1440.png') }); mid = true; }
      if (k === 8) await page.screenshot({ path: join(out, 'story-end-1440.png') });
    }
    await scrollTo(page, sp.top + 10, 1400);
    const back = await state();
    note(`story: beer level by step ${levels.join(' ')}; milestones lit ${lits.join(' ')}; after scrolling back ${back.lit} lit, level ${Math.round(back.level)}`);
    check(levels.every((v, i) => i === 0 || v >= levels[i - 1] - 2) && levels[8] - levels[0] > 200, 'story: the pint does not fill steadily with scroll');
    check(lits.every((v, i) => i === 0 || v >= lits[i - 1]) && lits[8] === 4 && lits[0] <= 1, `story: the four milestones do not light up one by one as the pint fills (${lits.join(' ')})`);
    check(back.lit <= 1 && back.level < levels[8] - 200, 'story: the scene does not reverse when scrolling back up');
  }
  check(errors.length === 0, `story: console errors: ${errors.slice(0, 3).join(' | ')}`);
  await ctx.close();
}

// ---------------------------------------------------------------------------- phones
if (want('mobile')) {
  for (const [name, opts] of [['390', PHONE], ['360', SMALL]]) {
    const { ctx, page, errors } = await open(opts);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    let overflow = 0;
    for (let y = 0; y < H; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(80); overflow = Math.max(overflow, await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)); }
    await page.waitForTimeout(800);
    const m = await page.evaluate(() => {
      const ST = window.ScrollTrigger;
      const all = ST ? ST.getAll() : [];
      const small = [...document.querySelectorAll('main .a-btn, .a-footer .a-btn, .a-footer-cols a, main .a-event-link, main .a-perk, main .a-link')]
        .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && getComputedStyle(el).visibility !== 'hidden' && !el.closest('.a-kept'); })
        .filter((el) => el.getBoundingClientRect().height < 44).map((el) => (el.textContent || '').trim().slice(0, 24));
      const tiny = [...document.querySelectorAll('main p, main li, main td, main th, .a-footer p, .a-footer a')]
        .filter((el) => !el.closest('.a-kept, [aria-hidden="true"], .sr-only') && (el.textContent || '').trim() && el.getBoundingClientRect().width > 0)
        .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 13).map((el) => (el.textContent || '').trim().slice(0, 24));
      return { pins: document.querySelectorAll('.pin-spacer').length, scrub: all.filter((t) => t.vars.scrub).length, triggers: all.length, small, tiny };
    });
    note(`phone ${name}: ${m.triggers} scroll triggers, ${m.scrub} scrubbed; overflow ${overflow}px`);
    check(overflow <= 0, `phone ${name}: horizontal overflow ${overflow}px`);
    check(m.pins === 0, `phone ${name}: a section pins`);
    check(m.scrub <= 6, `phone ${name}: ${m.scrub} scroll-scrubbed animations (need <= 6, keep phones simple)`);
    check(m.small.length === 0, `phone ${name}: tap targets under 44px tall: ${m.small.slice(0, 5).join(' | ')}`);
    check(m.tiny.length === 0, `phone ${name}: text under 13px: ${m.tiny.slice(0, 5).join(' | ')}`);
    check(errors.length === 0, `phone ${name}: console errors: ${errors.slice(0, 3).join(' | ')}`);
    await ctx.close();
  }
}

// ---------------------------------------------------------------------------- reduced motion
if (want('reduced')) {
  for (const [name, opts] of [['1440', DESK], ['390', PHONE]]) {
    const { ctx, page, errors } = await open(opts, { reducedMotion: 'reduce' });
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) { await page.evaluate((v) => scrollTo(0, v), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(800);
    check((await page.evaluate(() => document.querySelectorAll('.pin-spacer').length)) === 0, `reduced ${name}: a section pins`);
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
writeFileSync(join(out, 'round3-check.json'), JSON.stringify({ part, fails, notes }, null, 2));
for (const n of notes) console.log('note:', n);
if (fails.length) { for (const f of fails) console.log('FAIL:', f); process.exit(1); }
console.log(`round3-check ${part}: all checks passed`);
