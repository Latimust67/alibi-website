import { picture, btn, eyebrow, ext, esc } from './components.mjs';
import { closures, closureNotice, upcoming } from './event-rows.mjs';
import { dateLabel, freshnessAttrs, hoursChecked, kitchenCutoff } from './hero-today.mjs';

export function visitPage({ site, events, today }) {
  const nextClosure = upcoming(events.events, today).find((e) => e.status === 'closure');
  const L = site.links;
  const a = site.address;
  const policy = (id) => site.policies.find((p) => p.id === id);
  const spaces = [
    { key: 'dining-hall', title: 'Inside', alt: 'The Alibi dining hall, with timber trusses, communal wooden tables and dark booths', copy: 'Timber beams, shared tables and booths.' },
    { key: 'deck', title: 'The deck', alt: 'Wooden tables and stools on the Alibi deck beneath triangular shade sails and heaters', copy: 'A heated deck, when the weather allows.' },
    { key: 'forest-guests', title: 'Beer Forest', alt: 'People seated among pines, plants and granite boulders in the Alibi Beer Forest', copy: 'Our landscaped garden in the warmer months.' },
  ];
  return `
<section class="route-hero visit-hero" aria-labelledby="visit-title">
  <div class="container route-hero-grid">
    <div class="route-hero-copy">
      <h1 class="page-title" id="visit-title">Plan your visit</h1>
      <p class="page-lead">Find us at 931 Tahoe Blvd., across from Raley’s.</p>
      <div class="actions">${btn(L.directions, 'Get directions', { external: true })}${btn(`tel:${site.phone.tel}`, 'Call the pub', { variant: 'secondary', iconName: 'phone' })}</div>
    </div>
    <figure class="route-hero-media visit-hero-photo">
      ${picture('deck', { alt: 'The charcoal pub and deck, with triangular shade sails, a wooden bar rail and tall pines', sizes: '(min-width: 900px) 52vw, 100vw', priority: true, max: 1400 })}
      <figcaption>The deck at Incline Public House.<div class="visit-house-detail"><img src="/assets/art/visit-house-detail.svg" width="600" height="340" alt="" aria-hidden="true"><span>Illustrated detail</span></div></figcaption>
    </figure>
  </div>
</section>

<section class="section visit-details" id="hours" aria-labelledby="hours-title">
  <div class="container">
    <div class="section-heading"><h2 class="section-title" id="hours-title">Hours &amp; getting here.</h2></div>
    ${nextClosure ? closureNotice(nextClosure, today, 'closure-note') : ''}
    <div class="visit-practical split">
      <div class="hours-block">
        <h3 class="block-title">Opening hours</h3>
        <table class="hours-table" data-hours ${freshnessAttrs(hoursChecked(site, events), today, events.staleAfterDays)} data-closures="${esc(JSON.stringify(closures(events.events)))}"><caption class="sr-only">Regular opening hours for Incline Public House; announced closures take precedence</caption><tbody>${site.hours.map((h) => `<tr data-day="${esc(h.short)}" data-routine-hours="${esc(h.open)}–${esc(h.close)}"><th scope="row">${esc(h.days)}</th><td>${esc(h.open)}–${esc(h.close)}</td></tr>`).join('')}</tbody></table>
        <p class="hours-kitchen" ${freshnessAttrs(hoursChecked(site, events), today, events.staleAfterDays)}>${esc(kitchenCutoff(site))} Choose an available pickup time when you order.</p>
        <p class="fine">Hours last checked ${esc(dateLabel(site.hoursChecked))}. Check Alibi’s website for changes and holiday hours. ${ext(L.officialVenue, "Check today's hours")}</p>
      </div>
      <div class="arrival-block">
        <h3 class="block-title">Address &amp; parking</h3>
        <address class="visit-address">${esc(a.street)}<br>${esc(a.city)}, ${esc(a.region)} ${esc(a.postal)}</address>
        <p>Across from Raley’s, with parking on site and nearby.</p>
        <p><a class="link" href="tel:${esc(site.phone.tel)}">${esc(site.phone.display)}</a></p>
        <div class="actions">${btn(L.directions, 'Get directions', { external: true })}</div>
        <figure class="arrival-photo">${picture('sign-snow', { alt: 'The Alibi sign on Tahoe Boulevard covered in winter snow', sizes: '(min-width: 900px) 28vw, 85vw', max: 1000 })}<figcaption>The Alibi sign on Tahoe Boulevard in winter.</figcaption></figure>
      </div>
    </div>
  </div>
</section>

<section class="section house-spaces" id="spaces" aria-labelledby="spaces-title">
  <div class="container">
    <div class="section-heading"><h2 class="section-title" id="spaces-title">Where to sit</h2><p>Inside, on the deck, or among the pines.</p></div>
    <div class="space-gallery">${spaces.map((space) => `<figure class="space-reference">${picture(space.key, { alt: space.alt, sizes: '(min-width: 900px) 31vw, 100vw', max: 1200 })}<figcaption><h3 class="space-name">${space.title}</h3><p>${space.copy}</p></figcaption></figure>`).join('')}</div>
    <div class="house-notes">
      <dl class="house-policy-list">${['families', 'dogs', 'outdoor'].map(policy).filter(Boolean).map((p) => `<div><dt>${esc(p.label)}</dt><dd>${esc(p.text)}</dd></div>`).join('')}</dl>
      <p>Questions about access? <a class="link" href="tel:${esc(site.phone.tel)}">Call the pub</a>.</p>
      <p class="fine">House details last checked ${esc(dateLabel(site.practicalChecked))}. Outdoor seating depends on the season and weather. ${ext(L.officialVenue, "Alibi’s venue details")}</p>
    </div>
  </div>
</section>

<section class="section gathering-section" id="gatherings" aria-labelledby="gather-title">
  <div class="container split">
    <figure class="gather-photo">${picture('event-hall', { alt: 'The event hall with communal timber tables, an indoor stage and Alibi artwork', sizes: '(min-width: 900px) 52vw, 100vw', max: 1400 })}<figcaption>The event hall at Incline Public House.</figcaption></figure>
    <div class="gather-copy">
      <h2 class="section-title" id="gather-title">Bring your group.</h2>
      <p class="body-lg">Tell us about your birthday, team dinner or other gathering.</p><p>${esc(site.gatherings.capacity)}</p>
      <ul class="fact-list"><li>Indoor stage with house sound and a projector</li><li>Outdoor stage in the Beer Forest</li><li>Open floor plan; no private banquet rooms</li></ul>
      <div class="actions">${btn(L.bookEvent, 'Ask about a group event', { external: true })}${btn('/whats-on/', 'See upcoming events', { variant: 'secondary' })}</div>
    </div>
  </div>
</section>`;
}
