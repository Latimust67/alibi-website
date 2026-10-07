// One-off: sources for the flat poster-style arrival (same language as the
// six beer worlds) and its matching spot sheet. Run: node tools/prep-flat.mjs
import sharp from 'sharp';
const HERO = 'source-assets/generated/flat-hero.png';
const OUT = 'src/assets/art/hero';
for (const w of [960, 1280, 1672]) {
  await sharp(HERO).resize({ width: w }).avif({ quality: 56, effort: 6 }).toFile(`${OUT}/flat-wide-${w}.avif`);
  await sharp(HERO).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(`${OUT}/flat-wide-${w}.webp`);
}
// Phones: 3:2 crop around the sun, the deck, the pizza and both pints.
const crop = { left: 700, top: 293, width: 972, height: 648 };
for (const w of [780, 972]) {
  await sharp(HERO).extract(crop).resize({ width: w }).avif({ quality: 56, effort: 6 }).toFile(`${OUT}/flat-phone-${w}.avif`);
  await sharp(HERO).extract(crop).resize({ width: w }).webp({ quality: 82, effort: 6 }).toFile(`${OUT}/flat-phone-${w}.webp`);
}
console.log('flat hero sources written');
