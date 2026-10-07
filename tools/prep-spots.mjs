// One-off: cut the generated engraved spot sheet (3 x 2 grid on cream) into
// six transparent WebP spots. The cream ground is keyed out and un-mixed so
// edges carry no halo on any background. Run: node tools/prep-spots.mjs
import sharp from 'sharp';

// Flat poster-style sheet (matches the beer worlds); the earlier engraved sheet is kept in source-assets/generated.
const SHEET = 'source-assets/generated/flat-spots.png';
// Object boxes on the 1536 x 1024 sheet (x, y, w, h), measured from the sheet.
const BOXES = { pizza: [20, 140, 560, 320], pint: [640, 70, 260, 410], pretzel: [980, 200, 530, 230], burger: [50, 540, 440, 400], salad: [520, 570, 500, 350], pine: [1050, 510, 460, 430] };
const { data, info } = await sharp(SHEET).removeAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const px = (x, y) => { const i = (y * W + x) * 3; return [data[i], data[i + 1], data[i + 2]]; };

// Ground colour: median of a thin border around the sheet.
const border = [];
for (let x = 0; x < W; x += 7) border.push(px(x, 2), px(x, H - 3));
for (let y = 0; y < H; y += 7) border.push(px(2, y), px(W - 3, y));
const median = (k) => border.map((p) => p[k]).sort((a, b) => a - b)[border.length >> 1];
const bg = [median(0), median(1), median(2)];

for (const [name, [bx, by, bw, bh]] of Object.entries(BOXES)) {
  const out = Buffer.alloc(bw * bh * 4);
  let minX = bw, minY = bh, maxX = 0, maxY = 0;
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const p = px(Math.min(W - 1, bx + x), Math.min(H - 1, by + y));
      const d = Math.max(Math.abs(p[0] - bg[0]), Math.abs(p[1] - bg[1]), Math.abs(p[2] - bg[2]));
      const t = Math.min(1, Math.max(0, (d - 8) / 34));
      const a = t * t * (3 - 2 * t);
      const o = (y * bw + x) * 4;
      for (let k = 0; k < 3; k++) out[o + k] = a > 0.01 ? Math.max(0, Math.min(255, Math.round((p[k] - (1 - a) * bg[k]) / a))) : 0;
      out[o + 3] = Math.round(a * 255);
      if (a > 0.2) { minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
    }
  }
  const pad = 8;
  const crop = { left: Math.max(0, minX - pad), top: Math.max(0, minY - pad) };
  crop.width = Math.min(bw, maxX + pad) - crop.left;
  crop.height = Math.min(bh, maxY + pad) - crop.top;
  await sharp(out, { raw: { width: bw, height: bh, channels: 4 } }).extract(crop)
    .resize({ width: 420, height: 420, fit: 'inside' }).webp({ quality: 82, alphaQuality: 90, effort: 6 })
    .toFile(`src/assets/art/spots/${name}.webp`);
  console.log(name, crop.width + 'x' + crop.height, 'touches edge:', minX <= 1 || minY <= 1 || maxX >= bw - 2 || maxY >= bh - 2);
}
console.log('ground', bg.join(','));
