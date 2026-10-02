import { picture, arrowLink, ext } from './components.mjs';
import { upcoming, miniRow, closureNotice } from './event-rows.mjs';
import { isFresh } from './hero-today.mjs';
import { photoRope } from './desktop-experiences.mjs';

const blank = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const art = (file, alt, cls = '') => `<picture class="${cls}"><source media="(max-width: 999px)" srcset="${blank}"><img src="/assets/art/${file}" alt="${alt}" width="2048" height="1024" loading="lazy" decoding="async"></picture>`;
const photo = (key, alt) => picture(key, { alt, sizes: '100vw', max: 1400 }).replace('<picture>', `<picture><source media="(max-width: 999px)" srcset="${blank}">`);

export function cornerScene() {
  return `<section class="desktop-experience corner-experience"  aria-labelledby="corner-scene-title">
    <div data-seats>
      <div class="container corner-scene-header"><div><p class="eyebrow">THREE WAYS TO SETTLE IN</p><h2 id="corner-scene-title">Find your<br>kind of <em>corner.</em></h2></div><div class="corner-scene-choices"><p>Inside, on the deck,<br>or among the pines.</p><div class="seat-controls" aria-label="Choose a seating area">${['Inside', 'The deck', 'Beer Forest'].map((label, i) => `<button type="button" data-seat="${i}" aria-pressed="${i === 0}"><span>0${i + 1}</span>${label}<b aria-hidden="true">↗</b></button>`).join('')}</div>${arrowLink('/visit/#spaces', 'Seating and house details')}</div></div>
      <div class="corner-reveal"><div class="corner-scene-stage"><svg class="corner-draw" viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true"><rect x="8" y="8" width="984" height="484" rx="1" pathLength="1"/></svg>
        <div class="corner-scene-panels">
          <figure data-seat-panel="0">${art('inside-illustration.webp', 'An ink and woodcut interpretation of Alibi’s timber-beamed dining room, communal tables and dark booths.')}<figcaption><strong>Inside</strong><span>Timber beams, shared tables and booths.</span><small>Illustrated interior</small></figcaption></figure>
          <figure data-seat-panel="1">${photo('deck', 'The sunny deck and outdoor bar at Alibi.')}<figcaption><strong>The deck</strong><span>A heated deck, when the weather allows.</span></figcaption></figure>
          <figure data-seat-panel="2">${photo('forest-guests', 'Guests among the pines in Alibi’s Beer Forest.')}<figcaption><strong>Beer Forest</strong><span>Our landscaped garden in the warmer months.</span></figcaption></figure>
        </div>
      </div></div>
    </div>
  </section>`;
}

export function deckScene({ site, events, today }) {
  const fresh = isFresh(events.checked, today, events.staleAfterDays || 14);
  const next = upcoming(events.events, today).filter(e => !['closure', 'cancelled'].includes(e.status) && isFresh(e.checked, today, events.staleAfterDays || 14));
  return `<section class="desktop-experience deck-experience" aria-labelledby="deck-scene-title">
    <div class="container deck-scene-header"><div class="deck-scene-copy"><h2 id="deck-scene-title">Good company.<br>Good <em>plans.</em></h2><p>See what’s coming up at the Public House.</p><div class="actions">${arrowLink('/whats-on/', "See what's on")}${ext(site.links.events, 'View Alibi’s calendar')}</div></div>
      <div class="deck-scene-agenda">${events.events.filter(e => e.status === 'closure').map(e => closureNotice(e, today)).join('')}<div data-event-list data-checked="${events.checked}" data-stale-days="${events.staleAfterDays || 14}" data-limit="3"><ol class="mini-events">${fresh ? next.map(miniRow).join('') : ''}</ol><p class="event-fallback"${fresh && next.length ? ' hidden' : ''}>See Alibi’s calendar for current events.</p></div></div>
    </div>
    <div class="deck-scene-stage">${art('deck-illustration.webp', 'An illustrated Alibi deck, with shade sails, timber rails and the outdoor bar under the pines.', 'deck-scene-art')}<div class="deck-scene-caption"><span>The deck</span><small>Illustrated view</small></div></div>
  </section>`;
}

export function carouselHero() {
  return `<section id="good-company" class="desktop-experience company-hero" aria-labelledby="company-hero-title">
    <div class="container company-hero-header"><div><p class="eyebrow">LIFE AT THE PUBLIC HOUSE</p><h2 id="company-hero-title">You’re in<br><em>good company.</em></h2></div><div class="company-hero-copy"><p>A few moments from around the Public House.</p>${arrowLink('/visit/', 'Plan a visit')}</div></div>
    ${photoRope({ id: 'company-rope', label: 'Life at the Public House' })}
    <div class="container company-hero-footer"><p class="rope-drag-note">Drag to browse the photos.</p></div>
  </section>`;
}
