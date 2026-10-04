// Zero-dependency static build: data (src/data) + templates (src/templates)
// -> dist/ with clean routes: /, /menu/, /whats-on/, /visit/ and a 404 page.
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { layout } from './src/templates/layout.mjs';
import { home, homeHead } from './src/templates/home-proof.mjs';
import {menuPage,whatsOnPage,visitPage} from './src/templates/routes-proof.mjs';
import {routesHead} from './src/templates/house-components.mjs';
import { btn, arrowLink, eyebrow, picture } from './src/templates/components.mjs';

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

const OUT = 'dist';
rmSync(OUT, { recursive: true, force: true });

const pages = [
  {
    out: 'index.html', path: '/', page: 'home', title: 'Home', head: homeHead(),
    description: 'Alibi Ale Works Incline Public House, a restaurant and pub in Incline Village, Nevada: neo-Neapolitan sourdough pizza, pub plates, our own beer and a Beer Forest under the pines.',
    main: home(ctx),
  },
  {
    out: 'menu/index.html', path: '/menu/', page: 'menu', title: 'Food and drink', head: routesHead(),
    description: 'The Alibi Incline menu: pizza, snacks, bowls, burgers, sweets, happy hour, Sunday brunch, a rotating Alibi tap list, cocktails, wine and non-alcoholic drinks.',
    main: menuPage(ctx),
  },
  {
    out: 'whats-on/index.html', path: '/whats-on/', page: 'whats-on', title: "What's on", head: routesHead(),
    description: 'Upcoming events at Alibi Incline Public House. Open each listing for the latest dates and details.',
    main: whatsOnPage(ctx),
  },
  {
    out: 'visit/index.html', path: '/visit/', page: 'visit', title: 'Visit', head: routesHead(),
    description: 'Directions, hours, family and dog policies, seating and private events at the Alibi Incline Public House, 931 Tahoe Blvd., Incline Village.',
    main: visitPage(ctx),
  },
  {
    out: '404.html', page: 'not-found', title: 'Page not found',
    description: 'This page could not be found.',
    main: `<section class="not-found" aria-labelledby="lost-title">
      ${eyebrow('404')}
      <h1 id="lost-title">Page not found</h1>
      <p>We couldn’t find that page. Head home, browse the menu, or plan a visit.</p>
      <div class="actions">${btn('/', 'Back home', { iconName: 'arrow-right' })}${arrowLink('/menu/', 'See the menu')}${arrowLink('/visit/', 'Plan a visit')}</div>
    </section>`,
  },
];

// Typographic apostrophes in visible text only (never inside tags, scripts or styles).
const typeset = (html) => html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<[^>]+>)/)
  .map((part) => (part.startsWith('<') ? part : part.replace(/'/g, '\u2019')))
  .join('');

for (const p of pages) {
  const file = join(OUT, p.out);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, typeset(layout({ site, ...p })));
}

// assets
mkdirSync(join(OUT, 'assets'), { recursive: true });
for (const dir of ['fonts', 'img', 'svg', 'art']) cpSync(join('src/assets', dir), join(OUT, 'assets', dir), { recursive: true });
cpSync('src/assets/favicon.png', join(OUT, 'assets/favicon.png'));
cpSync('src/styles/site.css', join(OUT, 'assets/site.css'));
cpSync('src/scripts/site.js', join(OUT, 'assets/site.js'));
for (const name of ['desktop', 'desktop-experiences', 'scene-composition', 'home-scroll-story', 'house-story', 'house-shell', 'house-routes']) {
  cpSync(`src/styles/${name}.css`, join(OUT, `assets/${name}.css`));
}
for (const name of ['desktop-story', 'desktop-experiences', 'home-scroll-story', 'house-story', 'sign-sequence']) {
  cpSync(`src/scripts/${name}.js`, join(OUT, `assets/${name}.js`));
}
mkdirSync(join(OUT, 'assets/vendor'), { recursive: true });
for (const name of ['gsap.min.js', 'ScrollTrigger.min.js']) cpSync(join('node_modules/gsap/dist', name), join(OUT, 'assets/vendor', name));
writeFileSync(join(OUT, 'robots.txt'), 'User-agent: *\nDisallow: /\n');

const kb = (f) => (existsSync(f) ? Math.round(readFileSync(f).length / 1024) : 0);
console.log(`Built ${pages.length} pages to ${OUT}/ (today = ${today})`);
console.log(`  css ${kb('dist/assets/site.css')}KB · js ${kb('dist/assets/site.js')}KB · home html ${kb('dist/index.html')}KB`);
