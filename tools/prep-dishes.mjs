// One-off: 3:2 crops of real Alibi food photos for the home dish showcase,
// cut as wide as each photo allows so the whole plate shows (October 5: the
// earlier square crops in round windows hid most of each dish), plus the three
// transparent Alibi pint cutouts. Registered in images.json in the shape
// picture() reads.
// Run: node tools/prep-dishes.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const SRC = '../incline-demo/source-assets/';
// key: [file, crop {left, top, width, height}] — full-height 3:2 frames, nudged to centre the plate.
const DISHES = {
  'dish-pizza': ['official-extra/pizza-and-pints.jpg', { left: 2, top: 0, width: 1916, height: 1277 }],
  'dish-bao': ['official-extra/food-pork-belly-bao.png', { left: 150, top: 0, width: 1350, height: 900 }],
  'dish-wings': ['official-extra/food-chicken-wings-gorgonzola-dip-is-back.png', { left: 125, top: 0, width: 1350, height: 900 }],
  'dish-chicken': ['official-extra/food-chicken-sandwich-with-fries.png', { left: 125, top: 0, width: 1350, height: 900 }],
  'dish-salad': ['official-extra/food-garden-salad-champagne-lemon-vinaigrette.png', { left: 160, top: 0, width: 1350, height: 900 }],
};
const PINTS = { 'pint-gold': 'official-extra/pint-gold-cutout.png', 'pint-amber': 'official-extra/pint-amber-cutout.png', 'pint-dark': 'official-extra/pint-dark-cutout.png' };

const manifestPath = 'src/data/images.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const record = (key, w, ext) => [w, `img/${key}-${w}.${ext}`, statSync(`src/assets/img/${key}-${w}.${ext}`).size];

for (const [key, [file, c]] of Object.entries(DISHES)) {
  const input = SRC + file;
  const crop = () => sharp(input).rotate().extract({ left: c.left, top: c.top, width: c.width, height: c.height }).removeAlpha();
  const { dominant } = await crop().stats();
  const widths = [480, 760, 1080, 1340].filter((w) => w <= c.width);
  const entry = { width: c.width, height: c.height, alpha: false, color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`, avif: [], webp: [], jpg: [] };
  for (const w of widths) {
    await crop().resize({ width: w }).avif({ quality: 52, effort: 5 }).toFile(`src/assets/img/${key}-${w}.avif`);
    await crop().resize({ width: w }).webp({ quality: 80, effort: 5 }).toFile(`src/assets/img/${key}-${w}.webp`);
    await crop().resize({ width: w }).jpeg({ quality: 82, mozjpeg: true }).toFile(`src/assets/img/${key}-${w}.jpg`);
    for (const ext of ['avif', 'webp', 'jpg']) entry[ext].push(record(key, w, ext));
  }
  manifest[key] = entry;
  console.log(key, widths.join('/'));
}

for (const [key, file] of Object.entries(PINTS)) {
  const input = SRC + file;
  const meta = await sharp(input).metadata();
  const entry = { width: meta.width, height: meta.height, alpha: true, color: 'transparent', avif: [], webp: [] };
  for (const w of [200, 320, 480]) {
    await sharp(input).resize({ width: w }).avif({ quality: 60, effort: 5 }).toFile(`src/assets/img/${key}-${w}.avif`);
    await sharp(input).resize({ width: w }).webp({ quality: 84, alphaQuality: 90, effort: 5 }).toFile(`src/assets/img/${key}-${w}.webp`);
    for (const ext of ['avif', 'webp']) entry[ext].push(record(key, w, ext));
  }
  manifest[key] = entry;
  console.log(key, meta.width + 'x' + meta.height);
}
writeFileSync(manifestPath, JSON.stringify(manifest));
console.log('images.json updated');
