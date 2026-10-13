// Export the four wider AI-edited dish images; the pizza image stays unchanged.
// Run from the repository root: node tools/prep-wide-dishes.mjs
import sharp from 'sharp';
import { readFileSync, writeFileSync, statSync } from 'node:fs';

const manifestPath = 'src/data/images.json';
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
for (const key of ['dish-bao', 'dish-wings', 'dish-chicken', 'dish-salad']) {
  const input = `source-assets/generated/dishes-wide/${key}.png`;
  const { width, height } = await sharp(input).metadata();
  const { dominant } = await sharp(input).stats();
  const entry = { width, height, alpha: false, color: `rgb(${dominant.r} ${dominant.g} ${dominant.b})`, avif: [], webp: [], jpg: [] };
  for (const w of [480, 760, 1080, 1340]) {
    for (const ext of ['avif', 'webp', 'jpg']) {
      const output = `src/assets/img/${key}-${w}.${ext}`;
      const resized = sharp(input).removeAlpha().resize({ width: w });
      if (ext === 'avif') await resized.avif({ quality: 52, effort: 5 }).toFile(output);
      if (ext === 'webp') await resized.webp({ quality: 80, effort: 5 }).toFile(output);
      if (ext === 'jpg') await resized.jpeg({ quality: 82, mozjpeg: true }).toFile(output);
      entry[ext].push([w, `img/${key}-${w}.${ext}`, statSync(output).size]);
    }
  }
  manifest[key] = entry;
  console.log(`${key}: exported four responsive sizes`);
}
writeFileSync(manifestPath, JSON.stringify(manifest));
