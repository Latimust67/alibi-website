// Local review helper: screenshots + layout audit of the built site.
// Usage: node tools/shot.mjs <baseUrl> <outDir> [--widths 390,1440] [--pages /,/menu/] [--reduced-motion] [--audit]
// --audit exits non-zero on horizontal overflow, console errors, broken images or missing kept sections.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const globalRoot = execSync('npm root -g').toString().trim();
const { chromium } = require(join(globalRoot, '@playwright/cli/node_modules/playwright'));
const sharp = require('sharp');

// An unquoted output path containing spaces arrives split across several
// arguments; rejoin everything up to the first --flag.
const argv = process.argv.slice(2);
const firstFlag = argv.findIndex((a, i) => i > 1 && a.startsWith('--'));
const base = argv[0];
const out = argv.slice(1, firstFlag < 0 ? argv.length : firstFlag).join(' ');
const rest = firstFlag < 0 ? [] : argv.slice(firstFlag);
const opt = (name, dflt) => { const i = rest.indexOf(name); return i < 0 ? dflt : rest[i + 1]; };
const widths = opt('--widths', '390,1440').split(',').map(Number);
const pages = opt('--pages', '/,/menu/,/whats-on/,/visit/').split(',');
const reduced = rest.includes('--reduced-motion');
const audit = rest.includes('--audit');
mkdirSync(out, { recursive: true });

const browser = await chromium.launch();
const problems = [];
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 844 : 900 }, deviceScaleFactor: 1, reducedMotion: reduced ? 'reduce' : 'no-preference', isMobile: w < 700, hasTouch: w < 700 });
  for (const p of pages) {
    const page = await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(new URL(p, base).href, { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);
    const slug = (p.replace(/\//g, '') || 'home') + '-' + w;
    await page.screenshot({ path: join(out, `${slug}-top.png`) });
    // Step through the page so lazy media and scroll-driven scenes settle, capturing stops.
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    const stops = Math.min(14, Math.ceil(height / (w < 700 ? 844 : 900)));
    for (let i = 1; i < stops; i++) {
      await page.evaluate((y) => window.scrollTo(0, y), Math.round((height / stops) * i));
      await page.waitForTimeout(450);
      await page.screenshot({ path: join(out, `${slug}-s${String(i).padStart(2, '0')}.png`) });
    }
    // One contact sheet per page and width, so a reviewer sees the whole page at once.
    const frames = [`${slug}-top.png`, ...Array.from({ length: stops - 1 }, (_, i) => `${slug}-s${String(i + 1).padStart(2, '0')}.png`)];
    const cols = 4, cellW = 420, cellH = Math.round(cellW * (w < 700 ? 844 : 900) / w), gap = 8;
    const rows = Math.ceil(frames.length / cols);
    const tiles = await Promise.all(frames.map(async (f, i) => ({
      input: await sharp(join(out, f)).resize(cellW, cellH).toBuffer(),
      left: (i % cols) * (cellW + gap), top: Math.floor(i / cols) * (cellH + gap),
    })));
    await sharp({ create: { width: cols * (cellW + gap), height: rows * (cellH + gap), channels: 3, background: '#888' } })
      .composite(tiles).jpeg({ quality: 80 }).toFile(join(out, `${slug}-sheet.jpg`));
    if (audit) {
      const r = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth - window.innerWidth,
        broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && !i.src.startsWith('data:')).map((i) => i.src),
        h1: document.querySelectorAll('h1').length,
        kept: { drinks: !!document.querySelector('.desktop-drinks'), mobileBeers: !!document.querySelector('.house-mobile-beers'), rope: !!document.querySelector('.house-company [data-rope], .house-company .photo-rope, #company-rope') },
      }));
      if (r.overflow > 1) problems.push(`${slug}: horizontal overflow ${r.overflow}px`);
      if (r.broken.length) problems.push(`${slug}: broken images ${r.broken.join(' ')}`);
      if (r.h1 !== 1) problems.push(`${slug}: expected exactly one h1, found ${r.h1}`);
      if (p === '/' && !(r.kept.drinks && r.kept.mobileBeers && r.kept.rope)) problems.push(`${slug}: kept section missing ${JSON.stringify(r.kept)}`);
      if (errors.length) problems.push(`${slug}: console errors ${errors.join(' | ')}`);
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();
writeFileSync(join(out, 'audit.txt'), problems.join('\n') || 'OK');
console.log(problems.length ? problems.join('\n') : 'AUDIT OK');
process.exit(audit && problems.length ? 1 : 0);
