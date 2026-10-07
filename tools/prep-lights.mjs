// One-off: switch the painted string lights off so the page can switch them on.
//  1. Finds every lit bulb in the deck layer (bright, warm, round blobs).
//  2. Paints each bulb and its orange halo out of the deck layer and the flat
//     hero, keeping darker pixels (wire, sockets) untouched. The fill comes from
//     the surrounding art in the same direction, so sails, trees and posts carry on.
//  3. Writes the bulb positions to src/data/bulbs.json (1672 x 941 space, the
//     shared coordinate system of every hero source), ordered from the bar outward.
//  4. Re-exports the web derivatives that prep-layers.mjs / prep-flat.mjs made.
// Run: node tools/prep-lights.mjs [--debug <png>]
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const DECK = 'source-assets/generated/layers/deck.png';
const FLAT = 'source-assets/generated/flat-hero.png';
const OUT = 'src/assets/art/hero/';
const debug = process.argv.includes('--debug') ? process.argv[process.argv.indexOf('--debug') + 1] : null;

const load = async (f) => {
  const { data, info } = await sharp(f).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
};
const deck = await load(DECK);
const { w: W, h: H } = deck;
const px = (img, x, y) => { const i = (y * img.w + x) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]]; };
const lum = ([r, g, b]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;

// ---- 1. bright warm cores, grouped into connected blobs ----
const core = new Uint8Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const [r, g, b, a] = px(deck, x, y);
  if (a > 200 && r > 238 && g > 214 && b > 120 && r - b < 120 && lum([r, g, b]) > 220) core[y * W + x] = 1;
}
const seen = new Uint8Array(W * H), blobs = [];
for (let s = 0; s < W * H; s++) {
  if (!core[s] || seen[s]) continue;
  const stack = [s]; seen[s] = 1; let n = 0, sx = 0, sy = 0, x0 = W, x1 = 0, y0 = H, y1 = 0;
  while (stack.length) {
    const p = stack.pop(), x = p % W, y = (p / W) | 0;
    n++; sx += x; sy += y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
    for (const q of [p - 1, p + 1, p - W, p + W]) if (q >= 0 && q < W * H && core[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
  }
  const bw = x1 - x0 + 1, bh = y1 - y0 + 1;
  blobs.push({ x: sx / n, y: sy / n, n, bw, bh });
}
// Bulbs are compact and roughly round; pendant-lamp rims are wide and flat.
const bulbs = blobs
  .filter((b) => b.n >= 12 && b.n <= 700 && b.bw / b.bh < 1.8 && b.bh / b.bw < 1.8)
  .map((b) => ({ x: +b.x.toFixed(1), y: +b.y.toFixed(1), r: +Math.max(3.5, Math.sqrt(b.n / Math.PI) * 1.12).toFixed(1) }))
  // The strings hang under the sails; brighter specks elsewhere (sail glints,
  // cheese on the pizza) are not bulbs.
  .filter((b) => b.y > 150 && b.y < 600 && b.r >= 4);
const lamps = blobs.filter((b) => b.n >= 20 && b.bw / b.bh >= 1.8).map((b) => ({ x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: b.bw }));
// From the bar (right) outward, so the strings light up the way current would run.
bulbs.sort((a, b) => b.x - a.x);
console.log(`bulbs ${bulbs.length}, lamps ${lamps.length}`);

// ---- 2. paint the bulbs and their halos out ----
// Each bulb's disc is refilled by diffusion from its edge (repeated neighbour
// averaging), which continues sails, needles and posts smoothly. The wire and
// sockets are darker than the art around them, so they stay as fixed pixels
// and the fill flows around them.
function unlight(img) {
  const out = Buffer.from(img.data);
  for (const b of bulbs) {
    const R = b.r * 2.45;
    const x0 = Math.max(1, Math.floor(b.x - R - 2)), x1 = Math.min(img.w - 2, Math.ceil(b.x + R + 2));
    const y0 = Math.max(1, Math.floor(b.y - R - 2)), y1 = Math.min(img.h - 2, Math.ceil(b.y + R + 2));
    // Typical brightness just outside the halo, to recognise the darker wire.
    const ring = [];
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - b.x, y - b.y);
      if (d > R && d <= R + 2.5 && px(img, x, y)[3] > 200) ring.push(lum(px(img, x, y)));
    }
    ring.sort((p, q) => p - q);
    const bgLum = ring.length ? ring[ring.length >> 1] : 128;
    const masked = [], wire = new Set();
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const d = Math.hypot(x - b.x, y - b.y);
      if (d > R) continue;
      const i = (y * img.w + x) * 4;
      if (img.data[i + 3] < 120) continue; // transparent surroundings stay transparent
      const c = [img.data[i], img.data[i + 1], img.data[i + 2]];
      if (d > b.r * 1.05 && lum(c) < bgLum * 0.62) { wire.add(i); continue; } // wire / socket: kept, never a fill source
      masked.push(i);
    }
    const isMasked = new Set(masked);
    const nb8 = [-4, 4, -img.w * 4, img.w * 4, -img.w * 4 - 4, -img.w * 4 + 4, img.w * 4 - 4, img.w * 4 + 4];
    // Onion peel: fill inward, each pixel from the already-known pixels beside it.
    const known = new Set();
    let todo = masked.slice();
    while (todo.length) {
      const next = [], fills = [];
      for (const i of todo) {
        let s = [0, 0, 0], n = 0;
        for (const o of nb8) {
          const j = i + o;
          if (out[j + 3] < 120 || wire.has(j)) continue;
          if (isMasked.has(j) && !known.has(j)) continue;
          for (let ch = 0; ch < 3; ch++) s[ch] += out[j + ch];
          n++;
        }
        if (n >= 2) fills.push([i, s.map((v) => v / n)]); else next.push(i);
      }
      if (!fills.length) break;
      for (const [i, c] of fills) { for (let ch = 0; ch < 3; ch++) out[i + ch] = Math.round(c[ch]); known.add(i); }
      todo = next;
    }
    // A short relaxation smooths the peel's streaks.
    const nb = [-4, 4, -img.w * 4, img.w * 4];
    const buf = new Float32Array(masked.length * 3);
    for (let it = 0; it < 60; it++) {
      masked.forEach((i, m) => {
        for (let ch = 0; ch < 3; ch++) {
          let s = 0, n = 0;
          for (const o of nb) { const j = i + o; if (out[j + 3] >= 120 && !wire.has(j)) { s += out[j + ch]; n++; } }
          buf[m * 3 + ch] = n ? s / n : out[i + ch];
        }
      });
      masked.forEach((i, m) => { for (let ch = 0; ch < 3; ch++) out[i + ch] = Math.round(buf[m * 3 + ch]); });
    }
    // Feather the outer edge of the fill back into the original halo-free pixels.
    for (const i of masked) {
      const p = i / 4, x = p % img.w, y = (p / img.w) | 0;
      const d = Math.hypot(x - b.x, y - b.y);
      if (d < R * 0.85) continue;
      const t = (d - R * 0.85) / (R * 0.15);
      for (let ch = 0; ch < 3; ch++) out[i + ch] = Math.round(out[i + ch] * (1 - t * 0.35) + img.data[i + ch] * (t * 0.35));
    }
  }
  return out;
}

const deckOut = unlight(deck);
await sharp(deckOut, { raw: { width: W, height: H, channels: 4 } }).png().toFile('source-assets/generated/layers/deck-unlit.png');
const flat = await load(FLAT);
const flatOut = unlight(flat);
await sharp(flatOut, { raw: { width: W, height: H, channels: 4 } }).removeAlpha().png().toFile('source-assets/generated/flat-hero-unlit.png');

if (debug) {
  const marks = bulbs.map((b, n) => `<circle cx="${b.x}" cy="${b.y}" r="${b.r * 2.9}" fill="none" stroke="#f0f" stroke-width="1.5"/><text x="${b.x + 8}" y="${b.y - 8}" font-size="12" fill="#f0f">${n}</text>`).join('')
    + lamps.map((l) => `<circle cx="${l.x}" cy="${l.y}" r="12" fill="none" stroke="#0ff" stroke-width="2"/>`).join('');
  await sharp('source-assets/generated/flat-hero-unlit.png')
    .composite([{ input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${marks}</svg>`) }])
    .png().toFile(debug);
}

writeFileSync('src/data/bulbs.json', JSON.stringify({ space: [W, H], bulbs, lamps }, null, 1));

// ---- 3. web derivatives (same sizes and settings as before) ----
for (const w of [1280, 1672]) {
  const img = () => sharp('source-assets/generated/layers/deck-unlit.png').resize({ width: w });
  await img().webp({ quality: 80, alphaQuality: 90, effort: 6 }).toFile(`${OUT}layer-deck-${w}.webp`);
  await img().avif({ quality: 55, effort: 6 }).toFile(`${OUT}layer-deck-${w}.avif`);
}
const HERO = 'source-assets/generated/flat-hero-unlit.png';
for (const w of [960, 1280, 1672]) {
  await sharp(HERO).resize({ width: w }).avif({ quality: 56, effort: 6 }).toFile(`${OUT}flat-wide-${w}.avif`);
  await sharp(HERO).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(`${OUT}flat-wide-${w}.webp`);
}
const crop = { left: 700, top: 293, width: 972, height: 648 };
for (const w of [780, 972]) {
  await sharp(HERO).extract(crop).resize({ width: w }).avif({ quality: 56, effort: 6 }).toFile(`${OUT}flat-phone-${w}.avif`);
  await sharp(HERO).extract(crop).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(`${OUT}flat-phone-${w}.webp`);
}
console.log('unlit hero sources written');
