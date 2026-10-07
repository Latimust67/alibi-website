// One-off: web sources for the layered desktop arrival.
//  - four depth layers (sky, land, deck, table), cut by Codex from the flat hero
//  - a glow map made from the deck layer's bulb pixels, so only the string
//    lights bloom at dusk (not the cream sails)
//  - a seeded star field in the same 1672 x 941 coordinate space
// Run: node tools/prep-layers.mjs
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const SRC = 'source-assets/generated/layers/';
const OUT = 'src/assets/art/hero/';
const W = 1672, H = 941;

for (const name of ['sky', 'land', 'deck', 'table']) {
  for (const w of [1280, 1672]) {
    const img = () => sharp(SRC + name + '.png').resize({ width: w });
    await img().webp({ quality: name === 'sky' ? 72 : 80, alphaQuality: 90, effort: 6 }).toFile(`${OUT}layer-${name}-${w}.webp`);
    await img().avif({ quality: name === 'sky' ? 45 : 55, effort: 6 }).toFile(`${OUT}layer-${name}-${w}.avif`);
  }
}

// Bulbs: bright, warm, low-blue pixels of the deck layer.
const { data, info } = await sharp(SRC + 'deck.png').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const glow = Buffer.alloc(info.width * info.height * 4);
let lit = 0;
for (let i = 0; i < info.width * info.height; i++) {
  const [r, g, b, a] = [data[i * 4], data[i * 4 + 1], data[i * 4 + 2], data[i * 4 + 3]];
  const warm = a > 200 && r > 235 && g > 195 && b < 175 && r - b > 85;
  if (warm) { glow[i * 4] = 255; glow[i * 4 + 1] = 196; glow[i * 4 + 2] = 110; glow[i * 4 + 3] = 255; lit++; }
}
await sharp(glow, { raw: { width: info.width, height: info.height, channels: 4 } })
  .blur(14).resize({ width: 836 }).webp({ quality: 70, alphaQuality: 80 }).toFile(`${OUT}layer-glow.webp`);
console.log('glow pixels', lit);

// Stars in the upper sky, seeded so every build matches.
let seed = 7;
const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const stars = Array.from({ length: 70 }, () => {
  const x = (rnd() * W).toFixed(0), y = (rnd() * H * 0.42).toFixed(0), r = (0.8 + rnd() * 1.8).toFixed(1), o = (0.35 + rnd() * 0.65).toFixed(2);
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff6dc" opacity="${o}"/>`;
}).join('');
writeFileSync(`${OUT}layer-stars.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">${stars}</svg>`);
console.log('layers written');
