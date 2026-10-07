// One-off: responsive AVIF/WebP/JPEG sets for the higher-resolution Alibi
// originals kept in ../incline-demo/source-assets, registered in images.json
// in the same shape picture() already reads. Run: node tools/prep-photos.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const SRC = '../incline-demo/source-assets/official-extra/';
const PHOTOS = {
  'pizza-forager': 'pizza-forager-closeup.jpg',
  'pizza-greek': 'pizza-the-greek.jpg',
  'bar-room': 'iph-hero-bar-restaurant-space.jpg',
  'deck-bar': 'iph-deck-outdoor-bar-sunny.jpg',
  'forest-rail': 'iph-beer-forest-bar-rail-stools.jpg',
  'band-indoor': 'iph-live-music-indoor-night.jpg',
  'welcome-board': 'iph-interior-bar-welcome-board.jpg',
  'deck-crowd': 'iph-deck-crowd-pines.jpg',
  'sandwich-pint': 'iph-sandwich-and-pint.jpg',
  'event-hall-xl': 'iph-event-hall-stage-can-art.jpg',
  'chicken-sandwich': 'food-chicken-sandwich-with-fries.png',
};
const WIDTHS = [640, 960, 1400, 2000, 2600];
const manifestPath = 'src/data/images.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

for (const [key, file] of Object.entries(PHOTOS)) {
  const input = SRC + file;
  const meta = await sharp(input).metadata();
  const { dominant } = await sharp(input).stats();
  const widths = WIDTHS.filter((w) => w <= meta.width);
  if (!widths.includes(meta.width) && meta.width < WIDTHS.at(-1) && meta.width > widths.at(-1) * 1.15) widths.push(meta.width);
  const entry = { width: meta.width, height: meta.height, alpha: false, color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`, avif: [], webp: [], jpg: [] };
  for (const w of widths) {
    const base = () => sharp(input).rotate().resize({ width: w }).removeAlpha();
    const out = (ext) => `src/assets/img/${key}-${w}.${ext}`;
    await base().avif({ quality: 50, effort: 5 }).toFile(out('avif'));
    await base().webp({ quality: 78, effort: 5 }).toFile(out('webp'));
    await base().jpeg({ quality: 80, mozjpeg: true }).toFile(out('jpg'));
    for (const ext of ['avif', 'webp', 'jpg']) entry[ext].push([w, `img/${key}-${w}.${ext}`, statSync(out(ext)).size]);
  }
  manifest[key] = entry;
  console.log(key, meta.width + 'x' + meta.height, widths.join('/'));
}
writeFileSync(manifestPath, JSON.stringify(manifest));
console.log('images.json updated');
