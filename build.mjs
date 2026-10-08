// Static build: data (src/data) + templates (src/templates), with local GSAP assets
// -> dist/ with clean routes: /, /menu/, /whats-on/, /visit/ and a 404 page.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { layout, button, eyebrow } from './src/templates/alibi-shell.mjs';
import { home, homeHead } from './src/templates/alibi-home.mjs';
import { menuPage, whatsOnPage, visitPage } from './src/templates/alibi-routes.mjs';

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const site = read('src/data/site.json');
const menu = read('src/data/menu.json');
const events = read('src/data/events.json');

// A closure overrides anything else listed on the days it covers, so an editor
// only has to add the closure; overlapping regulars drop out automatically.
const closedDays = events.events.filter((e) => e.status === 'closure').map((e) => [e.date, e.endDate || e.date]);
events.events = events.events.filter((e) => e.status === 'closure' || !closedDays.some(([from, to]) => e.date >= from && e.date <= to));

// "Today" for the server-rendered upcoming list. The browser script re-checks
// against the visitor's own date, so a stale build never shows past events.
// Dates are the pub's local (Pacific) calendar days.
const pacificDate = (d) => {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(d).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
};
const today = process.env.BUILD_DATE || pacificDate(new Date());
const ctx = { site, menu, events, today };
const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const siteUrl = process.env.SITE_URL || (productionHost ? `https://${productionHost}` : '');
const publicBuild = process.env.VERCEL_ENV === 'production' || Boolean(process.env.SITE_URL);

const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });

const pages = [
  {
    out: 'index.html', path: '/', page: 'home', title: 'Alibi Incline Public House | Design preview', head: homeHead(),
    description: 'An unofficial design concept for Alibi Incline Public House, with venue photographs, beer illustrations, and links to Alibi’s official information.',
    main: home(ctx),
  },
  {
    out: 'menu/index.html', path: '/menu/', page: 'menu', title: 'Food and drink | Alibi design preview', head: '',
    description: 'A dated food and drink selection for an unofficial Alibi Incline design concept. Follow the official menu link for current choices.',
    main: menuPage(ctx),
  },
  {
    out: 'whats-on/index.html', path: '/whats-on/', page: 'whats-on', title: 'What’s on at Incline | Alibi design preview' , head: '',
    description: 'Dated Incline event listings in an unofficial Alibi design concept, with links to the official event calendar and notices.',
    main: whatsOnPage(ctx),
  },
  {
    out: 'visit/index.html', path: '/visit/', page: 'visit', title: 'Visit Incline Public House | Design preview', head: '',
    description: 'Address and sourced visit details for Alibi Incline Public House in an unofficial design concept, with official links for current information.',
    main: visitPage(ctx),
  },
  {
    out: '404.html', page: 'not-found', title: 'Page not found | Alibi design preview',
    description: 'This page is not part of the Alibi Incline Public House design concept.',
    main: `<section class="a-section a-lost" aria-labelledby="lost-title"><div class="a-wrap">
      ${eyebrow('404')}
      <h1 id="lost-title" class="a-display a-display--page">This table’s<br><em>not set.</em></h1>
      <p class="a-lede">That page isn’t part of the preview. The menu, the calendar and directions are all a click away.</p>
      <div class="a-actions">${button('/', 'Back to home')}${button('/menu/', 'See the menu', { tone: 'ghost' })}</div>
    </div></section>`,
  },
];

// Typographic apostrophes in visible text only (never inside tags, scripts or styles).
const typeset = (html) => html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/)
  .map((part) => (part.startsWith('<') ? part : part.replace(/'/g, '\u2019')))
  .join('');

for (const p of pages) {
  const file = join(OUT, p.out);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, typeset(layout({ site, events, today, siteUrl, publicBuild, ...p })));
}

// assets
mkdirSync(join(OUT, 'assets'), { recursive: true });
for (const dir of ['fonts', 'img', 'svg', 'art']) cpSync(join('src/assets', dir), join(OUT, 'assets', dir), { recursive: true });
cpSync('src/assets/favicon.png', join(OUT, 'assets/favicon.png'));
cpSync('src/styles/site.css', join(OUT, 'assets/site.css'));
cpSync('src/scripts/site.js', join(OUT, 'assets/site.js'));
for (const name of ['desktop-experiences', 'house-story', 'alibi', 'alibi-scenes', 'alibi-phone']) {
  cpSync(`src/styles/${name}.css`, join(OUT, `assets/${name}.css`));
}
for (const name of ['desktop-experiences', 'alibi', 'alibi-motion']) {
  cpSync(`src/scripts/${name}.js`, join(OUT, `assets/${name}.js`));
}
// GSAP for the desktop scroll choreography; alibi-motion.js loads it on wide screens only.
mkdirSync(join(OUT, 'assets/vendor'), { recursive: true });
for (const name of ['gsap.min.js', 'ScrollTrigger.min.js', 'SplitText.min.js']) cpSync(join('node_modules/gsap/dist', name), join(OUT, 'assets/vendor', name));
const sitemapUrl = siteUrl ? new URL('/sitemap.xml', siteUrl).href : '';
writeFileSync(join(OUT, 'robots.txt'), publicBuild
  ? `User-agent: *\nAllow: /\n${sitemapUrl ? `\nSitemap: ${sitemapUrl}\n` : ''}`
  : 'User-agent: *\nDisallow: /\n');
if (publicBuild && siteUrl) {
  const urls = pages.filter((p) => p.path).map((p) => `<url><loc>${new URL(p.path, siteUrl).href}</loc></url>`);
  writeFileSync(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`);
}

const kb = (f) => (existsSync(f) ? Math.round(readFileSync(f).length / 1024) : 0);
console.log(`Built ${pages.length} pages to ${OUT}/ (today = ${today})`);
console.log(`  css ${kb('dist/assets/site.css') + kb('dist/assets/alibi.css') + kb('dist/assets/alibi-scenes.css')}KB · js ${kb('dist/assets/site.js') + kb('dist/assets/alibi.js') + kb('dist/assets/alibi-motion.js')}KB · home html ${kb('dist/index.html')}KB`);
