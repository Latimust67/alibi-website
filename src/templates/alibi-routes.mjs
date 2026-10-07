// Menu, What's On and Visit, October 2026 redesign.
import { esc, dateParts } from './components.mjs';
import { upcoming, closures } from './event-rows.mjs';
import { isFresh, freshnessAttrs, hoursChecked } from './hero-today.mjs';
import { copy, button, textLink, eyebrow, kicker, spot, image, todayLine, glyph } from './alibi-shell.mjs';
import { eventRow } from './alibi-home.mjs';

const KITCHEN = 'Kitchen closes at 9pm. Last to-go order at 8:45pm.';
const DIET = { V: 'Vegetarian', VG: 'Vegan', GF: 'Gluten-free' };
const BEER_IDS = ['kolsch', 'ipa', 'lager', 'pale-ale', 'contradiction', 'porter'];

const diets = (d) => (d.diet?.length ? `<span class="a-diets">${d.diet.map((x) => `<abbr class="a-diet" title="${DIET[x]}">${x}</abbr>`).join('')}</span>` : '');
const dishList = (items, cls = '') => `<ul class="a-dishes${cls ? ' ' + cls : ''}">${items.map((d) => `<li class="a-dish"><p class="a-dish-name"><span>${esc(d.name)}</span>${diets(d)}${d.marks?.includes('spicy') ? '<span class="a-dish-mark">Spicy</span>' : ''}</p>${d.desc ? `<p class="a-dish-desc">${esc(d.desc)}</p>` : ''}${d.note ? `<p class="a-dish-note">${esc(d.note)}</p>` : ''}</li>`).join('')}</ul>`;
const pageHero = ({ id, cls, eyebrowText, title, lede, actions, aside, extra = '' }) => `<section class="a-page-hero ${cls}" aria-labelledby="${id}"><div class="a-wrap a-page-hero-grid"><div class="a-page-hero-copy">${eyebrow(eyebrowText)}<h1 id="${id}" class="a-display a-display--page">${title}</h1><p class="a-lede">${lede}</p><div class="a-actions">${actions}</div>${extra}</div>${aside}</div></section>`;
const canPicture = (id, name) => `<picture><source type="image/avif" srcset="/assets/img/desktop-can-${id}-360.avif 360w, /assets/img/desktop-can-${id}-640.avif 640w" sizes="(min-width:1000px) 120px, 22vw"><source type="image/webp" srcset="/assets/img/desktop-can-${id}-360.webp 360w, /assets/img/desktop-can-${id}-640.webp 640w" sizes="(min-width:1000px) 120px, 22vw"><img src="/assets/img/desktop-can-${id}-360.webp" width="740" height="1834" alt="${esc(name)} can" loading="lazy" decoding="async"></picture>`;

// ---------------- Menu ----------------
export function menuPage({ site, menu, events, today }) {
  const [tap, na, cocktails, wine, bottles] = menu.drinks;
  const practical = freshnessAttrs(hoursChecked(site, events), today, events.staleAfterDays);
  const schedule = freshnessAttrs([menu.scheduleChecked || menu.checked, events.exceptionsChecked].sort()[0], today, events.staleAfterDays);
  const groups = [
    ['Food', menu.food.map((c) => [c.id, c.title])],
    ['Drinks', [['drinks', 'On tap'], [na.id, na.title], [cocktails.id, cocktails.title], [wine.id, wine.title]]],
    ['Times', [['happy-hour', 'Happy hour'], ['brunch', 'Brunch']]],
  ];
  const rail = `<nav class="a-menu-rail" aria-label="Menu sections" data-menu-rail><div class="a-menu-rail-in">${groups.map(([g, links]) => `<div class="a-rail-group"><p class="a-rail-label" aria-hidden="true">${g}</p><ul>${links.map(([id, t]) => `<li><a href="#${esc(id)}" data-rail-link>${esc(t)}</a></li>`).join('')}</ul></div>`).join('')}</div></nav>`;
  const SPOTS = { snacks: 'pretzel', pizza: 'pizza', mains: 'burger', greens: 'salad' };
  const category = (c, i) => `<section class="a-menu-cat" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-title" data-menu-section><header class="a-menu-cat-head"><p class="a-menu-cat-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</p><h3 id="${esc(c.id)}-title" class="a-h3">${esc(c.title)}</h3>${c.intro ? `<p class="a-menu-cat-intro">${esc(c.intro)}</p>` : ''}${SPOTS[c.id] ? `<div class="a-cat-spot" aria-hidden="true">${spot(SPOTS[c.id])}</div>` : ''}</header>${dishList(c.items)}</section>`;
  const photoBreak = (key, alt, caption) => `<figure class="a-print a-menu-photo" data-reveal="img">${image(key, alt, '(min-width:1000px) 70vw, 100vw', { max: 1920 })}<figcaption>${caption}</figcaption></figure>`;
  return `${pageHero({
    id: 'menu-title', cls: 'a-page-hero--menu', eyebrowText: 'The menu<span class="a-hide-narrow"> <span aria-hidden="true">·</span> Incline Public House</span>',
    title: 'Good food.<br><em>Alibi on tap.</em>',
    lede: 'Neo-Neapolitan-style pizza, pork belly bao, burgers and big salads, with Alibi beer pouring at the bar.',
    actions: `${button(site.links.order, 'Order pizza to go', { external: true })}${button(site.links.officialMenu, 'Full menu & prices', { tone: 'ghost', external: true })}`,
    extra: `<p class="a-page-hero-fact" ${practical}>${glyph('right', 'a-glyph a-glyph--sm')}${KITCHEN}</p>`,
    aside: `<div class="a-hero-prints"><figure class="a-print a-hero-print a-hero-print--a">${image('pizza-greek', 'A pesto pizza with red onion and olives on a metal tray.', '(min-width:1000px) 44vw, 100vw', { priority: true })}</figure><figure class="a-print a-hero-print a-hero-print--b">${image('sandwich-pint', 'A sandwich and salad beside an Alibi pint.', '(min-width:1000px) 26vw, 50vw')}</figure></div>`,
  })}
 <div class="a-menu-layout a-wrap">
  ${rail}
  <div class="a-menu-body">
   <section class="a-menu-part" id="food" aria-labelledby="food-title"><div class="a-menu-part-head"><h2 id="food-title" class="a-h2">Food</h2><p class="a-menu-source">Selection recorded September 26, 2026. ${textLink(site.links.officialMenu, 'Current menu & prices', { external: true })}</p></div>
    ${menu.food.slice(0, 2).map(category).join('')}
    ${photoBreak('chicken-sandwich', 'A chicken sandwich with fries.', 'Burgers and sandwiches come with fries')}
    ${menu.food.slice(2, 3).map((c) => category(c, 2)).join('')}
    ${photoBreak('food-salad', 'A salad of greens, watermelon radish and tomatoes.', 'Greens &amp; bowls')}
    ${menu.food.slice(3).map((c, i) => category(c, i + 3)).join('')}
    <p class="a-diet-legend">${esc(menu.dietLegend)} ${esc(menu.dietary)}</p>
   </section>
   <section class="a-menu-part a-menu-beer" id="drinks" aria-labelledby="beer-title"><div class="a-menu-part-head"><div class="a-part-title"><h2 id="beer-title" class="a-h2">On tap</h2><span class="a-part-spot" aria-hidden="true">${spot('pint')}</span></div><p class="a-menu-source">${esc(tap.intro)} ${textLink(site.links.beers, 'Meet the beers', { external: true })}</p></div>
    <ul class="a-can-shelf" aria-label="Six Alibi beers">${BEER_IDS.map((id) => { const b = copy.beers.items.find((x) => x.id === id); return `<li>${canPicture(id, b.name)}<span>${esc(b.name)}</span></li>`; }).join('')}</ul>
    <ul class="a-taps">${tap.items.map((b) => `<li class="a-tap"><p class="a-dish-name"><span>${esc(b.name)}</span>${b.abv ? `<span class="a-tap-abv">${esc(b.abv)}</span>` : ''}</p><p class="a-dish-desc">${esc(b.style)}${b.notes ? ` <span class="a-tap-notes">· ${esc(b.notes)}</span>` : ''}</p></li>`).join('')}</ul>
    ${tap.feature ? `<div class="a-bezel a-flight"><div class="a-bezel-in"><p class="a-kicker">Can’t decide?</p><p class="a-flight-name">${esc(tap.feature.name)}</p><p>${esc(tap.feature.desc)}</p></div></div>` : ''}
    <section class="a-menu-cat" id="${esc(bottles.id)}" aria-labelledby="bottles-title"><header class="a-menu-cat-head"><h3 id="bottles-title" class="a-h3">${esc(bottles.title)}</h3><p class="a-menu-cat-intro">${esc(bottles.intro)}</p></header><ul class="a-dishes">${bottles.items.map((b) => `<li class="a-dish"><p class="a-dish-name"><span>${esc(b.name)}</span>${b.abv ? `<span class="a-tap-abv">${esc(b.abv)}</span>` : ''}</p><p class="a-dish-desc">${esc(b.style)}${b.notes ? `, ${esc(b.notes)}` : ''}</p></li>`).join('')}</ul></section>
   </section>
   <section class="a-menu-part" id="other-drinks" aria-labelledby="other-title"><div class="a-menu-part-head"><h2 id="other-title" class="a-h2">Other drinks</h2></div>
    ${[na, cocktails].map((c) => `<section class="a-menu-cat" id="${esc(c.id)}" aria-labelledby="${esc(c.id)}-title"><header class="a-menu-cat-head"><h3 id="${esc(c.id)}-title" class="a-h3">${esc(c.title)}</h3>${c.intro ? `<p class="a-menu-cat-intro">${esc(c.intro)}</p>` : ''}</header>${dishList(c.items)}</section>`).join('')}
    <section class="a-menu-cat" id="${esc(wine.id)}" aria-labelledby="wine-title"><header class="a-menu-cat-head"><h3 id="wine-title" class="a-h3">Wine</h3><p class="a-menu-cat-intro">${esc(wine.intro)}</p></header><div class="a-wine">${wine.groups.map((g) => `<div><h4>${esc(g.label)}</h4><ul>${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></div>`).join('')}</div></section>
   </section>
   <div class="a-menu-times">
    <section class="a-bezel a-time-card" id="happy-hour" aria-labelledby="happy-hour-title"><div class="a-bezel-in"><p class="a-kicker">Weekdays</p><h2 id="happy-hour-title" class="a-h3">Happy hour</h2><p class="a-time-when" ${schedule}>${esc(menu.happyHour.when)}</p><div class="a-time-cols"><div><h3 class="a-time-sub">Snacks</h3>${dishList(menu.happyHour.snacks, 'a-dishes--compact')}</div><div><h3 class="a-time-sub">Drinks</h3>${dishList(menu.happyHour.drinks, 'a-dishes--compact')}</div></div></div></section>
    <section class="a-bezel a-time-card" id="brunch" aria-labelledby="brunch-title"><div class="a-bezel-in"><p class="a-kicker">Sundays</p><h2 id="brunch-title" class="a-h3">${esc(menu.brunch.title)}</h2><p class="a-time-when" ${schedule}>${esc(menu.brunch.when)}</p>${dishList(menu.brunch.items, 'a-dishes--compact')}${menu.brunch.note ? `<p class="a-dish-note">${esc(menu.brunch.note)}</p>` : ''}</div></section>
   </div>
   <aside class="a-pickup" aria-label="Pizza to go"><div><p class="a-kicker">Pizza to go</p><p class="a-pickup-line">Order online, pick it up warm.</p><p class="a-pickup-fine" ${practical}>${KITCHEN} ${esc(menu.toGo)}</p></div>${button(site.links.order, 'Order pizza to go', { external: true, tone: 'gold' })}</aside>
  </div>
 </div>`;
}

// ---------------- What's on ----------------
export function whatsOnPage({ site, events, today }) {
  const fresh = isFresh(events.checked, today, events.staleAfterDays);
  const list = fresh ? upcoming(events.events, today).filter((e) => e.status !== 'closure' && isFresh(e.checked, today, events.staleAfterDays)) : [];
  const next = list.filter((e) => e.status !== 'cancelled');
  // A weekly regular already has its own card below, so the calendar lists only
  // what differs from the routine: one-off nights, trivia, specials and exceptions.
  const regularOf = (e) => events.weekly.find((w) => e.recurring && (w.title.toLowerCase() === e.title.toLowerCase() || (e.kind === 'brunch' && /brunch/i.test(w.title))));
  const calendar = list.filter((e) => e.status === 'cancelled' || !regularOf(e));
  const nextDates = (w) => next.filter((e) => regularOf(e) === w);
  const months = [...new Set(calendar.map((e) => e.date.slice(0, 7)))];
  const monthName = (ym) => dateParts(`${ym}-01`).monLong;
  const nextCard = `<div class="a-next" aria-label="Next up"><p class="a-kicker">Next up</p><ol class="a-next-list" data-event-list data-limit="1" data-checked="${events.checked}" data-stale-days="${events.staleAfterDays}">${next.slice(0, 4).map((e, i) => eventRow(e, { hidden: i > 0 })).join('')}<li class="event-fallback a-event-empty"${next.length ? ' hidden' : ''}><p>${esc(events.emptyNote)}</p></li></ol></div>`;
  return `<section class="a-page-hero a-page-hero--night" aria-labelledby="events-title">
  <div class="a-night-art" aria-hidden="true">${image('music-night', '', '100vw', { max: 1920, priority: true })}</div>
  <div class="a-wrap a-page-hero-grid">
   <div class="a-page-hero-copy">${eyebrow('What’s on<span class="a-hide-narrow"> <span aria-hidden="true">·</span> Incline Public House</span>', 'a-eyebrow--dark')}<h1 id="events-title" class="a-display a-display--page">What’s on<br><em>at Incline.</em></h1><p class="a-lede">Country Fridays, trivia nights, Sunday brunch with football, and a party when the snow’s on its way.</p><div class="a-actions">${button('#upcoming', 'See the calendar', { tone: 'cream', arrow: 'down' })}${button(site.links.events, 'Alibi’s full calendar', { tone: 'ghost-dark', external: true })}</div></div>
   ${nextCard}
  </div>
 </section>
 <section class="a-section a-calendar" id="upcoming" aria-labelledby="calendar-title" data-calendar data-checked="${events.checked}" data-stale-days="${events.staleAfterDays}">
  <div class="a-wrap a-calendar-grid">
   <div class="a-calendar-side"><h2 id="calendar-title" class="a-h2">Coming up</h2><p class="a-menu-source">One-off nights, trivia and anything out of the ordinary. Weekly regulars are listed below. Listings checked October 4, 2026.</p></div>
   <div class="a-calendar-main">
    <ol class="a-months" data-event-list>${months.map((ym) => `<li class="a-month" data-month><h3 class="a-month-name">${monthName(ym)}</h3><ol class="a-event-list a-event-list--light">${calendar.filter((e) => e.date.startsWith(ym)).map((e) => eventRow(e, { detail: true })).join('')}</ol></li>`).join('')}</ol>
    <div class="a-event-empty" data-events-stale${fresh ? ' hidden' : ''}><p>See Alibi’s calendar for current events.</p></div>
    <div class="a-event-empty" data-events-empty${calendar.length || !fresh ? ' hidden' : ''}><p>${esc(events.emptyNote)}</p></div>
    <div class="a-actions" data-calendar-foot>${button(site.links.events, 'Open Alibi’s event calendar', { external: true })}</div>
   </div>
  </div>
 </section>
 <section class="a-section a-regulars" aria-labelledby="regulars-title">
  <div class="a-wrap">
   <div class="a-head a-head--split"><div>${kicker('Every week')}<h2 id="regulars-title" class="a-h2" data-reveal>The regulars</h2></div><p class="a-head-aside" data-reveal>Pub events take priority over games. Check a listing before you plan around it.</p></div>
   <ul class="a-regular-grid">${events.weekly.map((w, i) => `<li class="a-bezel a-regular" data-reveal><div class="a-bezel-in"><p class="a-regular-day">${esc(w.day)}</p><h3 class="a-h3">${esc(w.title)}</h3><p class="a-regular-time">${esc(w.time)}</p><p>${esc(w.detail)}</p>${nextDates(w).length ? `<ol class="a-regular-next" data-event-list data-limit="1" data-checked="${events.checked}" data-stale-days="${events.staleAfterDays}">${nextDates(w).map((e, i) => { const d = dateParts(e.date); return `<li data-event data-date="${e.date}" data-end="${e.date}" data-checked="${e.checked}"${e.endsAt ? ` data-ends-at="${e.endsAt}"` : ''}${i ? ' hidden' : ''}>Next: ${d.dow}, ${d.mon} ${d.d}</li>`; }).join('')}<li class="event-fallback" hidden>See the calendar for dates</li></ol>` : ''}</div></li>`).join('')}</ul>
   <div class="a-season" data-reveal><div class="a-season-spot" aria-hidden="true">${spot('pine')}</div><div><p class="a-kicker">Summer in the Beer Forest</p><h3 class="a-h3">${esc(events.seasonal.title)}</h3><p>${esc(events.seasonal.detail)}</p>${textLink(events.seasonal.url, 'About Tunes on Tap', { external: true })}</div></div>
  </div>
 </section>`;
}

// ---------------- Visit ----------------
export function visitPage({ site, events, today }) {
  const practical = freshnessAttrs(hoursChecked(site, events), today, events.staleAfterDays);
  const policies = site.policies;
  const PARKING = site.policies.find((p) => p.id === 'parking');
  return `<section class="a-page-hero a-page-hero--visit" aria-labelledby="visit-title">
  <div class="a-visit-art">${image('deck-crowd', 'A full deck of guests at long tables under the pines.', '(min-width:1000px) 66vw, 100vw', { priority: true })}</div>
  <div class="a-wrap a-visit-hero-grid">
   <div class="a-page-hero-copy">${eyebrow('Visit <span aria-hidden="true">·</span> 931 Tahoe Blvd.')}<h1 id="visit-title" class="a-display a-display--page">Meet us in<br><em>Incline.</em></h1><p class="a-lede">931 Tahoe Blvd., Incline Village, NV 89451. ${esc(site.address.landmarkLong)}</p><div class="a-actions">${button(site.links.directions, 'Get directions', { external: true })}${button('tel:' + site.phone.tel, `Call ${site.phone.display}`, { tone: 'ghost', arrow: 'phone' })}</div>${todayLine({ site, events, today, cls: 'a-today--hero' })}</div>
   <aside class="a-bezel a-glance" aria-label="At a glance"><div class="a-bezel-in"><p class="a-kicker">At a glance</p><dl><div><dt>Kitchen</dt><dd>Until 9pm daily</dd></div><div><dt>Last to-go order</dt><dd>8:45pm</dd></div><div><dt>Parking</dt><dd>${esc(PARKING.text.replace(/\.$/, ''))}</dd></div><div><dt>Dogs</dt><dd>Leashed, in the Beer Forest and lower patio</dd></div></dl></div></aside>
  </div>
 </section>
 <section class="a-section a-visit-facts" id="hours" aria-labelledby="hours-title">
  <div class="a-wrap a-visit-facts-grid">
   <div class="a-bezel a-hours" data-reveal><div class="a-bezel-in">
    <div class="a-hours-head"><h2 id="hours-title" class="a-h3">Regular hours</h2>${todayLine({ site, events, today, cls: 'a-today--small' })}</div>
    <table class="a-hours-table" data-hours ${practical} data-closures="${esc(JSON.stringify(closures(events.events)))}"><caption class="sr-only">Regular pub hours. Announced closures take precedence.</caption><tbody>${site.hours.map((h) => `<tr data-day="${h.short}" data-routine-hours="${h.open}–${h.close}"><th scope="row">${h.days}</th><td>${h.open}–${h.close}</td></tr>`).join('')}</tbody></table>
    <p class="a-hours-note" ${practical}>${KITCHEN}</p>
    <p class="a-menu-source">Hours checked October 4, 2026. ${textLink(site.links.officialVenue, 'Alibi’s venue details', { external: true })}</p>
   </div></div>
   <div class="a-before">
    ${kicker('Good to know')}
    <h2 class="a-h2" data-reveal>Before you come</h2>
    <dl class="a-policy-list">${policies.filter((p) => p.id !== 'parking').map((p) => `<div class="a-policy" data-reveal><dt>${esc(p.label)}</dt><dd>${esc(p.text)}</dd></div>`).join('')}</dl>
   </div>
  </div>
 </section>
 <section class="a-section a-groups" id="gatherings" aria-labelledby="groups-title">
  <div class="a-wrap a-groups-grid">
   <figure class="a-print a-print--dark" data-reveal="img">${image('event-hall-xl', 'Timber tables and the indoor stage in the event hall.', '(min-width:1000px) 56vw, 100vw')}</figure>
   <div class="a-groups-copy">${kicker('Bringing a group?', 'a-sec-kicker--dark')}<h2 id="groups-title" class="a-h2" data-reveal>Room for the whole crew</h2><p data-reveal>${esc(site.gatherings.capacity)}</p><ul class="a-features">${site.gatherings.features.map((f) => `<li>${esc(f)}</li>`).join('')}</ul><div class="a-actions">${button(site.links.bookEvent, 'Ask about a group event', { tone: 'cream', external: true })}</div></div>
  </div>
 </section>
 <section class="a-section a-arrive" aria-labelledby="arrive-title">
  <div class="a-wrap a-arrive-grid">
   <figure class="a-print a-arrive-photo" data-reveal="img">${image('sign-snow', 'The Alibi sign beside Tahoe Boulevard, dusted with winter snow.', '(min-width:1000px) 42vw, 100vw')}<figcaption>Look for the sign on Tahoe Boulevard.</figcaption></figure>
   <div class="a-arrive-copy">${kicker('Getting here')}<h2 id="arrive-title" class="a-h2" data-reveal>Across from Raley’s</h2>
    <dl class="a-arrive-facts"><div data-reveal><dt>Address</dt><dd>931 Tahoe Blvd., Incline Village, NV 89451</dd></div><div data-reveal><dt>Parking</dt><dd>${esc(PARKING.text)}</dd></div><div data-reveal><dt>Phone</dt><dd><a href="tel:${site.phone.tel}">${site.phone.display}</a></dd></div></dl>
    <div class="a-actions">${button(site.links.directions, 'Get directions', { external: true })}${button(site.links.order, 'Order pizza to go', { tone: 'ghost', external: true })}</div>
   </div>
  </div>
 </section>`;
}
