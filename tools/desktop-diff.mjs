// Desktop regression guard for phone-only work: renders the current dist/ and a
// frozen baseline build side by side at desktop widths and fails on any pixel
// difference. Time is frozen with Playwright's clock (timers, rAF, Date) and CSS
// animations/transitions are switched off in both, so the two runs are identical
// unless the desktop output itself changed. Still pages allow a few pixels of
// antialiasing noise; scroll-scrubbed motion frames allow a small mean difference
// for sub-pixel scrub positions.
// Usage: node tools/desktop-diff.mjs <baselineDir> <outDir> [--widths 1440,1024,1000]
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require(execSync('npm root -g').toString().trim() + '/@playwright/cli/node_modules/playwright');
const sharp = require('sharp');

const argv = process.argv.slice(2);
const flagAt = argv.findIndex((a, i) => i > 1 && a.startsWith('--'));
const baseline = resolve(argv[0]);
const out = argv.slice(1, flagAt < 0 ? argv.length : flagAt).join(' ');
const rest = flagAt < 0 ? [] : argv.slice(flagAt);
const widths = (rest.includes('--widths') ? rest[rest.indexOf('--widths') + 1] : '1440,1024,1000').split(',').map(Number);
mkdirSync(out, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.json': 'application/json', '.txt': 'text/plain' };
function serve(root) {
  const srv = createServer((req, res) => {
    let p = join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    try { if (statSync(p).isDirectory()) p = join(p, 'index.html'); res.writeHead(200, { 'Content-Type': TYPES[extname(p)] || 'application/octet-stream' }); res.end(readFileSync(p)); }
    catch { res.writeHead(404); res.end(); }
  });
  return new Promise((ok) => srv.listen(0, '127.0.0.1', () => ok({ srv, url: `http://127.0.0.1:${srv.address().port}` })));
}
const cur = await serve(resolve('dist'));
const base = await serve(baseline);

const FREEZE = '*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}';
// The photo rope drifts on its own clock and the corner pint tracks total progress; neither is phone work,
// so in the motion frames both are hidden (still kept in layout) in the current and baseline renders alike.
const MOTION_MASK = '.desktop-prints, #a-pint{visibility:hidden!important}';
// Measured on two identical builds: still pages differ by at most 1 px; motion frames by a mean of at
// most 0.47 per channel (sub-pixel scrub positions). A moved or restyled section scores far higher.
const STILL_NOISE = 25, MOTION_MAD = 1.5;
const T0 = new Date('2026-10-07T18:30:00-07:00');
const browser = await chromium.launch();

async function render(origin, path, width, reduced, ys) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  await page.clock.install({ time: T0 });
  await page.goto(origin + path, { waitUntil: 'load' });
  await page.addStyleTag({ content: FREEZE + (reduced ? '' : MOTION_MASK) });
  await page.evaluate(() => document.fonts.ready);
  await page.clock.runFor(4000);
  // Every picture on the page loaded and decoded up front, so network timing can't differ between
  // the two runs. Images inside hidden (display: none) sections are left alone, as a real visit does.
  const settle = () => page.evaluate(async () => {
    const imgs = [...document.images].filter((i) => i.getClientRects().length);
    imgs.forEach((i) => { i.loading = 'eager'; });
    await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener('load', r, { once: true }); i.addEventListener('error', r, { once: true }); }))));
    await Promise.all(imgs.map((i) => i.decode().catch(() => null)));
  });
  await settle();
  await page.clock.runFor(500);
  const shots = [];
  if (reduced) {
    // The whole page, one window at a time from top to bottom, as a visitor sees it. (A single
    // full-page capture draws the page as one 17,000px surface, where Chrome rasterizes the
    // outlined marquee words differently whenever an extra stylesheet is linked, even one whose
    // media query never matches; at real window sizes the pixels are identical.)
    const max = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
    for (let y = 0; ; y = Math.min(max, y + 900)) {
      await page.evaluate((v) => scrollTo(0, v), y);
      // Scroll observers (the header's shadow, the menu's current category) run on real time, not the frozen clock.
      await page.waitForTimeout(350);
      await page.clock.runFor(300);
      await settle();
      await page.waitForTimeout(100);
      shots.push(await page.screenshot());
      if (y >= max) break;
    }
  } else {
    for (const y of ys) {
      const from = await page.evaluate(() => scrollY);
      const step = y > from ? 150 : -150;
      for (let s = from; step > 0 ? s < y : s > y; s += step) { await page.evaluate((v) => scrollTo(0, v), s); await page.clock.runFor(50); }
      await page.evaluate((v) => scrollTo(0, v), y);
      await page.clock.runFor(2500);
      await settle();
      // Snap every scrubbed timeline to its trigger's exact progress, so smoothing lag can't differ.
      await page.evaluate(() => { const ST = window.ScrollTrigger; if (!ST) return; ST.update(); ST.getAll().forEach((st) => { if (st.animation && st.vars.scrub) st.animation.progress(st.progress); }); });
      await page.clock.runFor(100);
      shots.push(await page.screenshot());
    }
  }
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  await ctx.close();
  return { shots, height };
}

async function diff(a, b) {
  const A = sharp(a), B = sharp(b);
  const [ma, mb] = await Promise.all([A.metadata(), B.metadata()]);
  if (ma.width !== mb.width || ma.height !== mb.height) return { size: `${ma.width}x${ma.height} vs ${mb.width}x${mb.height}`, px: Infinity };
  const [ra, rb] = await Promise.all([A.raw().toBuffer(), B.raw().toBuffer()]);
  const ch = ma.channels;
  let px = 0, sum = 0;
  for (let i = 0; i < ra.length; i += ch) {
    const d = Math.abs(ra[i] - rb[i]) + Math.abs(ra[i + 1] - rb[i + 1]) + Math.abs(ra[i + 2] - rb[i + 2]);
    if (d) { px++; sum += d; }
  }
  // mad: mean absolute difference per channel over the whole frame (0-255).
  return { px, total: ma.width * ma.height, mad: +(sum / (ma.width * ma.height * 3)).toFixed(4) };
}

const fails = [], rows = [];
const PAGES = ['/', '/menu/', '/whats-on/', '/visit/'];
for (const width of widths) {
  for (const path of PAGES) {
    // Reduced motion: the complete still page, full length. Renders run one at a time, and a
    // mismatch is rendered once more before it counts (a busy machine can rasterize a frame
    // differently); a real change differs both times.
    // The page's pixel differences are summed over all its windows.
    const compare = async (c, b) => {
      if (c.shots.length !== b.shots.length || c.height !== b.height) return { size: `page height ${c.height} vs ${b.height}`, px: Infinity, worst: 0 };
      const ds = await Promise.all(c.shots.map((s, i) => diff(s, b.shots[i])));
      const worst = ds.reduce((w, d, i) => (d.px > ds[w].px ? i : w), 0);
      return { px: ds.reduce((n, d) => n + d.px, 0), windows: ds.length, worst };
    };
    let c = await render(cur.url, path, width, true), b = await render(base.url, path, width, true);
    let d = await compare(c, b);
    if (!(d.px <= STILL_NOISE)) { c = await render(cur.url, path, width, true); b = await render(base.url, path, width, true); d = await compare(c, b); }
    const tag = `${width}${path.replace(/\//g, '_')}still`;
    rows.push({ tag, ...d });
    if (!(d.px <= STILL_NOISE)) { fails.push(`${tag}: ${d.size || d.px + ' px differ'}`); writeFileSync(join(out, `${tag}-current.png`), c.shots[d.worst]); writeFileSync(join(out, `${tag}-baseline.png`), b.shots[d.worst]); }
  }
  // Motion on: the home page's scroll scenes at fixed positions along the page.
  const probe = await render(base.url, '/', width, false, [0]);
  const H = probe.height;
  const ys = Array.from({ length: 14 }, (_, i) => Math.round((H - 900) * (i / 13)));
  let c = await render(cur.url, '/', width, false, ys), b = await render(base.url, '/', width, false, ys);
  if ((await Promise.all(ys.map((_, i) => diff(c.shots[i], b.shots[i])))).some((d) => !(d.mad <= MOTION_MAD))) { c = await render(cur.url, '/', width, false, ys); b = await render(base.url, '/', width, false, ys); }
  for (let i = 0; i < ys.length; i++) {
    const d = await diff(c.shots[i], b.shots[i]);
    const tag = `${width}_home_motion_y${ys[i]}`;
    rows.push({ tag, ...d });
    if (!(d.mad <= MOTION_MAD)) { fails.push(`${tag}: ${d.size || d.px + ' px differ, mean diff ' + d.mad}`); writeFileSync(join(out, `${tag}-current.png`), c.shots[i]); writeFileSync(join(out, `${tag}-baseline.png`), b.shots[i]); }
  }
  if (c.height !== b.height) fails.push(`${width} home motion page height ${c.height} vs baseline ${b.height}`);
}
await browser.close();
cur.srv.close(); base.srv.close();
writeFileSync(join(out, 'desktop-diff.json'), JSON.stringify({ widths, rows, fails }, null, 1));
console.log(`desktop-diff: ${rows.length} comparisons at ${widths.join(', ')}px`);
if (fails.length) { console.log('DESKTOP CHANGED:\n' + fails.join('\n')); process.exit(1); }
const worst = (re) => Math.max(0, ...rows.filter((r) => re.test(r.tag)).map((r) => r.px));
console.log(`desktop matches baseline: still pages max ${worst(/still/)} px differ (limit ${STILL_NOISE}); motion frames max mean diff ${Math.max(0, ...rows.filter((r) => /motion/.test(r.tag)).map((r) => r.mad))} per channel (limit ${MOTION_MAD})`);
