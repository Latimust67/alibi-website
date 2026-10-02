import { picture, btn, eyebrow, ext, esc, dateParts } from './components.mjs';
import { upcoming, eventRow, closureNotice } from './event-rows.mjs';
import { isFresh } from './hero-today.mjs';

export function whatsOnPage({ site, events, today }) {
  const L = site.links;
  const closedRanges = events.events.filter((e) => e.status === 'closure').map((e) => [e.date, e.endDate || e.date]);
  const list = upcoming(events.events, today).filter((e) => e.status === 'closure' || !closedRanges.some(([from, to]) => e.date >= from && e.date <= to));
  const nextClosure = list.find((e) => e.status === 'closure');
  const stale = !isFresh(events.checked, today, events.staleAfterDays);
  const months = [];
  for (const event of list.filter((e) => e.status !== 'closure')) {
    const p = dateParts(event.date);
    const key = `${p.y}-${p.m}`;
    let month = months.find((m) => m.key === key);
    if (!month) months.push((month = { key, label: `${p.monLong} ${p.y}`, items: [] }));
    month.items.push(event);
  }
  return `
<section class="route-hero events-hero" aria-labelledby="events-title">
  <div class="container route-hero-grid">
    <div class="route-hero-copy">
      <h1 class="page-title" id="events-title">What’s on</h1>
      <p class="page-lead">See what's coming up at Incline Public House.</p>
      <div class="actions">${btn('#upcoming', 'Upcoming events', { iconName: 'arrow-down' })}${btn(L.events, 'View Alibi’s calendar', { variant: 'secondary', external: true })}</div>
    </div>
    <figure class="route-hero-media events-photo">
      ${picture('music-night', { alt: 'People gathered for a live band under the pines and string lights in the Alibi Beer Forest', sizes: '(min-width: 900px) 52vw, 100vw', priority: true, max: 1400 })}
      <figcaption>Live music in the Beer Forest. Photo from a past event.</figcaption>
      <img class="route-detail" src="/assets/art/route-detail.svg" width="300" height="150" alt="" aria-hidden="true">
    </figure>
  </div>
</section>

<section class="section calendar" id="upcoming" aria-labelledby="calendar-title" data-calendar data-checked="${esc(events.checked)}" data-stale-days="${events.staleAfterDays}">
  <div class="container calendar-inner">
    <div class="section-heading calendar-heading">
      <h2 class="section-title" id="calendar-title">Upcoming events</h2>
      <p class="calendar-note" data-events-note>${esc(events.snapshotNote)}</p>
    </div>
    ${nextClosure ? closureNotice(nextClosure, today, 'closure-note') : ''}
    <div class="calendar-stale" data-events-stale${stale ? '' : ' hidden'}><p>See Alibi’s calendar for current events.</p>${ext(L.events, 'View Alibi’s calendar')}</div>
    <div data-event-list${stale ? ' hidden' : ''}>
      ${months.map((month) => `<section class="month" aria-labelledby="month-${month.key}" data-month><h3 class="month-title" id="month-${month.key}">${month.label}</h3><ol class="event-list">${month.items.map(eventRow).join('')}</ol></section>`).join('')}
    </div>
    <div class="events-empty" data-events-empty${!stale && !months.length ? '' : ' hidden'}><p>Check Alibi’s calendar for upcoming events.</p></div>
    <div class="calendar-foot" data-calendar-foot${stale ? ' hidden' : ''}>${btn(L.events, 'View Alibi’s calendar', { external: true })}</div>
  </div>
</section>

<section class="section gathering-section" aria-labelledby="event-gather-title">
  <div class="container split">
    <figure class="gather-photo">${picture('event-hall', { alt: 'Long timber tables leading to the indoor stage in the Incline Public House event hall', sizes: '(min-width: 900px) 52vw, 100vw', max: 1400 })}<figcaption>The event hall at Incline Public House.</figcaption></figure>
    <div class="gather-copy">
      <h2 class="section-title" id="event-gather-title">Bring your group.</h2>
      <p class="body-lg">Tell us about your birthday, team dinner or other gathering.</p>
      <p>${esc(site.gatherings.capacity)}</p>
      <div class="actions">${btn(L.bookEvent, 'Ask about a group event', { external: true })}${btn('/visit/#gatherings', 'Group event details', { variant: 'secondary' })}</div>
    </div>
  </div>
</section>`;
}
