// Home, October 2026 redesign. The beer worlds, the phone beer spreads and the
// photo rope are the preserved experiences; their markup is emitted unchanged.
import { esc, dateParts } from './components.mjs';
import { desktopDrinks, photoRope } from './desktop-experiences.mjs';
import { upcoming, closures } from './event-rows.mjs';
import { isFresh } from './hero-today.mjs';
import { copy, button, textLink, eyebrow, kicker, spot, image, todayLine, glyph } from './alibi-shell.mjs';

const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

// ---- preserved phone beer spreads and phone gallery (identical output to the accepted build) ----
function mobileBeerMedia(id, can = false, name = '') {
  const widths = can ? [180] : [480, 720], kind = can ? 'can' : 'world';
  const src = (w, fmt) => `/assets/img/mobile-${kind}-${id}-${w}.${fmt}`;
  const set = (fmt) => widths.map((w) => `${src(w, fmt)} ${w}w`).join(', ');
  const sizes = can ? '70px' : '(min-width:700px) 44vw, 88vw';
  return `<picture><source media="(min-width:1000px)" srcset="${BLANK}"><source type="image/avif" srcset="${set('avif')}" sizes="${sizes}"><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img src="${src(widths[0], 'webp')}" width="${can ? 180 : 720}" height="${can ? 446 : 350}" loading="lazy" decoding="async" alt="${can ? esc(name) + ' can' : ''}"></picture>`;
}
const keptLink = (href, text) => `<a class="house-link " href="${href}">${text}<span aria-hidden="true">↗</span></a>`;
const keptImage = (key, alt, sizes, max) => image(key, alt, sizes, { max });
const mobileBeers = () => `<section class="house-mobile-beers" aria-labelledby="mobile-beers-title"><div><h2 id="mobile-beers-title">${copy.beers.heading}</h2><p>${copy.beers.line}</p><p class="mobile-beers-disclosure">Illustrations inspired by Alibi’s labels.</p></div><ol>${copy.beers.items.map((b) => `<li class="mobile-beer mobile-beer-${b.id}"><div class="mobile-beer-visual"><div class="mobile-beer-landscape" aria-hidden="true">${mobileBeerMedia(b.id)}</div><div class="mobile-beer-can">${mobileBeerMedia(b.id, true, b.name)}</div></div><div class="mobile-beer-copy"><h3>${esc(b.name)}</h3><p>${b.style}</p><span>${b.line}</span>${b.id === 'contradiction' ? '<span class="beer-qualification">Contains lactose.</span>' : ''}</div></li>`).join('')}</ol>${keptLink('/menu/#drinks', copy.beers.action)}</section>`;
const ropeSection = () => `<section class="house-company desktop-experience" aria-labelledby="company-title"><h2 id="company-title">${copy.gallery.heading}</h2>${photoRope({ id: 'company-rope', label: copy.gallery.heading })}<p class="company-instruction">${copy.gallery.instruction}</p></section>
 <section class="house-mobile-company" aria-labelledby="mobile-company-title"><h2 id="mobile-company-title">${copy.gallery.heading}</h2><figure>${keptImage('friends-dining', 'Friends sharing food and pints by a window at Alibi.', '85vw', 800)}</figure><figure>${keptImage('forest-guests', 'Guests seated among plants and pines in the Beer Forest.', '85vw', 800)}</figure></section>`;

// ---- new sections ----
const dish = (menu, name) => {
  for (const c of menu.food) { const d = c.items.find((i) => i.name === name); if (d) return d; }
  throw new Error(`Home picks: "${name}" is not on the menu`);
};

function arrival({ site, events, today }) {
  const art = `<picture class="a-hero-art"><source media="(max-width: 699px)" type="image/avif" srcset="/assets/art/hero/flat-phone-780.avif 780w, /assets/art/hero/flat-phone-972.avif 972w" sizes="100vw"><source media="(max-width: 699px)" type="image/webp" srcset="/assets/art/hero/flat-phone-780.webp 780w, /assets/art/hero/flat-phone-972.webp 972w" sizes="100vw"><source type="image/avif" srcset="/assets/art/hero/flat-wide-960.avif 960w, /assets/art/hero/flat-wide-1280.avif 1280w, /assets/art/hero/flat-wide-1672.avif 1672w" sizes="(min-width: 1000px) 80vw, 100vw"><source type="image/webp" srcset="/assets/art/hero/flat-wide-960.webp 960w, /assets/art/hero/flat-wide-1280.webp 1280w, /assets/art/hero/flat-wide-1672.webp 1672w" sizes="(min-width: 1000px) 80vw, 100vw"><img src="/assets/art/hero/flat-wide-1280.webp" width="1672" height="941" alt="Illustration of a pizza and two pints on the deck at sunset, with string lights, pines, the lake and the mountains beyond." fetchpriority="high" loading="eager" decoding="async"></picture>`;
  const layer = (name, priority = false) => `<picture><source media="(max-width: 999px)" srcset="${BLANK}"><source type="image/avif" srcset="/assets/art/hero/layer-${name}-1280.avif 1280w, /assets/art/hero/layer-${name}-1672.avif 1672w" sizes="90vw"><img data-layer="${name}" src="/assets/art/hero/layer-${name}-1672.webp" srcset="/assets/art/hero/layer-${name}-1280.webp 1280w, /assets/art/hero/layer-${name}-1672.webp 1672w" sizes="90vw" width="1672" height="941" alt="" loading="eager" decoding="async"${priority ? ' fetchpriority="high"' : ''}></picture>`;
  const decor = (cls, src) => `<picture class="${cls}"><source media="(max-width: 999px)" srcset="${BLANK}"><img src="${src}" width="1672" height="941" alt="" loading="eager" decoding="async"></picture>`;
  // Desktop: the same scene as separate depth layers, so scrolling can move the
  // camera and turn golden hour into dusk. Phones keep the single picture.
  const stage = `<div class="a-hero-stage" role="img" aria-label="Illustration of a pizza and two pints on the deck at sunset, with string lights, pines, the lake and the mountains beyond."><div class="a-hero-canvas">${layer('sky', true)}<span class="a-hero-sun"></span>${decor('a-hero-stars', '/assets/art/hero/layer-stars.svg')}${layer('land', true)}${layer('deck')}<span class="a-hero-dusk"></span>${decor('a-hero-glow', '/assets/art/hero/layer-glow.webp')}${layer('table')}</div></div>`;
  return `<section class="a-hero" aria-labelledby="home-title" data-hero>
  ${art}
  ${stage}
  <div class="a-wrap a-hero-copy">
   ${eyebrow('Incline Village <span aria-hidden="true">·</span> Lake Tahoe', 'a-hero-eyebrow')}
   <div class="a-hero-titles"><h1 id="home-title" class="a-display"><span class="a-line"><span>Find your</span></span> <span class="a-line"><span><em>Alibi.</em></span></span></h1><p class="a-hero-after a-display" aria-hidden="true">Stay till the <em>lights come on.</em></p></div>
   <p class="a-lede a-hero-lede">Pizza, house beer and good company, just across from Raley’s in Incline Village.</p>
   <div class="a-actions a-hero-actions">${button('/menu/', 'See the menu')}${button('/whats-on/', 'What’s on', { tone: 'ghost' })}</div>
   <div class="a-hero-meta">${todayLine({ site, events, today })}<a class="a-hero-address" href="${esc(site.links.directions)}" target="_blank" rel="noopener">${glyph('pin')}<span>931 Tahoe Blvd. · Directions</span><span class="sr-only"> (opens in a new tab)</span></a></div>
  </div>
  <div class="a-stamp" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="stamp-ring" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs><text><textPath href="#stamp-ring">BREWING IN INCLINE VILLAGE · SINCE 2014 · </textPath></text></svg><img src="/assets/svg/alibi-wordmark-ink.svg" width="147" height="173" alt=""></div>
 </section>`;
}

function proof(site) {
  const facts = [
    ['2014', 'Founded in Incline Village', 'data-count="2014" data-from="1990"'],
    ['11×', 'Voted Best Brewery in Truckee &amp; North Lake Tahoe', 'data-count="11" data-suffix="×"'],
    ['94', 'Local non-profits and groups Alibi supported in 2025', 'data-count="94"'],
  ];
  return `<section class="a-proof" aria-label="About Alibi"><div class="a-wrap"><ul class="a-proof-list">${facts.map(([big, small, count]) => `<li data-reveal><strong ${count}>${big}</strong><span>${small}</span></li>`).join('')}</ul><p class="a-proof-note">Best Brewery votes from the Sierra Sun’s Best Of contest. Community figure from Alibi.</p></div></section>`;
}

function food({ site, menu }) {
  const pizzas = menu.food.find((c) => c.id === 'pizza').items.length;
  const picks = [dish(menu, menu.featured.pizza), dish(menu, 'Mustache Pretzel'), dish(menu, 'Wagyu Burger'), dish(menu, 'Gojo Brussels')];
  return `<section class="a-section a-food" id="food" aria-labelledby="food-title">
  <div class="a-wrap">
   <div class="a-head a-head--split">
    <div class="a-food-title">${kicker('From the Incline kitchen')}<h2 id="food-title" class="a-h2" data-reveal>Pizza, pints <em>&amp;</em> plenty to share.</h2><div class="a-food-spot" aria-hidden="true">${spot('pizza')}</div></div>
    <div class="a-head-aside" data-reveal><p>Neo-Neapolitan-style pizza, pork belly bao, burgers and big salads, with Alibi beer pouring at the bar.</p>${textLink('/menu/', 'See the full menu')}</div>
   </div>
   <div class="a-food-grid">
    <figure class="a-print a-food-main" data-reveal="img">${image('pizza-and-pints', 'Pizza and two Alibi pints on a wooden table.', '(min-width:1000px) 56vw, 100vw')}<figcaption><span class="a-tag">${pizzas} pizzas</span> Neo-Neapolitan style, from the house oven</figcaption></figure>
    <figure class="a-print a-food-bao" data-reveal="img">${image('food-bao', 'Three pork belly bao with pickled vegetables.', '(min-width:1000px) 60vw, 100vw', { max: 1200 })}<figcaption>Pork Belly Bao</figcaption></figure>
    <div class="a-bezel a-picks" data-reveal><div class="a-bezel-in">
      <div class="a-picks-spot" aria-hidden="true">${spot('pretzel')}</div>
      <p class="a-kicker">A few from the menu</p>
      <ul class="a-pick-list">${picks.map((d) => `<li><span class="a-pick-name">${esc(d.name)}</span><span class="a-pick-desc">${esc(d === picks[0] ? menu.featured.pizzaDetail : d.desc)}</span></li>`).join('')}</ul>
      <div class="a-actions a-actions--tight">${button(site.links.order, 'Order pizza to go', { external: true })}${textLink('/menu/', 'Full menu')}</div>
    </div></div>
   </div>
  </div>
 </section>`;
}

const SEATS = [
  { key: 'bar-room', name: 'Inside', title: 'Inside the public house', when: 'All year', text: 'Long timber tables, the bar and the indoor stage. Warm all year.' },
  { key: 'deck-bar', name: 'Deck', title: 'The heated deck', when: 'Weather allowing', text: 'Shade sails overhead and heaters for cool evenings, when the weather allows.' },
  { key: 'forest-rail', name: 'Beer Forest', title: 'The Beer Forest', when: 'Seasonal', text: 'Tables among the pines and the summer stage. Leashed dogs welcome. Seasonal.' },
];
function seats() {
  return `<section class="a-section a-seats" id="places" aria-labelledby="places-title" data-seats data-seat-default="1">
  <div class="a-wrap a-seats-grid">
   <div class="a-seats-copy">
    ${kicker('Inside or out')}
    <h2 id="places-title" class="a-h2" data-reveal>Pick your spot.</h2>
    <p class="a-seats-intro" data-reveal>Three ways to settle in. Outdoor seating is seasonal and weather-dependent.</p>
    <div class="a-seat-buttons" role="group" aria-label="Seating areas">${SEATS.map((s, i) => `<button type="button" class="a-seat-btn" data-seat="${i}" aria-pressed="${i === 1}" aria-controls="seat-panel-${i}"><span class="a-seat-num" aria-hidden="true">0${i + 1}</span><span class="a-seat-name">${s.name}</span><span class="a-seat-text">${s.text}</span><span class="a-seat-chip" aria-hidden="true">${glyph('right')}</span></button>`).join('')}</div>
   </div>
   <div class="a-seat-stage"><div class="a-seat-progress" aria-hidden="true"><i></i></div>${SEATS.map((s, i) => `<figure class="a-seat-panel" id="seat-panel-${i}" data-seat-panel="${i}">${image(s.key, `${s.title} at Alibi Incline Public House.`, '(min-width:1000px) 64vw, 100vw')}<figcaption><span class="a-seat-cap-title">${s.title}</span><span class="a-seat-cap-when">${s.when}</span><span class="a-seat-cap-text">${s.text}</span></figcaption></figure>`).join('')}</div>
  </div>
 </section>`;
}

const KIND = { music: 'Live music', trivia: 'Trivia', brunch: 'Brunch', talk: 'Talk', party: 'Party' };
export function eventRow(e, { hidden = false, detail = false } = {}) {
  const d = dateParts(e.date), cancelled = e.status === 'cancelled';
  const label = e.special ? 'Special' : KIND[e.kind] || 'At the pub';
  return `<li class="a-event${cancelled ? ' is-cancelled' : ''}${e.special ? ' is-special' : ''}${e.recurring ? ' is-recurring' : ''}" data-event data-date="${e.date}" data-end="${e.date}" data-checked="${e.checked}"${e.endsAt ? ` data-ends-at="${e.endsAt}"` : ''}${hidden ? ' hidden' : ''}><a class="a-event-link" href="${esc(e.url)}" target="_blank" rel="noopener"><time class="a-event-date" datetime="${e.date}"><span class="a-event-dow">${d.dow}</span><strong>${d.d}</strong><span class="a-event-mon">${d.mon}</span></time><span class="a-event-body"><span class="a-event-kind">${cancelled ? 'Cancelled' : label}</span><span class="a-event-title">${esc(e.title)}</span><span class="a-event-time">${esc(e.time)}</span>${detail && e.special && e.detail ? `<span class="a-event-desc">${esc(e.detail)}</span>` : ''}</span><span class="a-event-chip" aria-hidden="true">${glyph('ne')}</span><span class="sr-only"> (opens in a new tab)</span></a></li>`;
}

function eventsBand({ events, today }) {
  const fresh = isFresh(events.checked, today, events.staleAfterDays);
  const list = fresh ? upcoming(events.events, today).filter((e) => e.status !== 'closure' && e.status !== 'cancelled').slice(0, 6) : [];
  return `<section class="a-section a-events" aria-labelledby="events-title">
  <div class="a-events-glow" aria-hidden="true"></div>
  <div class="a-wrap a-events-grid">
   <div class="a-events-copy">
    ${kicker('What’s on')}
    <h2 id="events-title" class="a-h2" data-reveal>Good nights at Incline.</h2>
    <p class="a-events-intro" data-reveal>Country Fridays, trivia, Sunday brunch and the odd party. Here’s what’s coming up.</p>
    <figure class="a-print a-events-photo" data-reveal="img">${image('band-indoor', 'A band playing under purple stage lights inside the public house.', '(min-width:1000px) 44vw, 100vw')}<figcaption>Live music, indoors</figcaption></figure>
   </div>
   <div class="a-events-list-wrap">
     <ol class="a-event-list a-event-list--light" data-event-list data-limit="4" data-checked="${events.checked}" data-stale-days="${events.staleAfterDays}">${list.map((e, i) => eventRow(e, { hidden: i >= 4 })).join('')}<li class="event-fallback a-event-empty"${list.length ? ' hidden' : ''}><p>${esc(events.emptyNote)}</p></li></ol>
    <div class="a-actions">${button('/whats-on/', 'See everything on')}</div>
   </div>
  </div>
 </section>`;
}

function visit({ site, events, today }) {
  return `<section class="a-section a-visit" aria-labelledby="visit-title">
  <div class="a-wrap a-visit-grid">
   <div class="a-visit-copy">
    ${kicker('Come on over')}
    <h2 id="visit-title" class="a-h2 a-visit-title" data-reveal>931 Tahoe Boulevard</h2>
    <p class="a-visit-address" data-reveal>Incline Village, Nevada 89451.<br>${esc(site.address.landmarkLong)}</p>
    <div class="a-actions" data-reveal>${button(site.links.directions, 'Get directions', { external: true })}${button('tel:' + site.phone.tel, `Call ${site.phone.display}`, { tone: 'ghost', arrow: 'phone' })}</div>
   </div>
   <div class="a-bezel a-hours" data-reveal><div class="a-bezel-in">
    <div class="a-hours-head"><h3>Hours</h3>${todayLine({ site, events, today, cls: 'a-today--small' })}</div>
    <table class="a-hours-table" data-hours data-closures="${esc(JSON.stringify(closures(events.events)))}"><caption class="sr-only">Regular pub hours</caption><tbody>${site.hours.map((h) => `<tr data-day="${h.short}" data-routine-hours="${h.open}–${h.close}"><th scope="row">${h.days}</th><td>${h.open}–${h.close}</td></tr>`).join('')}</tbody></table>
    <p class="a-hours-note">Kitchen closes at 9pm. Last to-go order at 8:45pm.</p>
    ${textLink('/visit/', 'Plan your visit')}
   </div></div>
  </div>
 </section>`;
}

export const homeHead = () => '<link rel="stylesheet" href="/assets/desktop-experiences.css"><link rel="stylesheet" href="/assets/house-story.css"><script src="/assets/desktop-experiences.js" defer></script>';

export function home(ctx) {
  return `${arrival(ctx)}
 ${proof(ctx.site)}
 ${food(ctx)}
 <div class="house-home a-kept">${desktopDrinks({ site: ctx.site })}
 ${mobileBeers()}</div>
 ${seats()}
 ${eventsBand(ctx)}
 <div class="house-home a-kept">${ropeSection()}</div>
 ${visit(ctx)}`;
}
