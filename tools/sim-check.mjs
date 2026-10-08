// iPhone Safari probe: opens pages in Mobile Safari on an iOS Simulator and
// screenshots them, so Safari-only layout bugs show up (Chrome's phone emulation
// does not reproduce them). Usage:
//   node tools/sim-check.mjs <baseUrl> <outDir> [--device "iPhone 17"] [--part food|footer|all]
// Uses (and boots, if needed) the named simulator, never one already running
// another app's QA session. Exits non-zero, listing each failure.
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');
const argv = process.argv.slice(2);
const flagAt = argv.findIndex((a, i) => i > 1 && a.startsWith('--'));
const base = argv[0].replace(/\/$/, '');
const out = argv.slice(1, flagAt < 0 ? argv.length : flagAt).join(' ');
const rest = flagAt < 0 ? [] : argv.slice(flagAt);
const opt = (k, d) => (rest.includes(k) ? rest[rest.indexOf(k) + 1] : d);
const name = opt('--device', 'iPhone 17'), part = opt('--part', 'all');
const want = (p) => part === 'all' || part === p;
mkdirSync(out, { recursive: true });
const fails = [], notes = [];
const check = (ok, msg) => { if (!ok) fails.push(msg); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const simctl = (...a) => execFileSync('xcrun', ['simctl', ...a], { encoding: 'utf8' });

const devices = Object.values(JSON.parse(simctl('list', 'devices', 'available', '-j')).devices).flat();
const dev = devices.find((d) => d.name === name);
if (!dev) { console.log(`BLOCKED: no simulator named "${name}"`); process.exit(2); }
if (dev.state !== 'Booted') { simctl('boot', dev.udid); simctl('bootstatus', dev.udid, '-b'); }

async function shot(path, file, settle = 6000) {
  // A fresh query string each time, so Safari loads the current build rather than its cache.
  simctl('openurl', dev.udid, `${base}${path.includes('#') ? path.replace('#', `?sim=${Date.now()}#`) : `${path}?sim=${Date.now()}`}`);
  await wait(settle);
  const f = join(out, file);
  simctl('io', dev.udid, 'screenshot', f);
  return f;
}
// Share of rows in [y0, y1] (fractions of height) whose pixel at x matches the page's paper colour.
async function paperShare(file, xPt, y0, y1) {
  const img = sharp(file); const { width, height } = await img.metadata();
  const scale = width / 402 > 2.5 ? 3 : 2;
  const x = xPt < 0 ? width + Math.round(xPt * scale) : Math.round(xPt * scale);
  const raw = await img.raw().toBuffer(); const ch = raw.length / (width * height);
  let ok = 0, n = 0;
  for (let y = Math.round(height * y0); y < Math.round(height * y1); y++) {
    const i = (y * width + x) * ch; n++;
    if (Math.abs(raw[i] - 0xf3) <= 10 && Math.abs(raw[i + 1] - 0xee) <= 10 && Math.abs(raw[i + 2] - 0xe3) <= 10) ok++;
  }
  return ok / n;
}

if (want('food')) {
  // #dishes puts the first dish card just under the header; its edges should sit inside the screen.
  const f = await shot('/#dishes', 'safari-dishes.png');
  const right = await paperShare(f, -9, 0.2, 0.84), left = await paperShare(f, 9, 0.2, 0.84);
  notes.push(`dishes: paper beside the card ${Math.round(left * 100)}% left, ${Math.round(right * 100)}% right`);
  check(right >= 0.97, `Safari: the dish card runs past the right edge of the screen (paper beside it on only ${Math.round(right * 100)}% of rows)`);
  check(left >= 0.97, `Safari: the dish card runs past the left edge of the screen (${Math.round(left * 100)}%)`);
}
if (want('footer')) {
  await shot('/#footer-nav', 'safari-footer.png');
  notes.push('footer: screenshot taken');
}

writeFileSync(join(out, `sim-check-${part}.json`), JSON.stringify({ device: dev.name, part, fails, notes }, null, 1));
notes.forEach((n) => console.log('· ' + n));
if (fails.length) { console.log(`FAIL (${fails.length}):\n- ` + fails.join('\n- ')); process.exit(1); }
console.log(`sim-check ${part}: all checks passed on ${dev.name}`);
