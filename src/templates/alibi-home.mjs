// Home, October 2026 scroll redesign. The desktop beer worlds and the photo
// rope are the preserved experiences; their markup is emitted unchanged. The
// phone beer shelf and phone prints were redesigned in the October 7 phone
// pass. Everything else is written to be complete as static HTML; the scroll
// choreography in alibi-motion.js only animates what is already here.
import { readFileSync } from 'node:fs';
import { esc, dateParts } from './components.mjs';
import { desktopDrinks, photoRope } from './desktop-experiences.mjs';
import { upcoming, closures } from './event-rows.mjs';
import { isFresh } from './hero-today.mjs';
import { copy, button, textLink, eyebrow, kicker, spot, image, todayLine, glyph } from './alibi-shell.mjs';

const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const BULBS = JSON.parse(readFileSync(new URL('../data/bulbs.json', import.meta.url), 'utf8'));
// Copy for the October 5 pass: the Codex copywriter's picks (see the file's _source).
const SC = JSON.parse(readFileSync(new URL('../data/section-copy.json', import.meta.url), 'utf8'));
const NEW_TAB = '<span class="sr-only"> (opens in a new tab)</span>';
const nextEvents = (events, today, n) => (isFresh(events.checked, today, events.staleAfterDays) ? upcoming(events.events, today).filter((e) => e.status !== 'closure' && e.status !== 'cancelled').slice(0, n) : []);
const eventAttrs = (e) => `data-event data-date="${e.date}" data-end="${e.date}" data-checked="${e.checked}"${e.endsAt ? ` data-ends-at="${e.endsAt}"` : ''}`;

// ---- phone beer shelf and phone prints (phones only; desktop hides both sections) ----
function mobileBeerMedia(id, can = false, name = '') {
  const widths = can ? [180] : [480, 720], kind = can ? 'can' : 'world';
  const src = (w, fmt) => `/assets/img/mobile-${kind}-${id}-${w}.${fmt}`;
  const set = (fmt) => widths.map((w) => `${src(w, fmt)} ${w}w`).join(', ');
  // A half-width shelf tile crops the wide world to its own height, so the world is drawn about a screen wide.
  const sizes = can ? '76px' : '(min-width:700px) 60vw, 100vw';
  return `<picture><source media="(min-width:1000px)" srcset="${BLANK}"><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${src(widths[0], 'webp')}" width="${can ? 180 : 720}" height="${can ? 446 : 350}" loading="lazy" decoding="async" alt="${can ? esc(name) + ' can' : ''}"></picture>`;
}
const keptLink = (href, text) => `<a class="house-link " href="${href}">${text}<span aria-hidden="true">↗</span></a>`;
const mobileBeers = () => `<section class="house-mobile-beers" aria-labelledby="mobile-beers-title"><div><h2 id="mobile-beers-title">${copy.beers.heading}</h2><p>${copy.beers.line}</p><p class="mobile-beers-disclosure">Illustrations inspired by Alibi’s labels.</p></div><ol>${copy.beers.items.map((b) => `<li class="mobile-beer mobile-beer-${b.id}"><div class="mobile-beer-visual"><div class="mobile-beer-landscape" aria-hidden="true">${mobileBeerMedia(b.id)}</div><div class="mobile-beer-can">${mobileBeerMedia(b.id, true, b.name)}</div></div><div class="mobile-beer-copy"><h3>${esc(b.name)}</h3><p>${b.style}</p><span>${b.line}</span>${b.id === 'contradiction' ? '<span class="beer-qualification">Contains lactose.</span>' : ''}</div></li>`).join('')}</ol>${keptLink('/menu/#drinks', copy.beers.action)}</section>`;
// Phones: the rope's photos as prints laid on the table, each with its caption.
const PRINTS = [
  { key: 'patio-cheers', caption: 'Cheers on the patio', r: -2.4, widths: [640, 960], alt: 'Four friends raising Alibi pint glasses on the patio.' },
  { key: 'deck-crowd', caption: 'A full deck', r: 1.8, alt: 'Groups at long high-top tables on a sunny deck beneath the pines.' },
  { key: 'friends-dining', caption: 'By the window', r: 1.4, alt: 'Four friends sharing food and pints at a wooden table by the window.' },
  { key: 'tap-pour', caption: 'At the bar', r: -1.8, alt: 'A bartender pulling an Alibi pint from a stainless tap.' },
];
const printPicture = ({ key, alt, widths = [480, 800] }) => {
  const set = (fmt) => widths.map((w) => `/assets/img/desktop-${key}-${w}.${fmt} ${w}w`).join(', ');
  return `<picture><source media="(min-width:1000px)" srcset="${BLANK}"><source type="image/avif" srcset="${set('avif')}" sizes="(min-width:700px) 22vw, 46vw"><source type="image/webp" srcset="${set('webp')}" sizes="(min-width:700px) 22vw, 46vw"><img src="/assets/img/desktop-${key}-${widths[0]}.webp" width="800" height="1000" loading="lazy" decoding="async" alt="${esc(alt)}"></picture>`;
};
const ropeSection = () => `<section class="house-company desktop-experience" aria-labelledby="company-title"><h2 id="company-title">${copy.gallery.heading}</h2>${photoRope({ id: 'company-rope', label: copy.gallery.heading })}<p class="company-instruction">${copy.gallery.instruction}</p></section>
 <section class="house-mobile-company" aria-labelledby="mobile-company-title"><p class="mobile-company-k">Photos from the Public House</p><h2 id="mobile-company-title">${copy.gallery.heading}</h2><ul class="mobile-prints">${PRINTS.map((p) => `<li class="mobile-print" style="--r:${p.r}deg"><figure>${printPicture(p)}<figcaption>${p.caption}</figcaption></figure></li>`).join('')}</ul></section>`;

const dish = (menu, name) => {
  for (const c of menu.food) { const d = c.items.find((i) => i.name === name); if (d) return d; }
  throw new Error(`Home picks: "${name}" is not on the menu`);
};

// ---- the string lights ------------------------------------------------------------------------
// One SVG in the hero art's own 1672 x 941 space. By day each bulb is plain
// glass; the motion script lights the cores and halos one by one at sunset.
// `viewBox` crops it to match whichever picture it sits on.
const PENDANTS = [[1510, 438, 50], [1655, 396, 58]];
function lights(id, viewBox, cls = '') {
  const b = BULBS.bulbs;
  const halos = b.map((p, n) => `<circle class="a-bulb-halo" style="--n:${n}" cx="${p.x}" cy="${p.y}" r="${(p.r * 7.5).toFixed(1)}"/>`).join('');
  const glass = b.map((p) => `<circle cx="${p.x}" cy="${p.y}" r="${p.r}"/>`).join('');
  const shine = b.map((p) => `<circle cx="${(p.x - p.r * 0.32).toFixed(1)}" cy="${(p.y - p.r * 0.34).toFixed(1)}" r="${(p.r * 0.26).toFixed(1)}"/>`).join('');
  const cores = b.map((p, n) => `<circle class="a-bulb-core" style="--n:${n}" cx="${p.x}" cy="${p.y}" r="${(p.r * 1.04).toFixed(1)}"/>`).join('');
  // Warm spill: under each pendant, along the sails above the strings, and onto the table.
  const pools = PENDANTS.map(([x, y, w]) => `<ellipse cx="${x}" cy="${y + 110}" rx="${w * 2.1}" ry="160"/><ellipse cx="${x}" cy="${y + 4}" rx="${w * 0.9}" ry="16"/>`).join('')
    + '<ellipse cx="1390" cy="290" rx="360" ry="150"/><ellipse cx="1310" cy="420" rx="260" ry="80"/><ellipse cx="1060" cy="840" rx="420" ry="120"/>';
  return `<svg class="a-lights${cls ? ' ' + cls : ''}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><defs><radialGradient id="${id}-halo"><stop offset="0" stop-color="#ffe3a6" stop-opacity=".95"/><stop offset=".22" stop-color="#ffbe68" stop-opacity=".5"/><stop offset=".55" stop-color="#ff9d45" stop-opacity=".14"/><stop offset="1" stop-color="#ff9040" stop-opacity="0"/></radialGradient><radialGradient id="${id}-core" cx=".42" cy=".38"><stop offset="0" stop-color="#fffef8"/><stop offset=".5" stop-color="#fff2c8"/><stop offset="1" stop-color="#ffc260"/></radialGradient><radialGradient id="${id}-pool"><stop offset="0" stop-color="#ffc776" stop-opacity=".62"/><stop offset=".55" stop-color="#ffa553" stop-opacity=".2"/><stop offset="1" stop-color="#ff9a4a" stop-opacity="0"/></radialGradient></defs><g class="a-pools" fill="url(#${id}-pool)">${pools}</g><g class="a-glass">${glass}</g><g class="a-shine">${shine}</g><g class="a-halos" fill="url(#${id}-halo)">${halos}</g><g class="a-cores" fill="url(#${id}-core)">${cores}</g></svg>`;
}

// ---- 1. arrival: golden hour to lights-on ------------------------------------------------------
function arrival({ site, events, today }) {
  const art = `<div class="a-hero-art"><picture><source media="(max-width: 699px)" type="image/avif" srcset="/assets/art/hero/flat-phone-780.avif 780w, /assets/art/hero/flat-phone-972.avif 972w" sizes="100vw"><source media="(max-width: 699px)" type="image/webp" srcset="/assets/art/hero/flat-phone-780.webp 780w, /assets/art/hero/flat-phone-972.webp 972w" sizes="100vw"><source type="image/avif" srcset="/assets/art/hero/flat-wide-960.avif 960w, /assets/art/hero/flat-wide-1280.avif 1280w, /assets/art/hero/flat-wide-1672.avif 1672w" sizes="(min-width: 1000px) 80vw, 100vw"><source type="image/webp" srcset="/assets/art/hero/flat-wide-960.webp 960w, /assets/art/hero/flat-wide-1280.webp 1280w, /assets/art/hero/flat-wide-1672.webp 1672w" sizes="(min-width: 1000px) 80vw, 100vw"><img src="/assets/art/hero/flat-wide-1280.webp" width="1672" height="941" alt="Illustration of a pizza and two pints on the deck at sunset, with string lights, pines, the lake and the mountains beyond." fetchpriority="high" loading="eager" decoding="async"></picture><span class="a-hero-flat-night" aria-hidden="true"></span><p class="a-hero-art-cap" aria-hidden="true">Stay till the <em>lights come on.</em></p>${lights('hlp', '700 293 972 648', 'a-lights--phone')}${lights('hlt', '0 0 1672 941', 'a-lights--tablet')}</div>`;
  const layer = (name, priority = false) => `<picture><source media="(max-width: 999px)" srcset="${BLANK}"><source type="image/avif" srcset="/assets/art/hero/layer-${name}-1280.avif 1280w, /assets/art/hero/layer-${name}-1672.avif 1672w" sizes="90vw"><img data-layer="${name}" src="/assets/art/hero/layer-${name}-1672.webp" srcset="/assets/art/hero/layer-${name}-1280.webp 1280w, /assets/art/hero/layer-${name}-1672.webp 1672w" sizes="90vw" width="1672" height="941" alt="" loading="eager" decoding="async"${priority ? ' fetchpriority="high"' : ''}></picture>`;
  const decor = (cls, src) => `<picture class="${cls}"><source media="(max-width: 999px)" srcset="${BLANK}"><img src="${src}" width="1672" height="941" alt="" loading="eager" decoding="async"></picture>`;
  // Night falls on each depth layer separately (a tint cut to the layer's own
  // shape), so the stars stay bright between the pines.
  const tint = (name) => `<span class="a-tint a-tint--${name}" data-tint="${name}" style="--m:url(/assets/art/hero/layer-${name}-1672.avif)"></span>`;
  const stage = `<div class="a-hero-stage" role="img" aria-label="Illustration of a pizza and two pints on the deck at sunset, with string lights, pines, the lake and the mountains beyond."><div class="a-hero-canvas">${layer('sky', true)}<span class="a-sky a-sky--dusk"></span><span class="a-sky a-sky--night"></span>${decor('a-hero-stars', '/assets/art/hero/layer-stars.svg')}<span class="a-hero-sun"></span>${layer('land', true)}${tint('land')}${layer('deck')}${tint('deck')}${layer('table')}${tint('table')}${lights('hld', '0 0 1672 941', 'a-lights--desk')}</div></div>`;
  return `<section class="a-hero" aria-labelledby="home-title" data-hero>
  ${art}
  ${stage}
  <div class="a-wrap a-hero-copy">
   <div class="a-hero-top">${eyebrow('Incline Village <span aria-hidden="true">·</span> Lake Tahoe', 'a-hero-eyebrow')}</div>
   <div class="a-hero-titles"><h1 id="home-title" class="a-display"><span class="a-line"><span>Find your</span></span> <span class="a-line"><span><em>Alibi.</em></span></span></h1><div class="a-hero-after"><p class="a-display" aria-hidden="true">Stay till the <em>lights come on.</em></p><p class="a-hero-after-note" aria-hidden="true">${esc(SC.heroNight.line)}</p>${heroStrand()}${tonight({ site, events, today })}</div></div>
   <div class="a-hero-body">
   <p class="a-lede a-hero-lede">Pizza, house beer and good company, just across from Raley’s in Incline Village.</p>
   <div class="a-actions a-hero-actions">${button('/menu/', 'See the menu')}${button('/whats-on/', 'What’s on', { tone: 'ghost' })}</div>
   </div>
   <div class="a-hero-foot"><div class="a-hero-meta">${todayLine({ site, events, today })}<a class="a-hero-address" href="${esc(site.links.directions)}" target="_blank" rel="noopener">${glyph('pin')}<span>931 Tahoe Blvd. · Directions</span><span class="sr-only"> (opens in a new tab)</span></a></div></div>
  </div>
  <div class="a-hero-cue" aria-hidden="true"><span>Scroll till sundown</span><i></i></div>
  <div class="a-stamp" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="stamp-ring" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs><text><textPath href="#stamp-ring">BREWING IN INCLINE VILLAGE · SINCE 2014 · </textPath></text></svg><img src="/assets/svg/alibi-wordmark-ink.svg" width="147" height="173" alt=""></div>
 </section>`;
}

// A short strand of bulbs between the night line and tonight's card; it lights
// with the deck's strings. The curve is y = 8 + 112·t·(1 − t) in a 70px band.
function heroStrand(n = 11) {
  const bulbs = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return `<span class="a-fb" style="--n:${i};left:${(t * 100).toFixed(2)}%;top:${(((8 + 112 * t * (1 - t) + 2) / 70) * 100 - 2).toFixed(1)}%"><i></i></span>`;
  }).join('');
  return `<div class="a-hero-strand" aria-hidden="true"><svg viewBox="0 0 100 70" preserveAspectRatio="none" focusable="false"><path d="M0 8 Q 50 64 100 8" fill="none" vector-effect="non-scaling-stroke"/></svg>${bulbs}</div>`;
}

// The night state's lower left: today's hours, the next date on the calendar and
// two ways on. Shown by the desktop sundown timeline once the lights are on.
function tonight({ site, events, today }) {
  const N = SC.heroNight;
  const next = nextEvents(events, today, 4).map((e, i) => {
    const d = dateParts(e.date);
    return `<li ${eventAttrs(e)}${i ? ' hidden' : ''}><a href="${esc(e.url)}" target="_blank" rel="noopener"><span class="a-tonight-date"><strong>${d.d}</strong>${d.dow} ${d.mon}</span><span class="a-tonight-what"><span class="a-tonight-title">${esc(e.title)}</span><span class="a-tonight-time">${esc(e.time)}</span></span>${glyph('ne', 'a-glyph a-glyph--sm')}${NEW_TAB}</a></li>`;
  }).join('');
  return `<div class="a-hero-tonight" role="group" aria-labelledby="tonight-k">
    <p class="a-tonight-k" id="tonight-k"><span class="a-tonight-bulb" aria-hidden="true"></span>${esc(N.tonightLabel)}</p>
    <div class="a-tonight-row"><span class="a-tonight-label">Hours</span>${todayLine({ site, events, today, cls: 'a-today--night' })}</div>
    <div class="a-tonight-row a-tonight-row--next"><span class="a-tonight-label">Next up</span><ol class="a-tonight-next" data-event-list data-limit="1" data-checked="${events.checked}" data-stale-days="${events.staleAfterDays}">${next}<li class="event-fallback"${next ? ' hidden' : ''}><a href="/whats-on/">See the calendar</a></li></ol></div>
    <div class="a-actions">${button('/whats-on/', esc(N.cta1), { tone: 'gold', cls: 'a-btn--sm' })}${button(site.links.order, esc(N.cta2), { external: true, tone: 'ghost', cls: 'a-btn--sm a-btn--night' })}</div>
  </div>`;
}

function proof() {
  const facts = [
    ['2014', 'Founded in Incline Village', 'data-count="2014" data-from="1990"'],
    ['11×', 'Voted Best Brewery in Truckee &amp; North Lake Tahoe', 'data-count="11" data-suffix="×"'],
    ['94', 'Local non-profits and groups Alibi supported in 2025', 'data-count="94"'],
  ];
  return `<section class="a-proof" aria-label="About Alibi"><div class="a-wrap"><ul class="a-proof-list">${facts.map(([big, small, count]) => `<li data-reveal><strong ${count}>${big}</strong><span>${small}</span></li>`).join('')}</ul><p class="a-proof-note">Best Brewery votes from the Sierra Sun’s Best Of contest. Community figure from Alibi.</p></div></section>`;
}

// ---- 2. food: the rolling pizza by the heading, then real plates on a turntable -----------------
// Each dish is a full 3:2 photo (tools/prep-dishes.mjs) so the whole plate shows.
const PLATES = [
  { key: 'dish-pizza', course: 'Pizza', alt: 'Two Alibi pizzas on a timber table with a dark and a golden pint behind them.' },
  { key: 'dish-bao', name: 'Pork Belly Bao', course: 'To share', alt: 'Three pork belly bao with pickled onion and peppers on a dark plate.' },
  { key: 'dish-wings', name: 'Wings', course: 'To share', alt: 'Glazed wings with sesame, carrot sticks and a cup of dip.' },
  { key: 'dish-chicken', name: 'Mojo Chicken Sandwich', course: 'Mains', alt: 'A chicken sandwich on a brioche bun with a pile of fries.' },
  { key: 'dish-salad', name: 'Garden Salad', course: 'Greens', alt: 'A garden salad with watermelon radish, tomatoes and carrot ribbons in a dark bowl.' },
];
function food({ site, menu }) {
  const pizzas = menu.food.find((c) => c.id === 'pizza').items;
  const ring = pizzas.map((p) => p.name.replace(/^The /, '').replace(' Pizza', '')).join(' · ').toUpperCase() + ' · ';
  const total = PLATES.length;
  const n = (i) => String(i).padStart(2, '0');
  const plates = PLATES.map((p, i) => {
    const d = p.name ? dish(menu, p.name) : null;
    const meta = d ? esc(p.course) : `${pizzas.length} pizzas`;
    const name = d ? esc(d.name) : 'Neo-Neapolitan style.';
    const desc = d ? esc(d.desc) : `On a sourdough thin crust, from the house oven. ${esc(pizzas.map((x) => x.name).join(', ').replace(/, ([^,]*)$/, ' and $1'))}.`;
    return `<li class="a-course" data-course="${i}"><figure class="a-course-plate" data-dish="${p.key}"><div class="a-plate-in">${image(p.key, p.alt, '(min-width:1000px) min(52vw, 780px), 84vw', { max: 1340 })}</div></figure><div class="a-course-copy"><p class="a-course-meta"><span class="a-course-num">${n(i + 1)} / ${n(total)}</span>${meta}</p><h3 class="a-course-name">${name}</h3><p class="a-course-desc">${desc}</p></div></li>`;
  }).join('');
  return `<section class="a-section a-food" id="food" aria-labelledby="food-title">
  <div class="a-wrap">
   <div class="a-head a-head--split">
    <div class="a-food-title">${kicker('From the Incline kitchen')}<h2 id="food-title" class="a-h2">Pizza, pints <em>&amp;</em> plenty to share.</h2><div class="a-food-spot" aria-hidden="true">${spot('pizza')}</div></div>
    <div class="a-head-aside" data-reveal><p>Neo-Neapolitan-style pizza on a sourdough thin crust, pork belly bao, wings, Wagyu burgers and big salads, with Alibi beer pouring at the bar.</p>${textLink('/menu/', 'See the full menu')}</div>
   </div>
  </div>
  <div class="a-oven" data-oven>
   <div class="a-oven-pin">
    <div class="a-oven-glow" aria-hidden="true"></div>
    <div class="a-oven-stage" aria-hidden="true">
     <div class="a-oven-disc"></div>
     <div class="a-oven-ring"><svg viewBox="0 0 400 400"><defs><path id="a-oven-ring-path" d="M200,200 m-186,0 a186,186 0 1,1 372,0 a186,186 0 1,1 -372,0"/></defs><text textLength="1162" lengthAdjust="spacing"><textPath href="#a-oven-ring-path" textLength="1162" lengthAdjust="spacing">${esc(ring)}</textPath></text></svg></div>
    </div>
    <ol class="a-courses">${plates}</ol>
    <div class="a-oven-dots" aria-hidden="true">${Array.from({ length: total }, (_, i) => `<i${i ? '' : ' class="is-on"'}></i>`).join('')}</div>
   </div>
  </div>
  <div class="a-wrap">
   <ul class="a-tickets">
    <li class="a-ticket a-ticket--hh" data-reveal><div class="a-ticket-in"><p class="a-ticket-k">Weekdays</p><h3 class="a-ticket-h">Happy hour</h3><p class="a-ticket-big">3–5<small>pm</small></p><p class="a-ticket-p">Monday to Friday, excluding holiday periods.</p><div class="a-ticket-spot" aria-hidden="true">${spot('pint')}</div></div></li>
    <li class="a-ticket a-ticket--togo" data-reveal><div class="a-ticket-in"><p class="a-ticket-k">Pickup</p><h3 class="a-ticket-h">Pizza to go</h3><p class="a-ticket-big">8:45<small>pm</small></p><p class="a-ticket-p">Last to-go order. Crowlers, growlers, cans, merch and gift cards to go too.</p>${button(site.links.order, 'Order pizza to go', { external: true, tone: 'gold', cls: 'a-btn--sm' })}<div class="a-ticket-spot" aria-hidden="true">${spot('pizza')}</div></div></li>
    <li class="a-ticket a-ticket--brunch" data-reveal><div class="a-ticket-in"><p class="a-ticket-k">Sundays</p><h3 class="a-ticket-h">Hut… Hut… Brunch!</h3><p class="a-ticket-big">10–3<small>pm</small></p><p class="a-ticket-p">Brunch with NFL games on up to three screens, during football season.</p><div class="a-ticket-spot" aria-hidden="true">${spot('pretzel')}</div></div></li>
   </ul>
  </div>
 </section>`;
}

// ---- 3. come on through: Inside, the deck, the Beer Forest ------------------------------------
const SCENES = [
  { id: 'inside', key: 'bar-room', name: 'Inside', when: 'All year', text: 'Long timber tables under the trusses, the bar and the indoor stage. Warm all year.', facts: ['Indoor stage with house sound', 'Football on the screens', 'Kids welcome'], alt: 'The timber-trussed bar room at Alibi Incline Public House.' },
  { id: 'deck', key: 'deck-bar', name: 'The deck', when: 'Weather allowing', text: 'Shade sails overhead, heaters for cool evenings and a bar of its own out among the pines.', facts: ['Heated', 'Outdoor bar', 'Shade sails'], alt: 'The deck’s outdoor bar under triangular shade sails, with pines beyond.' },
  { id: 'forest', key: 'forest-rail', night: 'music-night', name: 'The Beer Forest', when: 'Seasonal', text: 'Tables among the pines and the summer amphitheater stage, under the string lights after dark.', facts: ['Leashed dogs welcome', 'Tunes on Tap, July–August', 'Seasonal'], alt: 'A bar rail and stools facing the pines in the Beer Forest.' },
];
function tour() {
  return `<section class="a-tour" id="places" aria-labelledby="tour-title" data-tour>
  <div class="a-tour-pin">
   <div class="a-wrap a-tour-intro">
    ${kicker('Inside or out')}
    <h2 id="tour-title" class="a-h2 a-tour-title">Come on <em>through.</em></h2>
    <p class="a-tour-lede">Three ways to settle in: the timber hall all year, the heated deck when the weather allows, and the Beer Forest in season.</p>
   </div>
   <ol class="a-scenes">${SCENES.map((s, i) => `<li class="a-scene a-scene--${s.id}" data-scene="${i}">
    <div class="a-scene-media">${image(s.key, s.alt, '100vw')}${s.night ? `<div class="a-scene-night" aria-hidden="true">${image(s.night, '', '100vw')}</div>` : ''}</div>
    <div class="a-scene-copy"><div class="a-scene-card"><p class="a-scene-num"><span>0${i + 1}</span>${s.when}</p><h3 class="a-scene-name">${s.name}</h3><p class="a-scene-text">${s.text}</p><ul class="a-scene-facts">${s.facts.map((f) => `<li>${f}</li>`).join('')}</ul></div></div>
   </li>`).join('')}</ol>
   <div class="a-tour-trail" aria-hidden="true"><svg viewBox="0 0 300 40" preserveAspectRatio="none"><path class="a-trail-base" d="M24 20 C 80 4, 120 36, 150 20 S 230 4, 276 20"/><path class="a-trail-fill" d="M24 20 C 80 4, 120 36, 150 20 S 230 4, 276 20"/></svg>${SCENES.map((s, i) => `<span class="a-trail-stop" style="--x:${[8, 50, 92][i]}"><i></i>${s.name.replace('The ', '')}</span>`).join('')}</div>
  </div>
 </section>`;
}

// ---- 4. what's on, after dark ----------------------------------------------------------------
const KIND = { music: 'Live music', trivia: 'Trivia', brunch: 'Brunch', talk: 'Talk', party: 'Party' };
export function eventRow(e, { hidden = false, detail = false } = {}) {
  const d = dateParts(e.date), cancelled = e.status === 'cancelled';
  const label = e.special ? 'Special' : KIND[e.kind] || 'At the pub';
  return `<li class="a-event${cancelled ? ' is-cancelled' : ''}${e.special ? ' is-special' : ''}${e.recurring ? ' is-recurring' : ''}" data-event data-date="${e.date}" data-end="${e.date}" data-checked="${e.checked}"${e.endsAt ? ` data-ends-at="${e.endsAt}"` : ''}${hidden ? ' hidden' : ''}><a class="a-event-link" href="${esc(e.url)}" target="_blank" rel="noopener"><time class="a-event-date" datetime="${e.date}"><span class="a-event-dow">${d.dow}</span><strong>${d.d}</strong><span class="a-event-mon">${d.mon}</span></time><span class="a-event-body"><span class="a-event-kind">${cancelled ? 'Cancelled' : label}</span><span class="a-event-title">${esc(e.title)}</span><span class="a-event-time">${esc(e.time)}</span>${detail && e.special && e.detail ? `<span class="a-event-desc">${esc(e.detail)}</span>` : ''}</span><span class="a-event-chip" aria-hidden="true">${glyph('ne')}</span><span class="sr-only"> (opens in a new tab)</span></a></li>`;
}

// A festoon strand along the top edge of the night section. The wire stretches
// with the page; the bulbs are positioned on its curve so they stay round.
// The curve is y = 6 + 140·t·(1 − t) in a 70px-tall band.
function festoon(n = 24) {
  const bulbs = Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n;
    return `<span class="a-fb" style="--n:${i};left:${(t * 100).toFixed(2)}%;top:${(6 + 140 * t * (1 - t) + 3).toFixed(1)}px"><i></i></span>`;
  }).join('');
  return `<div class="a-festoon" aria-hidden="true"><svg viewBox="0 0 100 70" preserveAspectRatio="none" focusable="false"><path d="M0 6 Q 50 76 100 6" fill="none" vector-effect="non-scaling-stroke"/></svg>${bulbs}</div>`;
}

function eventsBand({ site, events, today }) {
  const fresh = isFresh(events.checked, today, events.staleAfterDays);
  const list = fresh ? upcoming(events.events, today).filter((e) => e.status !== 'closure' && e.status !== 'cancelled').slice(0, 6) : [];
  const g = site.gatherings;
  const words = ['Country Fridays', 'Trivia nights', 'Sunday brunch', 'Football on the screens', 'Happy hour', 'Live music'];
  const band = (cls) => `<div class="a-marquee-row ${cls}">${[0, 1].map(() => `<span>${words.map((w, i) => `<span class="a-marquee-w${i % 2 ? ' a-marquee-w--alt' : ''}">${w}</span><i></i>`).join('')}</span>`).join('')}</div>`;
  return `<section class="a-section a-events a-events--night" aria-labelledby="events-title">
  ${festoon()}
  <div class="a-events-sky" aria-hidden="true"><span class="a-events-moon"></span></div>
  <div class="a-wrap a-events-grid">
   <div class="a-events-copy">
    ${kicker('What’s on', 'a-sec-kicker--dark')}
    <h2 id="events-title" class="a-h2">Good nights <em>at Incline.</em></h2>
    <p class="a-events-intro" data-reveal>${esc(SC.events.intro)}</p>
    <h3 class="a-mini-h">Every week</h3>
    <ul class="a-week">${events.weekly.map((w) => `<li data-reveal><span class="a-week-day">${esc(w.day)}</span><span class="a-week-body"><span class="a-week-title">${esc(w.title)}</span><span class="a-week-detail">${esc(w.detail)}</span></span><span class="a-week-time">${esc(w.time)}</span></li>`).join('')}</ul>
   </div>
   <div class="a-events-list-wrap">
    <h3 class="a-mini-h">Coming up</h3>
    <ol class="a-event-list" data-event-list data-limit="4" data-checked="${events.checked}" data-stale-days="${events.staleAfterDays}">${list.map((e, i) => eventRow(e, { hidden: i >= 4 })).join('')}<li class="event-fallback a-event-empty"${list.length ? ' hidden' : ''}><p>${esc(events.emptyNote)}</p></li></ol>
    <div class="a-actions">${button('/whats-on/', 'See everything on', { tone: 'gold' })}${textLink(site.links.events, 'Alibi’s full calendar', { external: true, cls: 'a-link--dark' })}</div>
   </div>
  </div>
  <div class="a-marquee" aria-hidden="true">${band('a-marquee-row--a')}${band('a-marquee-row--b')}</div>
  <div class="a-wrap a-crew" aria-labelledby="crew-title">
   <figure class="a-crew-photo">${image('event-hall-xl', 'The event hall at Alibi Incline, with its stage and big Alibi can artwork on the walls.', '(min-width:1000px) 60vw, 100vw')}<figcaption>The indoor stage, ready for a crowd</figcaption></figure>
   <div class="a-crew-copy">
    ${kicker('Private events', 'a-sec-kicker--dark')}
    <h3 id="crew-title" class="a-h2 a-crew-title">Bring the <em>whole crew.</em></h3>
    <p class="a-crew-lede">${esc(SC.events.crewLine)}</p>
    <ul class="a-crew-stats"><li><strong data-count="200">200</strong><span>guests, or book the whole pub</span></li><li><strong>2</strong><span>stages, indoors and in the Biergarten</span></li><li><strong data-count="45">45</strong><span>parking spaces on site</span></li></ul>
    <ul class="a-crew-list">${g.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
    ${button(g.url, 'Plan an event', { external: true, tone: 'gold' })}
   </div>
  </div>
 </section>`;
}

// ---- 5. brewed here: a pint fills past four milestones, then membership and perks ------------
// Desktop pins the scene: a branded nonic pint fills as you scroll and each
// milestone lights as the beer passes its mark. Phones and still pages show
// the milestones as a list (and, on wide still pages, beside a full glass).
const MARK_AT = [0.14, 0.38, 0.62, 0.86];
// The glass in a 100 x 100 box: a nonic pint (bulge near the rim), thick base.
const GLASS = 'M3 1 L97 1 L99.4 14 L87 96.6 Q86.4 99.4 83.6 99.4 L16.4 99.4 Q13.6 99.4 13 96.6 L0.6 14 Z';
function glass() {
  const bubbles = Array.from({ length: 14 }, (_, i) => `<i style="--x:${(14 + ((i * 37) % 72)).toFixed(0)}%;--d:${(2.4 + ((i * 7) % 10) / 4).toFixed(2)}s;--w:${(i * 0.37).toFixed(2)}s;--s:${(3 + (i % 3) * 1.5).toFixed(1)}px"></i>`).join('');
  const ticks = MARK_AT.map((t) => { const y = (96.6 - 92 * t).toFixed(2); const x = (87 + (99.4 - 87) * ((96.6 - y) / (96.6 - 14))).toFixed(2); return `<path d="M${(x - 7).toFixed(2)} ${y} H${x}"/>`; }).join('');
  return `<div class="a-glass" aria-hidden="true">
     <div class="a-pour a-pour--above"></div>
     <div class="a-glass-in">
      <div class="a-pour a-pour--in"></div>
      <div class="a-story-beer"></div>
      <div class="a-glass-bubbles">${bubbles}</div>
      <div class="a-foam-track"><div class="a-story-foam"></div></div>
     </div>
     <svg class="a-glass-line" viewBox="0 0 100 100" preserveAspectRatio="none" focusable="false"><path class="a-glass-body" d="${GLASS}"/><path class="a-glass-shine" d="M8 8 L17 86"/><path class="a-glass-base" d="M13.4 96.6 H86.6"/><g class="a-glass-ticks">${ticks}</g></svg>
     <img class="a-glass-logo" src="/assets/svg/alibi-wordmark-cream.svg" width="147" height="173" alt="" loading="lazy" decoding="async">
    </div>`;
}
const PERK_LINKS = ['giftCards', 'glutenReduced', 'app'];
const PERK_ICON = {
  giftCards: '<rect x="3.5" y="8" width="17" height="12" rx="1.5"/><path d="M3.5 12h17M12 8v12M12 8c-1.6-3.4-6-3.6-5.2-.9.5 1.4 3.2.9 5.2.9Zm0 0c1.6-3.4 6-3.6 5.2-.9-.5 1.4-3.2.9-5.2.9Z"/>',
  glutenReduced: '<path d="M12 21V9"/><path d="M12 13c-2.6 0-4-1.8-4-4 2.6 0 4 1.8 4 4Zm0 0c2.6 0 4-1.8 4-4-2.6 0-4 1.8-4 4Zm0-4c-2.2 0-3.4-1.6-3.4-3.6 2.2 0 3.4 1.6 3.4 3.6Zm0 0c2.2 0 3.4-1.6 3.4-3.6-2.2 0-3.4 1.6-3.4 3.6Zm0 8c-2.6 0-4-1.8-4-4 2.6 0 4 1.8 4 4Zm0 0c2.6 0 4-1.8 4-4-2.6 0-4 1.8-4 4Z"/>',
  app: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><path d="M10.5 18.5h3"/>',
};
function story({ site }) {
  const L = site.links, S = SC.story;
  const marks = S.milestones.map((m, i) => `<li class="a-mark" data-mark="${i}" style="--at:${MARK_AT[i]}"><p class="a-mark-big"><span class="a-mark-num">${esc(m.big)}</span><span class="a-mark-unit">${esc(m.unit)}</span></p><div class="a-mark-body"><h3 class="a-mark-t">${esc(m.title).replace(/₂/g, '<sub class="a-sub">2</sub>')}</h3><p class="a-mark-d">${esc(m.line)}</p></div></li>`).join('');
  const pint = (key, cls) => `<div class="a-pint-cut ${cls}">${image(key, '', '(min-width:1000px) 150px, 24vw', { max: 480 })}</div>`;
  const perks = S.perks.map((p, i) => `<a class="a-perk" href="${esc(L[PERK_LINKS[i]])}" target="_blank" rel="noopener"><svg class="a-perk-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PERK_ICON[PERK_LINKS[i]]}</svg><span class="a-perk-k">${esc(p.label)}</span><span class="a-perk-h">${esc(p.title)}</span><span class="a-perk-p">${esc(p.line)}</span><span class="a-perk-go">${glyph('ne')}</span>${NEW_TAB}</a>`).join('');
  return `<section class="a-story" aria-labelledby="story-title" data-story>
  <div class="a-story-pin">
   <div class="a-story-glow" aria-hidden="true"></div>
   <div class="a-wrap a-story-grid">
    <div class="a-story-copy">
     ${kicker(esc(S.kicker), 'a-sec-kicker--dark')}
     <h2 id="story-title" class="a-h2 a-story-title">${esc(S.heading.a.trim())} <em>${esc(S.heading.b)}</em></h2>
     <p class="a-story-lede">${esc(S.lede)}</p>
     <p class="a-story-hint" aria-hidden="true"><span></span>Scroll to pour</p>
    </div>
    ${glass()}
    <ol class="a-marks">${marks}</ol>
   </div>
   <div class="a-pints" aria-hidden="true">${pint('pint-gold', 'a-pint-cut--a')}${pint('pint-amber', 'a-pint-cut--b')}${pint('pint-dark', 'a-pint-cut--c')}</div>
  </div>
  <div class="a-wrap a-perks">
   <div class="a-member">
    <div class="a-member-copy">
     <p class="a-perk-k">Membership</p>
     <h3 class="a-member-h">${esc(S.member.title)}</h3>
     <p class="a-member-line">${esc(S.member.line)}</p>
     ${button(L.anonymous, esc(S.member.cta), { external: true, tone: 'gold' })}
    </div>
    <div class="a-member-card" aria-hidden="true"><div class="a-mc-in"><img src="/assets/svg/alibi-wordmark-cream.svg" width="147" height="173" alt="" loading="lazy" decoding="async"><span class="a-mc-k">Member</span><span class="a-mc-name">Alibi Anonymous</span><span class="a-mc-foot"><span>Incline</span><span>Truckee</span></span></div></div>
   </div>
   <div class="a-perk-list">${perks}</div>
  </div>
 </section>`;
}

// ---- 6. come on over --------------------------------------------------------------------------
const POLICY_ICON = {
  families: '<circle cx="8" cy="6" r="2.4"/><circle cx="16.5" cy="9" r="1.8"/><path d="M4.5 20v-6.5a3.5 3.5 0 0 1 7 0V20M13.5 20v-4.2a3 3 0 0 1 6 0V20"/>',
  dogs: '<path d="M5 11.5c0-2.5 1.5-5 4-5.5l1-2.5 1.5 2.4h3l1.4-2.4 1.1 2.5c2.5.5 4 3 4 5.5 0 4.4-3.5 8-8 8s-8-3.6-8-8Z"/><circle cx="10" cy="11.5" r=".7"/><circle cx="15" cy="11.5" r=".7"/><path d="M11.4 15h2.2l-1.1 1.2Z"/>',
  outdoor: '<circle cx="12" cy="10" r="3.6"/><path d="M12 2.5v1.8M12 15.7v1.8M4.5 10h1.8M17.7 10h1.8M6.7 4.7 8 6M16 14l1.3 1.3M6.7 15.3 8 14M16 6l1.3-1.3M4 21h16"/>',
  parking: '<rect x="4" y="3.5" width="16" height="17" rx="3"/><path d="M10 16.5v-9h3.2a2.7 2.7 0 0 1 0 5.4H10"/>',
  togo: '<path d="M5.5 8h13l-1 12.5h-11Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
};
function visit({ site, events, today }) {
  const V = SC.visit;
  // Parking is already in the address line above, so the list skips it here.
  const know = site.policies.filter((p) => p.id !== 'parking').map((p) => `<li class="a-know-item" data-reveal><svg class="a-know-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${POLICY_ICON[p.id] || ''}</svg><span class="a-know-label">${esc(p.label)}</span><span class="a-know-text">${esc(p.text)}</span></li>`).join('');
  return `<section class="a-section a-visit" aria-labelledby="visit-title">
  <div class="a-wrap a-visit-grid">
   <div class="a-visit-copy">
    ${kicker(esc(V.kicker))}
    <h2 id="visit-title" class="a-h2 a-visit-title">${esc(V.heading.a.trim())} <em>${esc(V.heading.b)}</em></h2>
    <p class="a-visit-address" data-reveal>${esc(V.subline)}</p>
    <div class="a-actions" data-reveal>${button(site.links.directions, 'Get directions', { external: true })}${button('tel:' + site.phone.tel, `Call ${site.phone.display}`, { tone: 'ghost', arrow: 'phone' })}</div>
   </div>
   <div class="a-board">
    <div class="a-board-frame"><div class="a-board-felt">
     <div class="a-board-head"><h3 class="a-board-title">${esc(V.hoursTitle.charAt(0) + V.hoursTitle.slice(1).toLowerCase())}</h3>${todayLine({ site, events, today, cls: 'a-today--board' })}</div>
     <table class="a-hours-table" data-hours data-closures="${esc(JSON.stringify(closures(events.events)))}"><caption class="sr-only">Regular pub hours</caption><tbody>${site.hours.map((h) => `<tr data-day="${h.short}" data-routine-hours="${h.open}–${h.close}"><th scope="row">${h.days}</th><td>${h.open}–${h.close}</td></tr>`).join('')}</tbody></table>
     <p class="a-hours-note">${esc(V.hoursNote)}</p>
    </div></div>
    <div class="a-board-foot">${textLink('/visit/', 'Plan your visit')}</div>
   </div>
   <div class="a-visit-know">
    <h3 class="a-mini-h a-know-h">${esc(V.knowTitle.charAt(0) + V.knowTitle.slice(1).toLowerCase())}</h3>
    <ul class="a-know">${know}</ul>
   </div>
  </div>
 </section>`;
}

export const homeHead = () => '<link rel="stylesheet" href="/assets/desktop-experiences.css"><link rel="stylesheet" href="/assets/house-story.css"><script src="/assets/desktop-experiences.js" defer></script>';

export function home(ctx) {
  return `${arrival(ctx)}
 ${proof()}
 ${food(ctx)}
 <div class="house-home a-kept">${desktopDrinks({ site: ctx.site })}
 ${mobileBeers()}</div>
 ${tour()}
 ${eventsBand(ctx)}
 <div class="house-home a-kept">${ropeSection()}</div>
 ${story(ctx)}
 ${visit(ctx)}`;
}
