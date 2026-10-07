// One-off: web sizes of the closing illustration (Alibi at night from the Beer
// Forest), generated with ChatGPT through Codex in the hero's flat poster
// style. Masters: source-assets/generated/closing/ (brief.txt, brief-phone.txt).
// Run: node tools/prep-closing.mjs
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const SRC = 'source-assets/generated/closing/';
const OUT = 'src/assets/art/closing/';
mkdirSync(OUT, { recursive: true });
const sets = { 'pub-night-wide': ['pub-night-2.png', [960, 1280, 1672]], 'pub-night-tall': ['pub-night-phone.png', [560, 800, 1120]] };
for (const [name, [file, widths]] of Object.entries(sets)) {
  const meta = await sharp(SRC + file).metadata();
  for (const w of widths.filter((x) => x <= meta.width)) {
    await sharp(SRC + file).resize({ width: w }).avif({ quality: 56, effort: 6 }).toFile(`${OUT}${name}-${w}.avif`);
    await sharp(SRC + file).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(`${OUT}${name}-${w}.webp`);
  }
  console.log(name, `${meta.width}x${meta.height}`, widths.filter((x) => x <= meta.width).join('/'));
}
